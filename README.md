# 🚢 Crypto Titanic — ERC-7715 Edition

**MetaMask Hackathon Project - Best Integration Category**

Crypto Titanic is a MetaMask Smart Account–powered game running on **Sepolia Testnet**.
The ship is sinking — and players must decide which tokens to save before it's too late.
Every "rescue" is recorded on-chain through a **gasless Smart Account UserOperation**, proving your conviction without paying gas.

This project demonstrates **Account Abstraction (ERC-4337)** and **Advanced Permissions (ERC-7715)** — including custom calldata composition, bundler execution, agent authorization, and on-chain aggregation — wrapped in a playful, story-driven UX.

---

## ✨ Features

| Feature                       | Description                                                        |
| ----------------------------- | ------------------------------------------------------------------ |
| **Smart Account Integration** | MetaMask Hybrid Smart Account handles all contract calls.          |
| **Gasless Execution**         | All rescues are gasless via Pimlico Paymaster.                     |
| **Advanced Permissions**      | Agent Mode uses ERC-7715 permissions for automated rescues.        |
| **On-chain Aggregation**      | Contract maintains direct rescue counts (no log scanning).         |
| **Live Leaderboard**          | Real-time on-chain stats per token with human/agent breakdown.     |
| **Sepolia Network**           | Testing environment for ERC-7715 permissions.                      |
| **5 AI Agent Strategies**     | Delegate rescue decisions to automated bots.                       |
| **Ocean UI**                  | Animated water effects, sinking coins, and smooth transitions.     |

---

## 🎮 Gameplay Flow

**"The markets are sinking. Only the brave decide what to save."**

### 1️⃣ **Boarding Screen**
- Connect MetaMask Flask (required for ERC-7715)
- Create session account (Hybrid Smart Account)
- Grant permissions once (ETH + USDC periodic limits)
- Beautiful ocean-themed UI with animated water & sinking coins

### 2️⃣ **Intro Scene**
- Cinematic intro with animated ship silhouette
- Story: "The year is 2026... The great crypto ship is sinking..."
- Skip button available

### 3️⃣ **Rescue Mission**
- Drag tokens onto the lifeboat
- Select from: BTC, ETH, SOL, LINK, DOGE, PEPE, LINEA, MON
- Click "SAVE COIN" → automatic on-chain recording
- Watch the ship sink with trollface easter egg 😈

### 4️⃣ **Success Screen**
- Gasless transaction recorded in background
- Link to Pimlico Explorer
- Options: View Leaderboard 🏆 or Try Agent Strategies 🤖

### 5️⃣ **Leaderboard**
- TOP 3 podium with medals (🥇🥈🥉)
- Full rankings with human/agent breakdown
- Live stats from smart contract

### 6️⃣ **Agent Strategies** (ERC-7715!)
- Activate automated rescue bots
- 5 different strategies available
- Runs every hour, fully autonomous
- All rescues marked as "by agent"

---

## 🤖 AI Agent Strategies

Choose from **5 automated rescue strategies** powered by ERC-7715:

### **🎲 Random Picker**
Randomly selects 2 tokens every hour — pure chaos theory

### **⚖️ Balanced Portfolio**
Diversified picks: 1 heavy cap (BTC/ETH), 1 mid cap (SOL/LINK), 1 small cap (PEPE/MON)

### **📈 Max Market Cap**
Always rescues BTC and ETH — plays it safe with blue chips

### **🎗️ Underdog Supporter**
Champions the forgotten — rescues tokens with the **fewest votes**
- Reads on-chain stats
- Picks TOP 3 with lowest rescue counts
- Gives everyone a chance!

### **📊 Momentum Trader**
Follows AI agent trends — picks what **other bots are rescuing**
- Analyzes agent rescue patterns
- Rides the bot momentum wave
- Smart contract integration for live data

**All agents run autonomously after one-time permission grant!**

---

## 🔗 Deployment Info

**Network:** Sepolia Testnet (Chain ID: 11155111)  
**Contract:** `RescueLog.sol`   
**RPC:** `https://ethereum-sepolia-rpc.publicnode.com`  
**Bundler:** Pimlico  
**Paymaster:** Pimlico (100% gasless)  

---

## 🧰 Tech Stack

- **Frontend:** React + Vite + Tailwind CSS
- **Blockchain:** Viem + Wagmi
- **Smart Accounts:** MetaMask Smart Accounts Kit (Hybrid Implementation)
- **Permissions:** ERC-7715 Advanced Permissions
- **AA Infrastructure:** ERC-4337 (EntryPoint v0.7)
- **Bundler/Paymaster:** Pimlico
- **Network:** Ethereum Sepolia
- **Animations:** Framer Motion

---

## 🚀 Getting Started

### Prerequisites
- **MetaMask Flask** (required for ERC-7715)
  - Download: [metamask.io/flask](https://metamask.io/flask/)
- Node.js v18+
- Some Sepolia ETH (for initial setup)
- Sepolia USDC (for testing rescues)

### Installation

```bash
# Clone repository
git clone https://github.com/viktorcrypt/crypto_titatic.git
cd crypto-titanic

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Add your Pimlico API key

# Run development server
npm run dev
```

### Environment Variables

```bash
VITE_RPC_URL=https://ethereum-sepolia-rpc.publicnode.com
VITE_PIMLICO_API_KEY=pim_xxxxx
VITE_RESCUELOG_ADDRESS=0x...
```

---

## 📊 Smart Contract Functions

### Core Rescue Functions
```solidity
// Record a rescue (human or agent)
function logRescue(
  string[] memory symbols,
  uint256 totalWeight,
  bool byAgent,
  bytes32 selectionHash
)

// Get rescue counts for tokens
function getCounts(string[] memory symbols) 
  returns (uint256[] memory)

// Get agent-specific counts
function getAgentCounts(string[] memory symbols) 
  returns (uint256[] memory)
```

### Events
```solidity
event Rescued(
  address indexed by,
  bytes32 indexed selectionHash,
  string[] symbols,
  uint256 totalWeight,
  bool byAgent,
  uint256 timestamp
)
```


## 🏆 MetaMask Hackathon - Integration Track

This project demonstrates:

1. ✅ **ERC-7715 Advanced Permissions** (one-time grant, autonomous operations)
2. ✅ **MetaMask Smart Accounts Kit** (Hybrid implementation)
3. ✅ **Account Abstraction** (ERC-4337 UserOperations)
4. ✅ **Gasless Transactions** (Pimlico Paymaster)
5. ✅ **Agent Automation** (5 AI strategies with on-chain verification)
6. ✅ **Session Accounts** (local key management)
7. ✅ **Production-Ready** (error handling, activity logs, beautiful UI)

---

## 🌐 Live Demo

**Frontend:** [https://crypto-titatic.vercel.app](https://crypto-titatic.vercel.app)  
**Network:** Sepolia Testnet  
**Wallet:** MetaMask Flask required  

---


## 📝 License

MIT License - see [LICENSE](LICENSE) file

---

## 🙏 Acknowledgments

- **MetaMask** for ERC-7715 Advanced Permissions and Smart Accounts Kit
- **Pimlico** for gasless transaction infrastructure
- **Viem** and **Wagmi** for excellent developer tools
- **Framer Motion** for smooth animations

---

## 📞 Contact

- **GitHub:** [github.com/viktorcrypt/crypto_titatic](https://github.com/viktorcrypt/crypto_titatic)
- **Demo:** [crypto-titatic.vercel.app](https://crypto-titatic.vercel.app)

---

**🚢 The ship is sinking. Who will you save? 🚢**


