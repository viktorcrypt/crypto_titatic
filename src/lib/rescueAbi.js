// RescueLog Contract on Sepolia
export const RESCUE_LOG_ADDR = "0x51bfB2A08E7680786eD54a00eE4d915Bab6B3867";

export const RESCUE_LOG_ABI = [
  // ========== MAIN FUNCTIONS ==========
  {
    type: "function",
    name: "logRescue",
    stateMutability: "nonpayable",
    inputs: [
      { name: "symbols", type: "string[]" },
      { name: "totalWeight", type: "uint256" },
      { name: "byAgent", type: "bool" },
      { name: "selectionHash", type: "bytes32" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "logRescueByAgent",
    stateMutability: "nonpayable",
    inputs: [
      { name: "user", type: "address" },
      { name: "symbols", type: "string[]" },
      { name: "totalWeight", type: "uint256" },
      { name: "selectionHash", type: "bytes32" },
    ],
    outputs: [],
  },

  // ========== AGENT AUTHORIZATION ==========
  {
    type: "function",
    name: "authorizeAgent",
    stateMutability: "nonpayable",
    inputs: [
      { name: "agent", type: "address" },
      { name: "maxRescues", type: "uint256" },
      { name: "duration", type: "uint256" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "revokeAgent",
    stateMutability: "nonpayable",
    inputs: [
      { name: "agent", type: "address" },
    ],
    outputs: [],
  },

  // ========== VIEW FUNCTIONS ==========
  {
    type: "function",
    name: "getCounts",
    stateMutability: "view",
    inputs: [{ name: "symbols", type: "string[]" }],
    outputs: [{ name: "counts", type: "uint256[]" }],
  },
  {
    type: "function",
    name: "getAgentCounts",
    stateMutability: "view",
    inputs: [{ name: "symbols", type: "string[]" }],
    outputs: [{ name: "counts", type: "uint256[]" }],
  },
  {
    type: "function",
    name: "getAllSymbols",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "string[]" }],
  },
  {
    type: "function",
    name: "getLastRescue",
    stateMutability: "view",
    inputs: [{ name: "user", type: "address" }],
    outputs: [
      { name: "selectionHash", type: "bytes32" },
      { name: "symbols", type: "string[]" },
      { name: "totalWeight", type: "uint256" },
      { name: "byAgent", type: "bool" },
      { name: "timestamp", type: "uint64" },
    ],
  },
  {
    type: "function",
    name: "getAgentAuth",
    stateMutability: "view",
    inputs: [
      { name: "user", type: "address" },
      { name: "agent", type: "address" },
    ],
    outputs: [
      { name: "maxRescues", type: "uint256" },
      { name: "usedRescues", type: "uint256" },
      { name: "expiresAt", type: "uint256" },
      { name: "active", type: "bool" },
    ],
  },
  {
    type: "function",
    name: "getUserStats",
    stateMutability: "view",
    inputs: [{ name: "user", type: "address" }],
    outputs: [
      { name: "totalUserRescues", type: "uint256" },
      { name: "agentUserRescues", type: "uint256" },
      { name: "lastRescueTime", type: "uint64" },
      { name: "lastWasByAgent", type: "bool" },
    ],
  },
  {
    type: "function",
    name: "getGlobalStats",
    stateMutability: "view",
    inputs: [],
    outputs: [
      { name: "total", type: "uint256" },
      { name: "agentTotal", type: "uint256" },
      { name: "uniqueSymbols", type: "uint256" },
    ],
  },

  // ========== PUBLIC VARIABLES ==========
  {
    type: "function",
    name: "symbolCount",
    stateMutability: "view",
    inputs: [{ name: "", type: "string" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    name: "agentSymbolCount",
    stateMutability: "view",
    inputs: [{ name: "", type: "string" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    name: "totalRescues",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    name: "totalAgentRescues",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    name: "rescuesBy",
    stateMutability: "view",
    inputs: [{ name: "", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    name: "agentRescuesBy",
    stateMutability: "view",
    inputs: [{ name: "", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },

  // ========== EVENTS ==========
  {
    type: "event",
    name: "Rescued",
    inputs: [
      { name: "by", type: "address", indexed: true },
      { name: "selectionHash", type: "bytes32", indexed: false },
      { name: "symbols", type: "string[]", indexed: false },
      { name: "totalWeight", type: "uint256", indexed: false },
      { name: "byAgent", type: "bool", indexed: false },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "AgentAuthorized",
    inputs: [
      { name: "user", type: "address", indexed: true },
      { name: "agent", type: "address", indexed: true },
      { name: "maxRescues", type: "uint256", indexed: false },
      { name: "expiresAt", type: "uint256", indexed: false },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "AgentRevoked",
    inputs: [
      { name: "user", type: "address", indexed: true },
      { name: "agent", type: "address", indexed: true },
    ],
    anonymous: false,
  },
];

export const RESCUELOG_ABI = RESCUE_LOG_ABI;
export const RESCUELOG_ADDR = RESCUE_LOG_ADDR;
