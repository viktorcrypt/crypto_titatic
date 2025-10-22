// src/lib/rescueAbi.js

export const RESCUE_LOG_ADDR = "0x578D6936914d01a7d6225401715A4ee75C7D7602";

export const RESCUE_LOG_ABI = [
  {
    type: "function",
    name: "logRescue",
    stateMutability: "nonpayable",
    inputs: [
      { name: "rescuer", type: "address" },
      { name: "symbols", type: "string[]" },
    ],
    outputs: [],
  },
  {
    type: "event",
    name: "Rescued",
    inputs: [
      { name: "rescuer", type: "address", indexed: true },
      { name: "symbols", type: "string[]", indexed: false },
    ],
    anonymous: false,
  },
];

// 👇 совместимость с импортами без подчёркивания
export const RESCUELOG_ABI = RESCUE_LOG_ABI;
export const RESCUELOG_ADDR = RESCUE_LOG_ADDR;
