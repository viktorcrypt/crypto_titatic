import {
  createPublicClient,
  http,
  encodeFunctionData,
} from "viem";
import { sepolia } from "viem/chains";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import {
  Implementation,
  toMetaMaskSmartAccount,
} from "@metamask/smart-accounts-kit";
import { erc7715ProviderActions } from "@metamask/smart-accounts-kit/actions";
import { bundlerClientFactory } from "../services/bundlerClient.js";
import { pimlicoClientFactory } from "../services/pimlicoClient.js";

// Sepolia Configuration
const SEPOLIA_RPC = import.meta.env.VITE_RPC_URL || "https://ethereum-sepolia-rpc.publicnode.com";
const SEPOLIA_CHAIN_ID = 11155111;

export const ENTRY_POINT_V07 = "0x0000000071727De22E5E9d8BAf0edAc6f37da032";

export function userOpTrackUrl(hash) {
  return `https://pimlico.io/explorer/userOp?hash=${hash}`;
}

export function sepoliaAddressUrl(addr) {
  return `https://sepolia.etherscan.io/address/${addr}`;
}

export function makePublicClient() {
  return createPublicClient({ 
    chain: sepolia, 
    transport: http(SEPOLIA_RPC) 
  });
}

export function makeCalldata(abi, fn, args) {
  return encodeFunctionData({ abi, functionName: fn, args });
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

// Get or create session key from localStorage
function getSessionKey() {
  if (typeof window === "undefined") return null;
  
  let privKey = localStorage.getItem("crypto_titanic_session_key");
  if (!privKey) {
    privKey = generatePrivateKey();
    localStorage.setItem("crypto_titanic_session_key", privKey);
    console.log("[SA] 🔑 Generated new session key");
  }
  
  return privateKeyToAccount(privKey);
}

/**
 * Creates a session account (Hybrid Smart Account) with a local private key
 * This is the account that will be granted permissions
 */
export async function createSessionAccount(publicClient) {
  console.log("[SA] 🎫 Creating Session Account...");
  
  const account = getSessionKey();
  if (!account) throw new Error("Failed to create session key");
  
  console.log("[SA] 🔑 Session key address:", account.address);

  // Create Hybrid Smart Account - EXACTLY as in their code
  const sessionAccount = await toMetaMaskSmartAccount({
    client: publicClient,
    implementation: Implementation.Hybrid,
    deployParams: [account.address, [], [], []],
    deploySalt: "0x",
    signer: { account },
  });

  console.log("[SA] ✅ Session Account created:", sessionAccount.address);
  return sessionAccount;
}

/**
 * Grants permissions to the session account using WAGMI wallet client
 * User's EOA grants permission to session account to perform operations
 */
export async function grantPermissions(sessionAccount, walletClient, chainId) {
  console.log("[SA] 📜 Granting permissions...");
  
  if (!sessionAccount) {
    throw new Error("Session account not found");
  }

  if (!walletClient) {
    throw new Error("Wallet client not connected");
  }

  try {
    const client = walletClient.extend(erc7715ProviderActions());
    const currentTime = Math.floor(Date.now() / 1000);
    const expiry = currentTime + 24 * 60 * 60 * 30; // 30 days

    const permissions = await client.requestExecutionPermissions([{
      chainId: chainId || SEPOLIA_CHAIN_ID,
      expiry,
      signer: {
        type: "account",
        data: {
          address: sessionAccount.address,
        },
      },
      isAdjustmentAllowed: true,
      permission: {
        type: "native-token-periodic",
        data: {
          periodAmount: 1000000000000000n, // 0.001 ETH in wei
          periodDuration: 86400, // 1 day in seconds
          justification: "Permission for Crypto Titanic rescue operations",
        },
      },
    }]);

    console.log("[SA] ✅ Permissions granted!");
    return permissions[0];
  } catch (error) {
    console.error("[SA] ❌ Permission grant failed:", error);
    throw error;
  }
}

/**
 * Initialize smart account context
 * Returns session account and clients ready to use
 */
export async function initSmartAccountContext(publicClient) {
  console.log("[SA] 🏗️ Init Smart Account Context...");

  // Create session account
  const sessionAccount = await createSessionAccount(publicClient);

  // Create bundler and pimlico clients
  console.log("[SA] 📦 Setup Bundler & Pimlico...");
  const bundlerClient = bundlerClientFactory(SEPOLIA_CHAIN_ID);
  const pimlicoClient = pimlicoClientFactory(SEPOLIA_CHAIN_ID);

  console.log("[SA] 🎉 Context ready!");

  return {
    sessionAccount,
    bundlerClient,
    pimlicoClient,
    publicClient,
    address: sessionAccount.address,
  };
}

/**
 * Sends a regular user operation WITHOUT delegation
 * Use this for normal game flow (no permissions needed)
 */
export async function sendUserOperation(ctx, { to, data, value = 0n }) {
  const { bundlerClient, pimlicoClient, sessionAccount, publicClient } = ctx;
  
  console.log("[SA] 📤 Send regular UserOp (no delegation)...");
  console.log("[SA]   To:", to);
  console.log("[SA]   Session Account:", sessionAccount.address);

  try {
    // Get gas prices
    const { fast: fee } = await pimlicoClient.getUserOperationGasPrice();
    console.log("[SA] ⛽ Gas:", String(fee.maxFeePerGas));

    // Send regular user operation (NO delegation!)
    console.log("[SA] 🚀 Sending regular UserOperation...");
    const hash = await withTimeout(
      bundlerClient.sendUserOperation({
        account: sessionAccount,
        calls: [{ to, data, value }],
        ...fee,
      }),
      30000,
      "sendUserOperation"
    );

    console.log("[SA] ✅ UserOp Hash:", hash);
    console.log("[SA] 🔍 Track:", userOpTrackUrl(hash));

    // Wait for receipt
    const { receipt } = await bundlerClient.waitForUserOperationReceipt({ hash });
    console.log("[SA] ✅ Transaction:", receipt.transactionHash);

    return { 
      hash, 
      txHash: receipt.transactionHash 
    };
  } catch (error) {
    console.error("[SA] ❌ Failed:", error);
    throw error;
  }
}

/**
 * Sends a user operation with delegation
 * Use this for agent flow (requires permissions)
 */
export async function sendCalls(ctx, { to, data, value = 0n }, permission) {
  const { bundlerClient, pimlicoClient, sessionAccount, publicClient } = ctx;
  
  console.log("[SA] 📤 Send UserOp with delegation...");
  console.log("[SA]   To:", to);
  console.log("[SA]   Session Account:", sessionAccount.address);

  if (!permission) {
    throw new Error("No permission granted! Call grantPermissions first.");
  }

  try {
    const { context, signerMeta } = permission;

    if (!signerMeta || !context) {
      throw new Error("Invalid permission data");
    }

    const { delegationManager } = signerMeta;

    // Get gas prices
    const { fast: fee } = await pimlicoClient.getUserOperationGasPrice();
    console.log("[SA] ⛽ Gas:", String(fee.maxFeePerGas));

    // Send user operation with delegation
    console.log("[SA] 🚀 Sending UserOperation with delegation...");
    const hash = await withTimeout(
      bundlerClient.sendUserOperationWithDelegation({
        publicClient,
        account: sessionAccount,
        calls: [{
          to,
          data,
          value,
          permissionsContext: context,
          delegationManager,
        }],
        ...fee,
      }),
      30000,
      "sendUserOperation"
    );

    console.log("[SA] ✅ UserOp Hash:", hash);
    console.log("[SA] 🔍 Track:", userOpTrackUrl(hash));

    // Wait for receipt
    const { receipt } = await bundlerClient.waitForUserOperationReceipt({ hash });
    console.log("[SA] ✅ Transaction:", receipt.transactionHash);

    return { 
      hash, 
      txHash: receipt.transactionHash 
    };
  } catch (error) {
    console.error("[SA] ❌ Failed:", error);
    throw error;
  }
}

export function clearSessionKey() {
  localStorage.removeItem("crypto_titanic_session_key");
  console.log("[SA] 🗑️ Session key cleared");
}

export function clearPermission() {
  localStorage.removeItem("crypto_titanic_permission");
  delete window._permission;
  console.log("[SA] 🗑️ Permission cleared");
}
