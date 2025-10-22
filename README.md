🚢 Crypto Titanic — Monad Mission 8
🧭 Overview

Crypto Titanic is a MetaMask Smart Account–powered dApp built for Monad Mission 8.
The ship is sinking — and players must decide which tokens to save before it’s too late.
Every “rescue” is recorded on-chain through a gasless Smart Account UserOperation, proving your conviction without paying gas.

This project demonstrates Account Abstraction (AA) on Monad Testnet — including custom calldata composition, bundler execution, and on-chain aggregation — wrapped in a playful, story-driven UX.

| Feature                       | Description                                                        |
| ----------------------------- | ------------------------------------------------------------------ |
| Smart Account Integration | MetaMask Smart Account handles all contract calls and signatures.  |
| Gasless Execution         | Rescues are sent through a bundler — no direct EOA gas needed.     |
| On-chain Aggregation      | Contract maintains direct rescue counts (no log scanning).         |
| Live Leaderboard          | getCounts() provides real-time on-chain totals per token.        |
| Polished Monad UI         | A thematic “sinking ship” interface with elegant visuals.          |
| Agent Mode (WIP)          | Will allow users to delegate rescues to an automated strategy bot. |

🎮 Gameplay Concept

“The markets are sinking. Only the brave decide what to save.”

Connect MetaMask Smart Account
– Creates or restores a gasless account on Monad.

Select tokens to rescue
– Choose your survivors (e.g. BTC, SOL, MON, etc.).

Confirm the mission
– Your Smart Account signs & executes the rescue.

Check the Leaderboard
– See global totals updated in real time.

Let the Agent decide for you.

🧰 Stack

React + Vite
Viem
Hardhat
TailwindCSS
MetaMask Smart Accounts
Vercel (deployment)
Monad Testnet RPC (via DRPC)

🧩 Agent Mode

The Agent Mode will introduce automated rescues through delegated strategies —
letting users choose between options like:
“Max Market Cap”
“Underdogs”
“Balanced Mix”
These will generate a deterministic hash of the chosen tokens and submit a gasless rescue, all handled via Smart Account.
The Agent system is currently in development and will be finalized post-Mission 8 submission.

🌐 Live Demo

Frontend: https://crypto-titanic.vercel.app

Contract: 0x72e9C475F9b3bB810fBb0d758c3484Cd52b5db41
