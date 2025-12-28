// src/lib/agents.js
// Agent strategies for automatic rescue operations

/**
 * Available token symbols
 */
const ALL_TOKENS = ['BTC', 'ETH', 'SOL', 'DOGE', 'LINK', 'PEPE', 'TON', 'BNB'];

/**
 * Agent 1: Random Picker 🎲
 * Selects 1 random token every hour
 */
function randomPicker() {
  const randomIndex = Math.floor(Math.random() * ALL_TOKENS.length);
  return [ALL_TOKENS[randomIndex]];
}

/**
 * Agent 2: Blue Chips 💎
 * Always picks ETH and SOL (solid but not too heavy)
 */
function blueChips() {
  return ['ETH', 'SOL'];
}

/**
 * Agent registry
 */
export const AGENTS = {
  random: {
    id: 'random',
    name: '🎲 Random Picker',
    description: 'Picks 1 random token every hour',
    interval: 60 * 60 * 1000, // 1 hour
    selectCoins: randomPicker,
  },
  
  blueChips: {
    id: 'blueChips',
    name: '💎 Blue Chips',
    description: 'Always rescues ETH and SOL (reliable picks)',
    interval: 60 * 60 * 1000, // 1 hour
    selectCoins: blueChips,
  }
};

/**
 * Get agent by ID
 */
export function getAgent(agentId) {
  return AGENTS[agentId];
}

/**
 * Get all available agents
 */
export function getAllAgents() {
  return Object.values(AGENTS);
}

/**
 * Execute agent strategy
 */
export function executeAgentStrategy(agentId) {
  const agent = getAgent(agentId);
  if (!agent) {
    throw new Error(`Agent ${agentId} not found`);
  }
  
  const coins = agent.selectCoins();
  console.log(`[Agent ${agentId}] Selected coins:`, coins);
  
  return {
    coins,
    timestamp: Date.now(),
    agentId,
    agentName: agent.name,
  };
}
