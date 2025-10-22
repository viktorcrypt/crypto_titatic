export const RESCUE_LOG_ADDR = "0x72e9C475F9b3bB810fBb0d758c3484Cd52b5db41";

export const RESCUE_LOG_ABI = [
  
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
];


export const RESCUELOG_ABI = RESCUE_LOG_ABI;
export const RESCUELOG_ADDR = RESCUE_LOG_ADDR;
