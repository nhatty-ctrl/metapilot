export enum Network {
  Ethereum = "Ethereum Mainnet",
  Arbitrum = "Arbitrum One",
  Base = "Base",
  Solana = "Solana",
  Bitcoin = "Bitcoin"
}

export interface BalanceState {
  ETH: number;
  BTC: number;
  USDT: number;
  ARB: number;
}

export interface TransactionRecord {
  id: string;
  type: "send" | "swap" | "deposit";
  detail: string;
  timestamp: string;
  hash: string;
}

export interface Conversation {
  id: string;
  title: string;
  messageCount: number;
  updatedAt: string;
  messages: Message[];
}

export interface ToolCall {
  name: string;
  params: string;
  result: string;
}

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  thought?: string; // Grok-style thinking trace
  timestamp: string;
  toolCalls?: ToolCall[];
  requiresPlanConfirmation?: boolean;
  executionPlan?: ExecutionPlan;
  recommendation?: {
    protocol: string;
    token: string;
    amount: string;
    apy: string;
    risk: "Low" | "Medium" | "High";
  };
}

export interface ExecutionPlan {
  action: "deposit" | "swap" | "send";
  protocol: string;
  token: string;
  amount: string;
  apy?: string;
  steps: string[];
  risk?: "Low" | "Medium" | "High";
  payload?: any;
}

export interface AppSettings {
  apiUrl: string;
  walletAddress: string;
  isTerminalMode: boolean;
  model: string;
}

export interface PriceAlert {
  id: string;
  token: "ETH" | "WBTC" | "ARB";
  targetPrice: number;
  condition: "above" | "below";
  createdAt: string;
  triggered: boolean;
}

export interface HackathonEvent {
  id: string;
  name: string;
  description: string;
  prizes: string;
  deadline: string;
  timeLeft: string;
  technologies: string[];
  ecosystem: string;
  tracks: string[];
  requirements: string[];
  link?: string;
}
