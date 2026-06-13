# MetaPilot Hackathon Integration & Requirements Checklist

## Active Hackathons

### 1. MetaMask Smart Accounts Kit x 1Shot API x Venice AI Dev Cook Off
**Status**: 1 day left | **Prize Pool**: $14,000 USD

#### Core Requirements
- [ ] **Integrate MetaMask Smart Accounts Kit**
  - [ ] Use MetaMask Smart Accounts or Advanced Permissions (ERC-7715)
  - [ ] Implement signer-agnostic account system
  - [ ] Support MetaMask extension, Embedded Wallets, Dynamic, or Privy
  
- [ ] **Implement 1Shot Permissionless Relayer**
  - [ ] Gas abstraction for EIP-7710 smart accounts
  - [ ] No signup/business account required
  - [ ] Direct JSON-RPC integration
  - [ ] Production: ~$500/mo optimal throughput
  
- [ ] **Integrate Venice AI**
  - [ ] Use 200+ frontier/open-source models
  - [ ] Implement via Venice API or staking
  - [ ] Support text, image, video, code, audio models
  - [ ] Privacy-first implementation

#### Prize Tracks ($14,000 Total)
- **Best x402 + ERC-7710**: $3,000
- **Best Agent**: $3,000
- **Best A2A coordination**: $3,000
- **Best use of Venice AI**: $3,000
- **Best Use of 1Shot Permissionless Relayer**: $1,000 USDC
- **Best Social Media presence**: $500 (5x $100)
- **Best Feedback**: $500 (5x $100)

#### Demo Requirements
- [ ] Working demo video showing MetaMask integration
- [ ] Integration demonstrated in main application flow
- [ ] Agent system operational
- [ ] Permission system functional

#### Implementation Checklist
- [ ] MetaMask Smart Accounts Kit setup
- [ ] ERC-7715 Advanced Permissions implementation
- [ ] 1Shot Relayer integration
- [ ] Venice AI model integration
- [ ] Agent orchestration system
- [ ] Demo video prepared
- [ ] Documentation complete
- [ ] Code deployed and tested

---

### 2. Arbitrum Open House London: Online Buildathon
**Status**: 1 day left | **Prize Pool**: $115,000 USD (70K prizes + 30K grants + IRL opportunities)

#### Core Requirements
- [ ] **Build on Arbitrum**
  - [ ] Deploy on Arbitrum One mainnet
  - [ ] OR deploy on custom Arbitrum chain
  - [ ] Support Solidity or Rust (Arbitrum Stylus)
  
- [ ] **Choose Application Category**
  - [ ] DeFi Protocol
  - [ ] Gaming Application
  - [ ] Social Application
  - [ ] DePin (Decentralized Physical Infrastructure)
  - [ ] Novel/Innovative Category

#### Prize Tracks ($115,000 Total)
- **Overall Prize Pool**: $70,000 USDC
- **Best Agentic Project**: $15,000 USDC
- **Grants**: $30,000 USDC
- **IRL Opportunities**: Top 3 teams → Founder House London (June)
  - 4-day intensive mentorship
  - Connect with Arbitrum technical team
  - Meet successful ecosystem founders
  - Real paths to funding

#### Technical Requirements
- [ ] Solidity smart contract development
- [ ] OR Rust/Arbitrum Stylus implementation
- [ ] Web3.js or Ethers.js integration
- [ ] Arbitrum One RPC integration (https://arb1.arbitrum.io/rpc)
- [ ] Agentic AI system (for track points)

#### Submission Checklist
- [ ] Working application deployed on Arbitrum
- [ ] GitHub repository with source code
- [ ] Comprehensive README with deployment instructions
- [ ] Demo/walkthrough video
- [ ] Documentation of architecture
- [ ] Gas optimization proof (for performance)
- [ ] Team information

---

## MetaPilot Specific Integration Needs

### Current Implementation Status
- [x] Wallet connection (MetaMask)
- [x] Balance fetching (mock data)
- [ ] **Live blockchain balance integration**
- [ ] Smart Account integration
- [ ] 1Shot Relayer setup
- [ ] Venice AI integration
- [ ] Agentic transaction routing

### Required Dependencies
```json
{
  "ethers": "^6.0.0",
  "@metamask/smart-accounts-kit": "latest",
  "@1shot-labs/sdk": "latest",
  "venice-ai-sdk": "latest"
}
```

### Critical Implementation Steps

#### Phase 1: Live Balance Fetching (Current Sprint)
1. [ ] Fetch ETH balance via ethers.js
2. [ ] Fetch ERC20 token balances (WBTC, USDT, ARB)
3. [ ] Update UI with real data
4. [ ] Add balance refresh functionality
5. [ ] Cache balances with 30s TTL

**Files to Update**:
- `src/utils/cryptoHelpers.ts` - Add live fetch functions
- `src/App.tsx` - Hook balance fetch on wallet connect
- `src/components/SpeculosEmulator.tsx` - Display real balances

#### Phase 2: MetaMask Smart Accounts Integration
1. [ ] Install `@metamask/smart-accounts-kit`
2. [ ] Setup Smart Account provider
3. [ ] Implement ERC-7715 Advanced Permissions
4. [ ] Create permission request UI
5. [ ] Execute transactions via smart accounts

**Files to Create**:
- `src/services/smartAccounts.ts` - Smart Account helpers
- `src/components/SmartAccountPermissions.tsx` - Permission request UI

#### Phase 3: 1Shot Relayer Integration
1. [ ] Setup 1Shot JSON-RPC endpoint
2. [ ] Implement gas abstraction layer
3. [ ] Add transaction submission via relayer
4. [ ] Handle transaction status tracking
5. [ ] Display gas-less transaction feedback

**Files to Create**:
- `src/services/relayer.ts` - 1Shot integration
- `src/backend/routes/relay.js` - Relayer endpoints

#### Phase 4: Venice AI Integration
1. [ ] Setup Venice API client
2. [ ] Implement AI model selection
3. [ ] Create AI-powered yield recommendations
4. [ ] Add AI agent orchestration
5. [ ] Route transactions through AI decision system

**Files to Create**:
- `src/services/veniceAI.ts` - Venice AI integration
- `src/backend/services/aiAgent.js` - Agent logic

---

## Checklist for Demo Video

### MetaMask Hackathon Demo Script
1. [ ] Wallet connection with MetaMask
2. [ ] Show Advanced Permissions request
3. [ ] Execute transaction without individual signatures
4. [ ] Demonstrate A2A (Agent-to-Agent) coordination
5. [ ] Show Venice AI yield recommendations
6. [ ] Execute yield strategy automatically
7. [ ] Display transaction receipt
8. [ ] Highlight gas savings via 1Shot relayer

**Duration**: ~3-5 minutes

### Arbitrum Hackathon Demo Script
1. [ ] Show application interface
2. [ ] Demonstrate DeFi/Gaming/Social functionality
3. [ ] Show Arbitrum One deployment
4. [ ] Demonstrate transaction speed vs Ethereum
5. [ ] Show gas cost savings
6. [ ] Display smart contracts on Arbiscan
7. [ ] Show AI agent optimization (if applicable)

**Duration**: ~2-3 minutes

---

## Resource Links

### MetaMask Smart Accounts Kit
- Docs: https://docs.metamask.io/wallet/smart-accounts/
- GitHub: https://github.com/MetaMask/smart-accounts-kit
- Examples: https://github.com/MetaMask/smart-accounts-kit/examples

### 1Shot API
- Docs: https://1shot.fi/docs
- Relayer: https://relayer.1shot.fi
- GitHub: https://github.com/1ShotLabs/sdk

### Venice AI
- Platform: https://venice.ai
- API Docs: https://docs.venice.ai
- Models: https://venice.ai/models

### Arbitrum Stylus
- Docs: https://docs.arbitrum.io/stylus
- Rust Examples: https://github.com/arbitrum-examples/stylus

---

## Success Metrics

### For MetaMask Hackathon
- ✅ MetaMask integration working
- ✅ Permission system operational
- ✅ AI agent making autonomous decisions
- ✅ 1Shot relayer executing transactions
- ✅ Social media engagement (posts, demos)
- ✅ Code quality & documentation

### For Arbitrum Hackathon
- ✅ Application deployed on Arbitrum One
- ✅ Core functionality working
- ✅ Gas efficiency demonstrated
- ✅ AI agent optimization (if applicable)
- ✅ GitHub repos public & documented
- ✅ Demo video compelling & clear
- ✅ Team engagement & feedback

---

## Timeline

**MetaMask Hackathon**: 1 day remaining ⏰
- Today: Complete Smart Accounts integration
- Today: Record demo video
- Tomorrow: Submit project

**Arbitrum Buildathon**: 1 day remaining ⏰
- Next 3 weeks: Development
- Weeks 2-3: Optimization & deployment
- Final week: Demo & submission

---

## Next Steps

1. ✅ Create this checklist
2. 🔄 Integrate live balance fetching
3. 🔄 Add hackathon events modal to UI
4. ⏳ Install MetaMask Smart Accounts Kit
5. ⏳ Setup Venice AI integration
6. ⏳ Implement 1Shot relayer
7. ⏳ Record demo videos
8. ⏳ Submit to both hackathons
