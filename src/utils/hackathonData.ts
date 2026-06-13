import { HackathonEvent } from '../types';

export const HACKATHON_EVENTS: HackathonEvent[] = [
  {
    id: "metamask_1shot_venice",
    name: "MetaMask Smart Accounts Kit x 1Shot API x Venice AI Dev Cook Off",
    description: "Build Seamless Agentic Onchain Experiences with MetaMask Smart Accounts Kit x 1Shot API x Venice AI. Create next-generation agentic experience focused on permission sharing and user experience.",
    prizes: "14,000 USD",
    deadline: "1 days left",
    timeLeft: "01D 18H 12M 38S",
    technologies: ["MetaMask Smart Accounts", "ERC-7715", "1Shot Permissionless Relayer", "Venice AI", "JavaScript/TypeScript"],
    ecosystem: "MetaMask",
    tracks: [
      "Best x402 + ERC-7710 - $3,000",
      "Best Agent - $3,000",
      "Best A2A coordination - $3,000",
      "Best use of Venice AI - $3,000",
      "Best Use of 1Shot Permissionless Relayer - $1,000 USDC",
      "Best Social Media presence - $500 (5x $100)",
      "Best Feedback - $500 (5x $100)"
    ],
    requirements: [
      "Use MetaMask Smart Accounts or Advanced Permissions (ERC-7715)",
      "Working integration in main application flow",
      "Demo video required showing MetaMask integration"
    ],
    link: "https://hackquest.io"
  },
  {
    id: "arbitrum_open_house",
    name: "Arbitrum Open House London: Online Buildathon",
    description: "Build what's next on Arbitrum. Three weeks of intensive building using Arbitrum's infrastructure trusted by institutions and used by millions. Deploy on Arbitrum One or custom Arbitrum chain.",
    prizes: "115,000 USD (70,000 USDC prizes + 30,000 USDC grants + IRL opportunities)",
    deadline: "1 days left",
    timeLeft: "01D 06H 12M 04S",
    technologies: ["Solidity", "Rust", "Arbitrum Stylus", "Web3.js", "Ethers.js"],
    ecosystem: "Arbitrum",
    tracks: [
      "Overall prize - $70,000 USDC",
      "Best Agentic Project - $15,000 USDC",
      "Grants - $30,000 USDC"
    ],
    requirements: [
      "Build DeFi, Gaming, Social, DePin, or innovative applications",
      "Deploy on Arbitrum One or custom Arbitrum chain",
      "Top 3 teams win IRL Founder House in London in June"
    ],
    link: "https://hackquest.io"
  }
];
