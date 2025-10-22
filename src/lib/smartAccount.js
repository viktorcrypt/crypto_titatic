// src/lib/smartAccount.js
import {
  createPublicClient,
  createWalletClient,
  http,
  custom,
  encodeFunctionData,
} from "viem";
import {
  createBundlerClient,
  createPaymasterClient,
} from "viem/account-abstraction";
import { monadTestnet } from "./chain";
import {
  Implementation,
  toMetaMaskSmartAccount,
} from "@metamask/delegation-toolkit";
import { getEip1193Provider } from "./fcProvider";

// ===== ENV
const RPC = import.meta.env.VITE_MONAD_RPC; // <- обычный RPC (Alchemy/другой публичный), НЕ Pimlico
const PIMLICO_CHAIN = import.meta.env.VITE_PIMLICO_CHAIN || "10143";
const PIMLICO_API_KEY = import.meta.env.VITE_PIMLICO_API_KEY;
const PIMLICO_RPC = import.meta.env.VITE_BUNDLER_URL || `https://api.pimlico.io/v2/${PIMLICO_CHAIN}/rpc?apikey=${PIMLICO_API_KEY}`;

if (!RPC) throw new Error("Missing VITE_MONAD_RPC");
if (!PIMLICO_API_KEY) throw new Error("Missing VITE_PIMLICO_API_KEY");

export const ENTRY_POINT_V07 = "0x0000000071727De22E5E9d8BAf0edAc6f37da032";

export function userOpTrackUrl(hash) {
  return `https://pimlico.io/explorer/userOp?hash=${hash}`;
}
export function monadAddressUrl(addr) {
  return `https://testnet.monadexplorer.com/address/${addr}`;
}
export function makePublicClient() {
  return createPublicClient({ chain: monadTestnet, transport: http(RPC) });
}
export function makeCalldata(abi, fn, args) {
  return encodeFunctionData({ abi, functionName: fn, args });
}

async function ensureMonadChain(eip1193) {
  const targetHex = `0x${monadTestnet.id.toString(16)}`; // 0x279f
  const current = await eip1193.request({ method: "eth_chainId" });
  if (current === targetHex) return;
  try {
    await eip1193.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: targetHex }],
    });
  } catch (err) {
    if (err?.code === 4902) {
      await eip1193.request({
        method: "wallet_addEthereumChain",
        params: [{
          chainId: targetHex,
          chainName: "Monad Testnet",
          rpcUrls: [RPC],
          nativeCurrency: { name: "MON", symbol: "MON", decimals: 18 },
          blockExplorerUrls: ["https://testnet.monadexplorer.com/"],
        }],
      });
      await eip1193.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: targetHex }],
      });
    } else {
      throw err;
    }
  }
}

function withTimeout(promise, ms, label) {
  let t;
  const timeout = new Promise((_, rej) =>
    (t = setTimeout(() => rej(new Error(`${label} timeout after ${ms}ms`)), ms))
  );
  return Promise.race([
    promise.finally(() => clearTimeout(t)),
    timeout,
  ]);
}

async function getPimlicoGas(bundler) {
  try {
    if (typeof bundler.getUserOperationGasPrice === "function") {
      const res = await bundler.getUserOperationGasPrice();
      const pick = (o) => o?.standard ?? o?.fast ?? o?.slow ?? o;
      const tier = pick(res);
      return {
        maxFeePerGas: BigInt(tier.maxFeePerGas),
        maxPriorityFeePerGas: BigInt(tier.maxPriorityFeePerGas),
      };
    }
    const rpc = await bundler.request({ method: "pimlico_getUserOperationGasPrice", params: [] });
    const tier = rpc?.standard ?? rpc?.fast ?? rpc?.slow ?? rpc;
    return {
      maxFeePerGas: BigInt(tier.maxFeePerGas),
      maxPriorityFeePerGas: BigInt(tier.maxPriorityFeePerGas),
    };
  } catch (e) {
    console.warn("[gas] fallback:", e?.message || e);
    return { maxFeePerGas: 200_000_000_000n, maxPriorityFeePerGas: 2_000_000_000n };
  }
}

export async function initSmartAccount() {
  console.log("[SA] init start");
  const eip1193 = await getEip1193Provider();

  console.log("[SA] ensure chain…");
  await ensureMonadChain(eip1193);

  console.log("[SA] build wallet clients…");
  const tmpClient = createWalletClient({ chain: monadTestnet, transport: custom(eip1193) });
  const [ownerAddress] = await tmpClient.requestAddresses();
  const walletClient = createWalletClient({
    account: ownerAddress,
    chain: monadTestnet,
    transport: custom(eip1193),
  });

  console.log("[SA] public client ping…");
  const publicClient = makePublicClient();
  await withTimeout(publicClient.getChainId(), 4000, "publicClient.getChainId");

  console.log("[SA] toMetaMaskSmartAccount…");
  const smartAccount = await toMetaMaskSmartAccount({
    client: publicClient,
    implementation: Implementation.Hybrid,
    deployParams: [ownerAddress, [], [], []],
    deploySalt: "0x",
    signer: { walletClient },
    chain: monadTestnet,
  });

  console.log("[SA] getCode (is deployed?)…", smartAccount.address);
  let code = "0x";
  try {
    code = await withTimeout(
      publicClient.getCode({ address: smartAccount.address }),
      5000,
      "publicClient.getCode"
    );
  } catch (e) {
    console.warn("[SA] getCode warn:", e.message || e);
  }

  if (!code || code === "0x") {
    console.log("[SA] NOT deployed. Manual deploy via EOA (factory) …");
    const { factory, factoryData } = await smartAccount.getFactoryArgs();
    const tx = await walletClient.sendTransaction({ to: factory, data: factoryData });
    console.log("[SA] deploy tx:", tx);
    await publicClient.waitForTransactionReceipt({ hash: tx });
    smartAccount.initCode = "0x";
    console.log("[SA] deployed via EOA ✅");
  } else {
    smartAccount.initCode = "0x";
    console.log("[SA] already deployed ✅");
  }

  console.log("[SA] create bundler/paymaster clients…");
  const bundler = createBundlerClient({
    client: publicClient,
    entryPoint: ENTRY_POINT_V07,
    transport: http(PIMLICO_RPC),
  });
  const paymaster = createPaymasterClient({
    chain: monadTestnet,
    transport: http(PIMLICO_RPC),
  });

  console.log("[SA] init done");
  return { smartAccount, bundler, paymaster, address: smartAccount.address };
}

export async function sendCalls(ctx, { to, data, value = 0n }) {
  const { bundler, smartAccount, paymaster } = ctx;
  console.log("[SA] sendUserOperation preparing…");
  const { maxFeePerGas, maxPriorityFeePerGas } = await getPimlicoGas(bundler);
  console.log("[SA] gas", { maxFeePerGas: String(maxFeePerGas), maxPriorityFeePerGas: String(maxPriorityFeePerGas) });

  const hash = await withTimeout(
    bundler.sendUserOperation({
      account: smartAccount,
      calls: [{ to, data, value }],
      maxFeePerGas,
      maxPriorityFeePerGas,
      paymaster,
    }),
    20000,
    "sendUserOperation"
  );

  console.log("[SA] userOp submitted:", hash);
  return { hash };
}
