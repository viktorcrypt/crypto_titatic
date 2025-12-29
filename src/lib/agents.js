import { createPublicClient, http } from "viem";
import { sepolia } from "viem/chains";
import { RESCUE_LOG_ABI, RESCUE_LOG_ADDR } from "./rescueAbi.js";
import { TOKENS } from "./tokens.js";

const SEPOLIA_RPC = "https://ethereum-sepolia-rpc.publicnode.com";
const ALL_TOKENS = TOKENS.map(t => t.symbol);


async function fetchStats() {
  try {
    const client = createPublicClient({
      chain: sepolia,
      transport: http(SEPOLIA_RPC),
    });

    const symbols = ALL_TOKENS;
    
    const counts = await client.readContract({
      address: RESCUE_LOG_ADDR,
      abi: RESCUE_LOG_ABI,
      functionName: "getCounts",
      args: [symbols],
    });

    const agentCounts = await client.readContract({
      address: RESCUE_LOG_ADDR,
      abi: RESCUE_LOG_ABI,
      functionName: "getAgentCounts",
      args: [symbols],
    });

    return symbols.map((s, i) => ({
      symbol: s,
      count: Number(counts[i] ?? 0),
      agentCount: Number(agentCounts[i] ?? 0),
      humanCount: Number(counts[i] ?? 0) - Number(agentCounts[i] ?? 0),
    }));
  } catch (e) {
    console.error('[Agents] Failed to fetch stats:', e);
    
    return ALL_TOKENS.map(s => ({ symbol: s, count: 0, agentCount: 0, humanCount: 0 }));
  }
}


function randomPicker() {
  const shuffled = [...ALL_TOKENS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 2);
}


function balancedPortfolio() {
  const heavy = ['BTC', 'ETH'];
  const medium = ['SOL', 'LINK'];
  const light = ['PEPE', 'MON', 'DOGE'];
  
  const pick1 = heavy[Math.floor(Math.random() * heavy.length)];
  const pick2 = medium[Math.floor(Math.random() * medium.length)];
  const pick3 = light[Math.floor(Math.random() * light.length)];
  
  return [pick1, pick2, pick3];
}


function maxMarketCap() {
  return ['BTC', 'ETH'];
}


async function underdogSupporter() {
  const stats = await fetchStats();
  
  
  stats.sort((a, b) => a.count - b.count);
  
  
  return stats.slice(0, 3).map(s => s.symbol);
}


async function momentumTrader() {
  const stats = await fetchStats();
  
 
  stats.sort((a, b) => b.agentCount - a.agentCount);
  
  
  return stats.slice(0, 3).map(s => s.symbol);
}


export const AGENTS = {
  random: {
    id: 'random',
    name: '🎲 Random Picker',
    description: 'Randomly selects 2 tokens - pure chaos theory',
    interval: 60 * 60 * 1000, 
    selectCoins: randomPicker,
  },
  
  balanced: {
    id: 'balanced',
    name: '⚖️ Balanced Portfolio',
    description: 'Diversified picks: 1 heavy cap, 1 mid cap, 1 small cap',
    interval: 60 * 60 * 1000,
    selectCoins: balancedPortfolio,
  },

  maxCap: {
    id: 'maxCap',
    name: '📈 Max Market Cap',
    description: 'Always rescues BTC and ETH - plays it safe',
    interval: 60 * 60 * 1000,
    selectCoins: maxMarketCap,
  },

  underdog: {
    id: 'underdog',
    name: '🎗️ Underdog Supporter',
    description: 'Champions the forgotten - rescues tokens with fewest votes',
    interval: 60 * 60 * 1000,
    selectCoins: underdogSupporter,
  },

  momentum: {
    id: 'momentum',
    name: '📊 Momentum Trader',
    description: 'Follows AI agent trends - picks what other bots are rescuing',
    interval: 60 * 60 * 1000,
    selectCoins: momentumTrader,
  },
};


export function getAgent(agentId) {
  return AGENTS[agentId];
}


export function getAllAgents() {
  return Object.values(AGENTS);
}


export async function executeAgentStrategy(agentId) {
  const agent = getAgent(agentId);
  if (!agent) {
    throw new Error(`Agent ${agentId} not found`);
  }
  
  const coins = await agent.selectCoins();
  console.log(`[Agent ${agentId}] Selected coins:`, coins);
  
  return {
    coins,
    timestamp: Date.now(),
    agentId,
    agentName: agent.name,
  };
}
