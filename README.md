# 🚢 Crypto Titanic — Base Edition with Advanced Permissions

**MetaMask Hackathon Project - Best Integration Category**

Crypto Titanic is a MetaMask Smart Account–powered dApp now running on **Base Mainnet**.
The ship is sinking — and players must decide which tokens to save before it's too late.
Every "rescue" is recorded on-chain through a gasless Smart Account UserOperation, proving your conviction without paying gas.

This project demonstrates **Account Abstraction (AA)** and **Advanced Permissions (ERC-7715)** on Base — including custom calldata composition, bundler execution, agent authorization, and on-chain aggregation — wrapped in a playful, story-driven UX.

## ✨ Features

| Feature                       | Description                                                        |
| ----------------------------- | ------------------------------------------------------------------ |
| **Smart Account Integration** | MetaMask Smart Account handles all contract calls and signatures.  |
| **Gasless Execution**         | Rescues are sent through a bundler — no direct EOA gas needed.     |
| **Advanced Permissions**      | Agent Mode uses permissions to automate rescues on your behalf.    |
| **On-chain Aggregation**      | Contract maintains direct rescue counts (no log scanning).         |
| **Live Leaderboard**          | Real-time on-chain totals per token with agent statistics.         |
| **Base Network**              | Fast, cheap L2 transactions on Base Mainnet.                       |
| **Agent Authorization**       | Delegate rescue operations to automated strategies.                |

## 🎮 Gameplay Concept

**"The markets are sinking. Only the brave decide what to save."**

1. **Connect MetaMask Smart Account** — Creates or restores a gasless account on Base
2. **Select tokens to rescue** — Choose your survivors (e.g. BTC, SOL, ETH, etc.)
3. **Confirm the mission** — Your Smart Account signs & executes the rescue
4. **Check the Leaderboard** — See global totals updated in real time
5. **Let the Agent decide** — Authorize an agent with Advanced Permissions to rescue automatically

## 🔗 Deployment Info

**Network:** Base Mainnet (Chain ID: 8453)
**Contract:** `0xE01C708c00d5D7210e2b133EbD2358B6F16f6333`
**Explorer:** [View on Basescan](https://basescan.org/address/0xE01C708c00d5D7210e2b133EbD2358B6F16f6333)

## 🧰 Tech Stack

- **React + Vite** — Fast modern frontend
- **Viem** — Ethereum interactions
- **TailwindCSS** — Styling
- **MetaMask Smart Accounts** — Account abstraction
- **MetaMask Advanced Permissions** — Agent authorization
- **Base** — L2 scaling solution
- **Pimlico** — Bundler & Paymaster services

## 🤖 Agent Mode with Advanced Permissions

Agent Mode introduces **automated rescues through delegated permissions**:

### How it works:
1. User authorizes an agent with specific limits (e.g., "5 rescues per week")
2. Agent can execute rescues automatically based on strategies:
   - **🧠 Balanced** — Fair mix of strong and weak coins
   - **🚀 Max Market Cap** — Focus on top projects
   - **🐢 Underdogs** — Prefer smaller, riskier coins
   - **🎲 Random** — Let fate decide
3. All agent actions are recorded on-chain with `byAgent` flag
4. Users can revoke agent access anytime

### Smart Contract Functions:
- `authorizeAgent(agent, maxRescues, duration)` — Grant permissions
- `revokeAgent(agent)` — Remove permissions
- `logRescueByAgent(user, symbols, totalWeight, hash)` — Agent executes rescue
- `getAgentAuth(user, agent)` — Check agent status

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- MetaMask (with Base network added)
- Some ETH on Base for gas (or use paymaster)

### Installation

```bash
# Clone repo
git clone https://github.com/viktorcrypt/crypto_titatic.git
cd crypto-titanic

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your Pimlico API key

# Run dev server
npm run dev
```

### Environment Variables

```bash
VITE_BASE_RPC=https://mainnet.base.org
VITE_PIMLICO_CHAIN=8453
VITE_PIMLICO_API_KEY=your_pimlico_api_key
VITE_RESCUELOG_ADDRESS=0xE01C708c00d5D7210e2b133EbD2358B6F16f6333
VITE_BUNDLER_URL=https://api.pimlico.io/v2/8453/rpc?apikey=your_key
```

## 📊 Smart Contract Features

### Main Functions
- `logRescue(symbols, totalWeight, byAgent, hash)` — Record a rescue
- `logRescueByAgent(user, symbols, totalWeight, hash)` — Agent rescue
- `getCounts(symbols)` — Get rescue counts for symbols
- `getAgentCounts(symbols)` — Get agent-specific counts
- `getUserStats(user)` — Get user statistics
- `getGlobalStats()` — Get global statistics

### Events
- `Rescued(by, selectionHash, symbols, totalWeight, byAgent)` — Rescue recorded
- `AgentAuthorized(user, agent, maxRescues, expiresAt)` — Agent authorized
- `AgentRevoked(user, agent)` — Agent revoked

## 🏆 MetaMask Hackathon - Integration Track

This project qualifies for the **Best Integration - Existing Project** track by:

1. ✅ Using **MetaMask Advanced Permissions** (ERC-7715)
2. ✅ Integrating **Smart Accounts Kit**
3. ✅ Running on **Base** (EIP-7702 supported chain)
4. ✅ Demonstrating **Advanced Permissions in Agent Mode**
5. ✅ Working demo with on-chain verification

## 🌐 Live Demo

**Frontend:** [https://crypto-titatic.vercel.app](https://crypto-titatic.vercel.app)
**Contract:** [View on Basescan](https://basescan.org/address/0xE01C708c00d5D7210e2b133EbD2358B6F16f6333)

## 📝 License

MIT

## 🙏 Acknowledgments

- MetaMask team for Smart Accounts Kit and Advanced Permissions
- Base for providing a fast, affordable L2
- Pimlico for bundler infrastructure
- Community feedback and testing

---

**Built with ❤️ for the MetaMask Hackathon**
