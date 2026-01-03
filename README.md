# 🚢 Crypto Titanic — ERC-7715 Edition

**MetaMask Hackathon Project - Best Integration Category**

Crypto Titanic is a MetaMask Smart Account–powered game running on **Sepolia Testnet**.
The ship is sinking — and players must decide which tokens to save before it's too late.
Every "rescue" is recorded on-chain through a **gasless Smart Account UserOperation**, proving your conviction without paying gas.

This project demonstrates **Account Abstraction (ERC-4337)** and **Advanced Permissions (ERC-7715)** — including custom calldata composition, bundler execution, agent authorization, and on-chain aggregation — wrapped in a playful, story-driven UX.

---

## 🔑 Advanced Permissions Usage

### 1. Requesting Advanced Permissions
**Code:** [`src/lib/smartAccount.js` (Lines 98-138)](https://github.com/viktorcrypt/crypto_titatic/blob/main/src/lib/smartAccount.js#L98-L138)

Players grant ERC-7715 permissions during onboarding (`BoardingScreen.jsx` line 67):
- Create session account with local signer
- Request permissions for periodic native token transfers
- Store permission context for autonomous operations

### 2. Redeeming Advanced Permissions  
**Code:** [`src/lib/smartAccount.js` (Lines 210-253)](https://github.com/viktorcrypt/crypto_titatic/blob/main/src/lib/smartAccount.js#L210-L253)

Session account executes operations using granted permissions:
- Sends UserOperations with delegation context
- Used by both players and AI agents
- All operations are gasless via Pimlico Paymaster

**Agent Implementation:** [`src/pages/Agent.jsx` (Lines 58-91)](https://github.com/viktorcrypt/crypto_titatic/blob/main/src/pages/Agent.jsx#L58-L91)

AI agents autonomously execute rescues every hour using granted permissions.

---

Best Social Media Presence on X (Twitter)
Twitter: https://x.com/MeganOe75615831

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
- Grant permissions once (native token periodic limits)
- Beautiful ocean-themed UI with animated water & sinking coins

### 2️⃣ **Intro Scene**
- Cinematic intro with animated ship silhouette
- Story: "The year is 2026... The great crypto ship is sinking..."
- Skip button available

### 3️⃣ **Rescue Mission**
- Drag tokens onto the lifeboat (capacity: 100 weight)
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

### **📊 Momentum Trader**
Follows AI agent trends — picks what **other bots are rescuing**

**All agents run autonomously after one-time permission grant!**

---

## 🧰 Tech Stack

- **Frontend:** React + Vite + Tailwind CSS + Framer Motion
- **Blockchain:** Viem + Wagmi
- **Smart Accounts:** MetaMask Smart Accounts Kit (Hybrid Implementation)
- **Permissions:** ERC-7715 Advanced Permissions
- **AA Infrastructure:** ERC-4337 (EntryPoint v0.7)
- **Bundler/Paymaster:** Pimlico
- **Network:** Ethereum Sepolia

---

## 🚀 Getting Started

### Prerequisites
- **MetaMask Flask** (required for ERC-7715)
- Node.js v18+
- Sepolia ETH for testing

### Installation

```bash
git clone https://github.com/viktorcrypt/crypto_titatic.git
cd crypto-titanic

npm install

cp .env.example .env
# Add your Pimlico API key

npm run dev
```

### Environment Variables

```bash
VITE_RPC_URL=https://ethereum-sepolia-rpc.publicnode.com
VITE_PIMLICO_API_KEY=pim_xxxxx
VITE_RESCUELOG_ADDRESS=0x...
```

---

## 🏆 MetaMask Hackathon - Integration Track

This project demonstrates:

✅ **ERC-7715 Advanced Permissions** - one-time grant, autonomous agent operations  
✅ **MetaMask Smart Accounts Kit** - Hybrid implementation  
✅ **Account Abstraction** - ERC-4337 UserOperations  
✅ **Gasless Transactions** - Pimlico Paymaster  
✅ **AI Agent Automation** - 5 strategies with on-chain verification  
✅ **Session Accounts** - local key management  
✅ **Beautiful UX** - ocean-themed UI with smooth animations  

---

## 🌐 Live Demo

**Frontend:** [https://crypto-titatic.vercel.app](https://crypto-titatic.vercel.app)  
**Network:** Sepolia Testnet  
**Wallet:** MetaMask Flask required  

---

## 📝 License

MIT License

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

*Built with ERC-7715 Advanced Permissions*
