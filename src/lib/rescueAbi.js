// ПОДТВЕРДИ адрес — тот, что ты прислал ранее (RescueLog на Monad testnet)
export const RESCUE_LOG_ADDR = "0x578D6936914d01a7d6225401715A4ee75C7D7602";

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

// алиасы, если где-то импортируются старые имена
export const RESCUELOG_ABI = RESCUE_LOG_ABI;
export const RESCUELOG_ADDR = RESCUE_LOG_ADDR;
