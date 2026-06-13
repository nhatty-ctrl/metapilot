import React, { useState, useEffect, useRef } from 'react';
import { 
  AnimatePresence, 
  motion 
} from 'motion/react';
import { 
  Cpu, 
  Globe, 
  Sliders, 
  Terminal, 
  ArrowRight, 
  Send, 
  Copy, 
  Check, 
  Search, 
  ShieldAlert, 
  ChevronDown, 
  ChevronUp, 
  Wallet, 
  RefreshCw,
  ShieldCheck,
  AlertTriangle,
  FileCode,
  Lock
} from 'lucide-react';
import Markdown from 'react-markdown';

import { 
  Network, 
  BalanceState, 
  TransactionRecord, 
  Conversation, 
  Message, 
  ExecutionPlan, 
  AppSettings,
  ToolCall,
  PriceAlert,

} from './types';

import { 
  INITIAL_BALANCES, 
  INITIAL_ADDRESS, 
  formatAddress, 
  formatCurrency, 
  getEstimatedPortfolioValue, 
  parseLocalCommand 
} from './utils/cryptoHelpers';

import { Sidebar } from './components/Sidebar';
import { SpeculosEmulator } from './components/SpeculosEmulator';
import { SettingsModal } from './components/SettingsModal';
import { TransactionLogModal } from './components/TransactionLogModal';
import { ExecutionPlanModal } from './components/ExecutionPlanModal';

interface ToastMsg {
  id: string;
  msg: string;
  type: "info" | "success" | "warning" | "error";
}

export default function App() {
  // --- Persistent & Local States ---
  const [balances, setBalances] = useState<BalanceState>(INITIAL_BALANCES);
  const [activeNetwork, setActiveNetwork] = useState<Network>(Network.Arbitrum);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  
  const [isStreaming, setIsStreaming] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [apiConnected, setApiConnected] = useState<boolean | null>(null);

  // --- MetaMask Web3 States ---
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [metamaskStatus, setMetamaskStatus] = useState<"disconnected" | "connecting" | "connected">("disconnected");
  const [metamaskError, setMetamaskError] = useState<string | null>(null);
  const [chainId, setChainId] = useState<string | null>(null);
  const [isDemoWalletMode, setIsDemoWalletMode] = useState<boolean>(false);
  const [metamaskPermissions, setMetamaskPermissions] = useState<string[]>([]);

  // --- Yield Recommendation Dismiss / Executed States ---
  const [dismissedCards, setDismissedCards] = useState<Record<string, boolean>>({});
  const [executedCards, setExecutedCards] = useState<Record<string, boolean>>({});

  // --- Collapsed/Open Thought States (Keyed by Message ID) ---
  const [thinkingExpanded, setThinkingExpanded] = useState<Record<string, boolean>>({});

  // --- Right Side Controlled Tab State ---
  const [rightPanelTab, setRightPanelTab] = useState<"charts" | "yields" | "receipts">("charts");

  // --- App Global Settings ---
  const [settings, setSettings] = useState<AppSettings>({
    apiUrl: typeof window !== "undefined" ? window.location.origin : "",
    walletAddress: INITIAL_ADDRESS,
    isTerminalMode: false,
    model: "MetaPilot Intelligence v1.0"
  });

  // --- Yield Route Execution Plan Modals ---
  const [activeExecutionPlan, setActiveExecutionPlan] = useState<ExecutionPlan | null>(null);
  const [executionModalOpen, setExecutionModalOpen] = useState(false);
  const [activeExecutionMsgId, setActiveExecutionMsgId] = useState<string | null>(null);

  // --- Transaction Logs / Toasts ---
  const [txLog, setTxLog] = useState<TransactionRecord[]>([
    {
      id: "tx_init_1",
      type: "deposit",
      detail: "Configured Lido Finance Liquid Staking with 1.85 ETH",
      timestamp: "10:45 AM",
      hash: "0x3f628aa1729bfa8812bf09debcff690a2be29c54e1127bc4f1a28a1ea52861ed"
    },
    {
      id: "tx_init_2",
      type: "swap",
      detail: "Swapped 0.50 ETH for 1,540.00 USDT via Uniswap v3 Pool",
      timestamp: "Yesterday, 3:12 PM",
      hash: "0x89ab10f92b72cde3da49b6b907c13a0e4130f1eff23910cb0be9287a28e8310f"
    }
  ]);
  const [selectedToken, setSelectedToken] = useState<"ETH" | "WBTC" | "ARB">("ETH");
  const [toasts, setToasts] = useState<ToastMsg[]>([]);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // --- Price States & Price Alerts ---
  const [prices, setPrices] = useState({
    ETH: 3082.50,
    WBTC: 64920.00,
    ARB: 0.95
  });

  const [alerts, setAlerts] = useState<PriceAlert[]>([
    {
      id: "alert_1",
      token: "ETH",
      targetPrice: 3100.00,
      condition: "above",
      createdAt: "10:00 AM",
      triggered: false
    },
    {
      id: "alert_2",
      token: "ARB",
      targetPrice: 0.90,
      condition: "below",
      createdAt: "Yesterday",
      triggered: false
    }
  ]);

  const handleAddAlert = (token: "ETH" | "WBTC" | "ARB", targetPrice: number, condition: "above" | "below") => {
    const newAlert: PriceAlert = {
      id: `alert_${Date.now()}`,
      token,
      targetPrice,
      condition,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      triggered: false
    };
    setAlerts(prev => [newAlert, ...prev]);
    triggerToast(`Alert Guard set: Notify when ${token} is ${condition} $${targetPrice.toLocaleString()}`, "success");
  };

  const handleDeleteAlert = (id: string) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
    triggerToast("Alert Sentinel disabled", "info");
  };

  const handleSimulatePriceTick = () => {
    const perturbs = {
      ETH: (Math.random() > 0.5 ? 1 : -1) * (Math.random() * 40 + 10), 
      WBTC: (Math.random() > 0.5 ? 1 : -1) * (Math.random() * 800 + 100), 
      ARB: (Math.random() > 0.5 ? 1 : -1) * (Math.random() * 0.03 + 0.01) 
    };

    setPrices(prev => {
      const updated = {
        ETH: Math.max(1000, Number((prev.ETH + perturbs.ETH).toFixed(2))),
        WBTC: Math.max(15000, Number((prev.WBTC + perturbs.WBTC).toFixed(2))),
        ARB: Math.max(0.1, Number((prev.ARB + perturbs.ARB).toFixed(4)))
      };

      // Evaluate active (untriggered) alerts
      setAlerts(currentAlerts => {
        return currentAlerts.map(alert => {
          if (alert.triggered) return alert;

          const currentPrice = updated[alert.token];
          let didTrigger = false;
          if (alert.condition === "above" && currentPrice >= alert.targetPrice) {
            didTrigger = true;
          } else if (alert.condition === "below" && currentPrice <= alert.targetPrice) {
            didTrigger = true;
          }

          if (didTrigger) {
            triggerToast(`🚨 Sentinel cross-trigger activated: ${alert.token} is now $${currentPrice.toLocaleString()} (Target: ${alert.condition} $${alert.targetPrice.toLocaleString()})!`, "success");
            return { ...alert, triggered: true };
          }

          return alert;
        });
      });

      return updated;
    });
  };

  // --- Transactions Detail Modal States ---
  const [selectedReceiptTx, setSelectedReceiptTx] = useState<TransactionRecord | null>(null);
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);

  const handleOpenReceiptDetails = (tx: TransactionRecord) => {
    setSelectedReceiptTx(tx);
    setReceiptModalOpen(true);
  };

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // --- Toast Trigger Utility ---
  const triggerToast = (msg: string, type: ToastMsg["type"] = "info") => {
    const newToast: ToastMsg = {
      id: Math.random().toString(36).substring(2, 9),
      msg,
      type
    };
    setToasts((prev) => [...prev, newToast]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== newToast.id));
    }, 4000);
  };

  const refreshMetaMaskPermissions = async () => {
    if (typeof window === "undefined" || !(window as any).ethereum) return [];

    try {
      const provider = (window as any).ethereum;
      const permissions = await provider.request({ method: "wallet_getPermissions" });
      const caveatNames = Array.isArray(permissions)
        ? permissions.map((permission: any) => permission?.parentCapability).filter(Boolean)
        : [];
      setMetamaskPermissions(caveatNames);
      return caveatNames;
    } catch (err) {
      console.warn("MetaMask permissions unavailable:", err);
      setMetamaskPermissions([]);
      return [];
    }
  };

  // --- MetaMask Observers and Handlers ---
  useEffect(() => {
    if (typeof window === "undefined" || !(window as any).ethereum) return;

    const provider = (window as any).ethereum;

    const checkConnections = async () => {
      try {
        const accounts = await provider.request({ method: "eth_accounts" });
        if (accounts && accounts.length > 0) {
          setWalletAddress(accounts[0]);
          setMetamaskStatus("connected");
          setIsDemoWalletMode(false);
          refreshMetaMaskPermissions();
          
          const currentChain = await provider.request({ method: "eth_chainId" });
          setChainId(currentChain);
        }
      } catch (err) {
        console.error("Error checking MetaMask initial state:", err);
      }
    };

    const handleAccounts = (accounts: string[]) => {
      if (accounts && accounts.length > 0) {
        setWalletAddress(accounts[0]);
        setMetamaskStatus("connected");
        setIsDemoWalletMode(false);
        refreshMetaMaskPermissions();
        triggerToast("Web3 Account synchronized", "success");
      } else {
        setWalletAddress(null);
        setMetamaskStatus("disconnected");
        setMetamaskPermissions([]);
        triggerToast("MetaMask Account disconnected", "warning");
      }
    };

    const handleChain = (chain: string) => {
      setChainId(chain);
      triggerToast(`Active web3 chain: ${chain === '0xa4b1' ? 'Arbitrum' : chain}`, "info");
    };

    checkConnections();
    provider.on("accountsChanged", handleAccounts);
    provider.on("chainChanged", handleChain);

    return () => {
      if (provider.removeListener) {
        provider.removeListener("accountsChanged", handleAccounts);
        provider.removeListener("chainChanged", handleChain);
      }
    };
  }, []);

  const connectMetaMask = async () => {
    if (typeof window !== "undefined" && (window as any).ethereum) {
      setMetamaskStatus("connecting");
      setMetamaskError(null);
      try {
        const provider = (window as any).ethereum;
        const accounts = await provider.request({ method: "eth_requestAccounts" });
        if (accounts && accounts.length > 0) {
          setWalletAddress(accounts[0]);
          setMetamaskStatus("connected");
          setIsDemoWalletMode(false);
          await refreshMetaMaskPermissions();
          triggerToast("MetaMask connected. Address read permission verified.", "success");
          
          const currentChain = await provider.request({ method: "eth_chainId" });
          setChainId(currentChain);
        } else {
          setMetamaskStatus("disconnected");
        }
      } catch (err: any) {
        console.error(err);
        setMetamaskStatus("disconnected");
        setMetamaskError(err.message || "MetaMask connection aborted");
        triggerToast(err.message || "MetaMask connection aborted", "error");
      }
    } else {
      window.open("https://metamask.io/download/", "_blank");
    }
  };

  const switchNetworkToArbitrum = async () => {
    if (typeof window !== "undefined" && (window as any).ethereum) {
      const provider = (window as any).ethereum;
      try {
        await provider.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: "0xa4b1" }] // Arbitrum Hex: 0xa4b1
        });
        triggerToast("Network switched to Arbitrum", "success");
      } catch (err: any) {
        if (err.code === 4902) {
          try {
            await provider.request({
              method: "wallet_addEthereumChain",
              params: [
                {
                  chainId: "0xa4b1",
                  chainName: "Arbitrum One",
                  nativeCurrency: {
                    name: "Ether",
                    symbol: "ETH",
                    decimals: 18
                  },
                  rpcUrls: ["https://arb1.arbitrum.io/rpc", "https://arb-mainnet.g.allfile.sh"],
                  blockExplorerUrls: ["https://arbiscan.io/"]
                }
              ]
            });
            triggerToast("Arbitrum Chain added and synchronized", "success");
          } catch (addError) {
            console.error("Chain add error:", addError);
          }
        } else {
          triggerToast("Failed to switch network in MetaMask", "error");
        }
      }
    }
  };

  const disconnectWallet = () => {
    setWalletAddress(null);
    setMetamaskStatus("disconnected");
    setIsDemoWalletMode(false);
    setMetamaskPermissions([]);
    triggerToast("Wallet disconnected", "info");
  };

  const enableDemoWallet = () => {
    setWalletAddress(INITIAL_ADDRESS);
    setMetamaskStatus("connected");
    setIsDemoWalletMode(true);
    setMetamaskPermissions([]);
    setChainId("0xa4b1"); // Arbitrum by default for simulation
    triggerToast("Sandbox Simulation Mode Loaded", "success");
  };

  // --- Initialize Default Conversation ---
  useEffect(() => {
    const welcomeId = "initial_session";
    const defaultConv: Conversation = {
      id: welcomeId,
      title: "MetaPilot Yield Strategy",
      messageCount: 0,
      updatedAt: "just now",
      messages: [] // Let's start with empty list to render suggestion chips empty state beautiful!
    };
    setConversations([defaultConv]);
    setActiveConvId(welcomeId);
  }, []);

  // --- Scroll chat to bottom ---
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversations, activeConvId, isStreaming]);

  // --- Background API Ping ---
  useEffect(() => {
    const checkApi = async () => {
      try {
        const res = await fetch(`${settings.apiUrl}/api/status`, { signal: AbortSignal.timeout(2000) });
        if (res.ok) {
          setApiConnected(true);
        } else {
          setApiConnected(false);
        }
      } catch {
        setApiConnected(false);
      }
    };
    checkApi();
    const interval = setInterval(checkApi, 10000);
    return () => clearInterval(interval);
  }, [settings.apiUrl]);

  // --- Active Conversation Message Accessor ---
  const activeConversation = conversations.find(c => c.id === activeConvId);

  // --- Send Message Trigger ---
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const text = searchQuery.trim();
    if (!text || isStreaming) return;

    setSearchQuery("");
    setIsStreaming(true);

    // 1. Add User Message
    const userMsg: Message = {
      id: `user_${Date.now()}`,
      role: "user",
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    let targetConv = activeConversation;
    let fallbackId = activeConvId;

    if (!targetConv || activeConvId === null) {
      fallbackId = `conv_${Date.now()}`;
      targetConv = {
        id: fallbackId,
        title: text.length > 28 ? `${text.slice(0, 28)}...` : text,
        messageCount: 0,
        updatedAt: "just now",
        messages: []
      };
      setConversations(prev => [targetConv!, ...prev]);
      setActiveConvId(fallbackId);
    }

    const updatedMessages = [...(targetConv?.messages || []), userMsg];
    setConversations(prev => prev.map(c => c.id === fallbackId ? {
      ...c,
      messages: updatedMessages,
      messageCount: updatedMessages.length,
      updatedAt: "just now"
    } : c));

    // Small artificial thinking pause
    await new Promise(r => setTimeout(r, 400));

    // 3. Command Live Gemini & Local Processing Route
    let result;
    try {
      const chatHistory = targetConv?.messages?.map(m => ({
        role: m.role,
        content: m.content
      })) || [];

      const apiRes = await fetch(`${settings.apiUrl || window.location.origin}/api/gemini/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          message: text,
          history: chatHistory,
          balances,
          walletAddress: settings.walletAddress,
          activeNetwork
        })
      });

      if (!apiRes.ok) {
        throw new Error(`Response status code ${apiRes.status}`);
      }

      result = await apiRes.json();
    } catch (apiError) {
      console.warn("Express-Gemini API request failed, falling back to local instruction parser:", apiError);
      result = parseLocalCommand(text, balances, settings.walletAddress, activeNetwork);
    }

    // If query was about charts, automatically flip the right panel tab
    if (result.showCharts) {
      if (result.targetToken) {
        setSelectedToken(result.targetToken);
      }
      triggerToast(`Flipped board to ${result.targetToken} Market Charts`, "success");
    }

    // If query asks for Yield Dashboards or APY trends, switch tab
    if (result.showYieldChart || text.toLowerCase().includes("yield") || text.toLowerCase().includes("apy") || text.toLowerCase().includes("strategy") || text.toLowerCase().includes("rate")) {
      setRightPanelTab("yields");
      triggerToast("Activated L2 Protocol Yield Dashboard & APY trends", "success");
    }

    // Expand thought automatically for demonstration
    const agentMsgId = `agent_${Date.now()}`;
    setThinkingExpanded(prev => ({ ...prev, [agentMsgId]: true }));

    // 4. Set Execution Plan if needed
    if (result.executionPlan) {
      setActiveExecutionPlan(result.executionPlan);
      setActiveExecutionMsgId(null);
      setExecutionModalOpen(true);
      triggerToast("Compiled custom route execution parameters", "info");
    }

    // 5. Append Agent Message
    const agentMsg: Message = {
      id: agentMsgId,
      role: "assistant",
      content: result.reply,
      thought: result.thought,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      toolCalls: result.toolCalls as ToolCall[],
      requiresPlanConfirmation: result.requiresPlanConfirmation,
      executionPlan: result.executionPlan,
      recommendation: result.recommendation
    };

    setConversations(prev => prev.map(c => c.id === fallbackId ? {
      ...c,
      messages: [...updatedMessages, agentMsg],
      messageCount: updatedMessages.length + 1
    } : c));

    setIsStreaming(false);
  };

  // --- Unified DeFi Routing & Execution ---
  const confirmBroadcastRoutePlan = () => {
    if (!activeExecutionPlan) return;

    const { action, protocol, token, amount, apy, payload } = activeExecutionPlan;
    triggerToast(isDemoWalletMode ? "Running sandbox route simulation..." : "Running connected-wallet route simulation...", "info");

    setTimeout(() => {
      const hash = `0x${Math.random().toString(16).substring(2, 10)}${Math.random().toString(16).substring(2, 10)}...${Math.random().toString(16).substring(2, 6)}`;
      const amtVal = parseFloat(amount.replace(/,/g, '')) || 0;

      // Deduct assets and record logs based on transaction action type
      if (action === 'deposit') {
        const cleanedAmt = parseFloat(amount.replace(/[^\d.]/g, '')) || 1000;
        setBalances(prev => {
          if (token === "ETH") return { ...prev, ETH: Math.max(0, prev.ETH - cleanedAmt) };
          if (token === "WBTC" || token === "BTC") return { ...prev, BTC: Math.max(0, prev.BTC - cleanedAmt) };
          return { ...prev, USDT: Math.max(0, prev.USDT - cleanedAmt) };
        });

        const newLog: TransactionRecord = {
          id: Math.random().toString(36).substring(2, 9),
          type: "deposit",
          detail: `MetaPilot deposited ${amount} into ${protocol} (${apy} APY)`,
          timestamp: new Date().toLocaleTimeString([], { hour: "numeric", minute: "numeric" }),
          hash
        };
        setTxLog(p => [newLog, ...p]);

        // Append success message in active conversation
        const successMsg: Message = {
          id: `route_executed_${Date.now()}`,
          role: "assistant",
          content: `### 💎 Deposit Confirmed & Staked\n\nYour capital allocation plan has successfully integrated on-chain. Live yield auto-compounding harvesting has initiated.\n\n- **Protocol:** \`${protocol}\`\n- **Allocated Principal:** \`${amount}\`\n- **Live Variable APY:** \`${apy}\`\n- **Slippage Enforced:** \`0.5%\`\n- **Transaction Hash:** [\`${hash}\`](https://arbiscan.io/)\n- **Active Status:** **Generating Staking Rewards**`,
          thought: `Validating signature handshakes with active MetaMask provider. Formatting smart deposit routing call to ${protocol}. Routing complete: Liquidity minted under vToken index. Oracle feed synchronized.`,
          timestamp: "just now"
        };

        successMsg.content = `### Deposit Route Simulated\n\nYour capital allocation plan was simulated locally. No MetaMask signature was requested and no on-chain transaction was submitted.\n\n- **Protocol:** \`${protocol}\`\n- **Allocated Principal:** \`${amount}\`\n- **Live Variable APY:** \`${apy}\`\n- **Slippage Enforced:** \`0.5%\`\n- **Simulation Hash:** \`${hash}\`\n- **Active Status:** **Local preview only**`;
        successMsg.thought = `Verified route parameters for ${protocol}. MetaMask connection is limited to account-read permission; this flow generated a local simulation receipt only.`;

        if (activeConvId) {
          setConversations(prev => prev.map(c => c.id === activeConvId ? {
            ...c,
            messages: [...c.messages, successMsg],
            messageCount: c.messages.length + 1
          } : c));
        }

        if (activeExecutionMsgId) {
          setExecutedCards(prev => ({ ...prev, [activeExecutionMsgId]: true }));
        }
      } else if (action === 'swap') {
        const fromAsset = payload?.fromAsset || "ETH";
        const toAsset = payload?.toAsset || "USDT";
        const fromAmt = payload?.amount || 0.1;
        const toAmt = parseFloat(payload?.output?.replace(/,/g, '')) || 0;

        setBalances(prev => {
          const updated = { ...prev };
          if (fromAsset === "ETH") updated.ETH = Math.max(0, updated.ETH - fromAmt);
          else if (fromAsset === "BTC" || fromAsset === "WBTC") updated.BTC = Math.max(0, updated.BTC - fromAmt);
          else if (fromAsset === "USDT") updated.USDT = Math.max(0, updated.USDT - fromAmt);

          if (toAsset === "ETH") updated.ETH += toAmt;
          else if (toAsset === "BTC" || toAsset === "WBTC") updated.BTC += toAmt;
          else if (toAsset === "USDT") updated.USDT += toAmt;

          return updated;
        });

        const newLog: TransactionRecord = {
          id: Math.random().toString(36).substring(2, 9),
          type: "swap",
          detail: `Swapped ${fromAmt} ${fromAsset} for ${toAmt} ${toAsset}`,
          timestamp: new Date().toLocaleTimeString([], { hour: "numeric", minute: "numeric" }),
          hash
        };
        setTxLog(p => [newLog, ...p]);

        const successMsg: Message = {
          id: `route_executed_${Date.now()}`,
          role: "assistant",
          content: `### 🔁 Atomic Swap Executed Successfully\n\n- **Liquidity Provider:** \`Uniswap V3 + Camelot\`\n- **Swapped From:** \`${fromAmt} ${fromAsset}\`\n- **Swapped To:** \`${toAmt} ${toAsset}\`\n- **Gas Fee:** \`<0.0001 ETH\`\n- **Routing Protection:** \`0.5% Slippage limit guaranteed\`\n- **Transaction Hash:** [\`${hash}\`](https://arbiscan.io/)`,
          thought: "Scanning Camelot Pool margins. Broadcast of swap transaction successful. MetaMask state updated.",
          timestamp: "just now"
        };
        successMsg.content = `### Swap Route Simulated\n\nNo MetaMask signature was requested and no on-chain transaction was submitted.\n\n- **Liquidity Provider:** \`Uniswap V3 + Camelot\`\n- **Swapped From:** \`${fromAmt} ${fromAsset}\`\n- **Swapped To:** \`${toAmt} ${toAsset}\`\n- **Gas Fee Estimate:** \`<0.0001 ETH\`\n- **Routing Protection:** \`0.5% Slippage limit guaranteed\`\n- **Simulation Hash:** \`${hash}\``;
        successMsg.thought = "Scanned pool route parameters and generated a local simulation receipt. MetaMask state was not modified.";

        if (activeConvId) {
          setConversations(prev => prev.map(c => c.id === activeConvId ? {
            ...c,
            messages: [...c.messages, successMsg],
            messageCount: c.messages.length + 1
          } : c));
        }
      } else if (action === 'send') {
        const asset = payload?.asset || "ETH";
        const sendAmt = payload?.amount || 0.1;
        const destination = payload?.destination || "";

        setBalances(prev => {
          if (asset === "ETH") return { ...prev, ETH: Math.max(0, prev.ETH - sendAmt) };
          if (asset === "BTC" || asset === "WBTC") return { ...prev, BTC: Math.max(0, prev.BTC - sendAmt) };
          return { ...prev, USDT: Math.max(0, prev.USDT - sendAmt) };
        });

        const newLog: TransactionRecord = {
          id: Math.random().toString(36).substring(2, 9),
          type: "send",
          detail: `Transfer ${sendAmt} ${asset} outbound`,
          timestamp: new Date().toLocaleTimeString([], { hour: "numeric", minute: "numeric" }),
          hash
        };
        setTxLog(p => [newLog, ...p]);

        const successMsg: Message = {
          id: `route_executed_${Date.now()}`,
          role: "assistant",
          content: `### 📤 Outbound Transfer Broadcasted\n\n- **Asset:** \`${asset}\`\n- **Amount:** \`${sendAmt} ${asset}\`\n- **Recipient Address:** \`${destination}\`\n- **Network:** \`Arbitrum One\`\n- **Transaction Hash:** [\`${hash}\`](https://arbiscan.io/)`,
          thought: "Staging tx raw hex. Broadcasted payload via active web3 node. Awaiting block include.",
          timestamp: "just now"
        };
        successMsg.content = `### Outbound Transfer Simulated\n\nNo MetaMask signature was requested and no on-chain transaction was submitted.\n\n- **Asset:** \`${asset}\`\n- **Amount:** \`${sendAmt} ${asset}\`\n- **Recipient Address:** \`${destination}\`\n- **Network:** \`Arbitrum One\`\n- **Simulation Hash:** \`${hash}\``;
        successMsg.thought = "Validated transfer fields and generated a local simulation receipt. No payload was sent to MetaMask.";

        if (activeConvId) {
          setConversations(prev => prev.map(c => c.id === activeConvId ? {
            ...c,
            messages: [...c.messages, successMsg],
            messageCount: c.messages.length + 1
          } : c));
        }
      }

      setExecutionModalOpen(false);
      setActiveExecutionPlan(null);
      setActiveExecutionMsgId(null);
      triggerToast("Route simulation completed. No wallet transaction was sent.", "success");
    }, 1200);
  };

  const handleExecuteYield = async (msgId: string, rec: { protocol: string; token: string; amount: string; apy: string; risk: "Low" | "Medium" | "High" }) => {
    if (metamaskStatus !== "connected") {
      triggerToast("Please connect your MetaMask wallet or use Demo Wallet Simulation first", "warning");
      return;
    }

    // Set up step list depending on connected profile
    const steps = [
      `Query Arbitrum L2 gas tracker data (currently optimized <$0.02)`,
      `Prepare transaction swap/lending parameters for ${rec.token} principal`,
      `${isDemoWalletMode ? 'Establish secure Sandbox simulated yield gateway' : 'Verify MetaMask address-read permission'}`,
      `Preview deposit routing parameters for ${rec.protocol} (${rec.apy} APY)`
    ];

    const plan: ExecutionPlan = {
      action: "deposit",
      protocol: rec.protocol,
      token: rec.token,
      amount: rec.amount,
      apy: rec.apy,
      risk: rec.risk,
      steps,
      payload: rec
    };

    setActiveExecutionPlan(plan);
    setActiveExecutionMsgId(msgId);
    setExecutionModalOpen(true);
    triggerToast("Compiled custom route execution parameters", "info");
  };

  // --- Reset Sandbox State ---
  const handleResetSandbox = () => {
    setBalances(INITIAL_BALANCES);
    setTxLog([]);
    setActiveExecutionPlan(null);
    setExecutionModalOpen(false);
    
    // Clear conversation list
    const welcomeId = `session_${Date.now()}`;
    const clearedConv: Conversation = {
      id: welcomeId,
      title: "MetaPilot Strategy Setup",
      messageCount: 1,
      updatedAt: "just now",
      messages: [
        {
          id: `welcome_${Date.now()}`,
          role: "assistant",
          content: "MetaPilot sandbox state and balances have been flushed to default vectors. Ready to construct and sequence on-chain Arbitrum yield routes.",
          timestamp: "just now"
        }
      ]
    };
    setConversations([clearedConv]);
    setActiveConvId(welcomeId);
    triggerToast("State successfully flushed to defaults", "info");
  };

  // --- Quick Fill prompt text helper ---
  const fillQuickPhrase = (t: string) => {
    setSearchQuery(t);
    triggerToast("Command loaded — press Send to authorize", "info");
  };

  // --- Settings Save handler ---
  const handleSaveSettings = (newSettings: AppSettings, newBalances: BalanceState) => {
    setSettings(newSettings);
    setBalances(newBalances);
    triggerToast("Secure settings written successfully", "success");
  };

  // --- Message Copy Code Utility ---
  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    triggerToast("Copied content successfully", "success");
    setTimeout(() => setCopiedId(null), 1500);
  };

  // --- Network updates ---
  const handleNetworkChange = (net: Network) => {
    setActiveNetwork(net);
    triggerToast(`Switched active chain index to ${net}`, "info");
  };

  const hasMetaMaskAccountPermission = metamaskPermissions.includes("eth_accounts");
  const walletPermissionLabel = isDemoWalletMode
    ? "Demo mode: no MetaMask permissions"
    : hasMetaMaskAccountPermission
      ? "Verified: can read selected address"
      : "No MetaMask permission scope detected";

  return (
    <div className={`h-screen flex flex-col font-sans select-none overflow-hidden ${settings.isTerminalMode ? 'bg-[#000]' : 'bg-ink-950 text-zinc-100'} grid-bg`}>
      
      {/* ── HEADER NAVIGATION ───────────────────────────────────── */}
      <header className={`glass border-b transition-colors z-40 px-5 py-3 flex items-center justify-between shrink-0 ${
        settings.isTerminalMode ? 'border-emerald-500/40 bg-zinc-950/90' : 'border-white/5 bg-ink-950/80'
      }`}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center shadow-lg relative overflow-hidden group">
            <div className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-emerald-400 led" />
            <Cpu className="w-4 h-4 text-white hover:rotate-12 transition-all duration-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display font-black text-base tracking-tight text-white">
                MetaPilot
              </span>
            </div>
          </div>
        </div>

        {/* Core Controls */}
        <div className="flex items-center gap-4">
          
          {/* Model selection */}
          <div className="hidden md:flex bg-zinc-900/60 border border-white/5 rounded-full p-1 max-w-[210px]">
            <select
              value={settings.model}
              onChange={(e) => setSettings({ ...settings, model: e.target.value })}
              className="bg-transparent text-[10px] font-mono font-bold text-zinc-400 cursor-pointer focus:outline-none pl-2.5 pr-1 py-1"
            >
              <option value="MetaPilot Intelligence v1.0">MetaPilot Intelligence v1.0</option>
              <option value="ST33 Hardware Enclave">ST33 Hardware Enclave</option>
            </select>
          </div>

          {/* Connected chain status banner check */}
          {metamaskStatus === "connected" && (
            <div className="hidden sm:flex bg-zinc-900/40 border border-white/5 px-3 py-1.5 rounded-full items-center gap-2 text-[10.5px] font-mono text-zinc-300">
              <span className={`w-1.5 h-1.5 rounded-full ${chainId === "0xa4b1" ? "bg-emerald-400" : "bg-amber-400"} led`} />
              <span>{chainId === "0xa4b1" ? "Arbitrum One" : "Wrong Network"}</span>
            </div>
          )}

          {/* MetaMask Web3 Status Action */}
          <div className="flex items-center gap-2">
            {metamaskStatus === "disconnected" && (
              <div className="flex items-center gap-2">
                <button
                  onClick={connectMetaMask}
                  className="connect-btn flex items-center gap-1.5 px-4.5 py-2.5 rounded-xl border-none font-display font-semibold transition-all hover:scale-105 active:scale-95 cursor-pointer"
                >
                  <Wallet className="w-4 h-4" />
                  <span>Connect wallet</span>
                </button>
              </div>
            )}

            {metamaskStatus === "connecting" && (
              <button
                disabled
                className="opacity-70 bg-zinc-900 text-zinc-400 border border-white/5 font-mono text-xs px-4.5 py-2 rounded-xl flex items-center gap-2 cursor-wait"
              >
                <span className="w-2.5 h-2.5 rounded-full border border-t-zinc-200 border-zinc-800 animate-spin" />
                <span>Connecting Web3...</span>
              </button>
            )}

            {metamaskStatus === "connected" && (
              <div className="relative group">
                <button
                  className="wallet-pill cursor-pointer hover:border-white/10 transition-all flex items-center gap-2 bg-zinc-950 px-3.5 py-1.5 rounded-full border border-white/5 font-mono text-xs"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#5DCAA5] led" />
                  <span className="text-zinc-200 font-bold">{walletAddress ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}` : "Connected"}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-zinc-500" />
                </button>
                
                {/* Dropdown Options */}
                <div className="absolute right-0 top-full pt-1.5 z-50 hidden group-hover:block w-72">
                  <div className="bg-[#0e0e11] border border-white/5 rounded-2xl p-2.5 shadow-2xl flex flex-col gap-1.5">
                    <div className="px-2.5 py-2 rounded-xl bg-zinc-950/70 border border-white/[0.04] space-y-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] text-zinc-500 font-mono uppercase">MetaMask Access</span>
                        <span className={`w-1.5 h-1.5 rounded-full ${hasMetaMaskAccountPermission || isDemoWalletMode ? "bg-emerald-400" : "bg-amber-400"}`} />
                      </div>
                      <p className="text-[11px] text-zinc-300 font-sans leading-snug">{walletPermissionLabel}</p>
                      <p className="text-[10px] text-zinc-500 font-mono leading-normal">
                        Connected sites can read your selected address. MetaMask still requires a separate wallet confirmation before any signature or transaction.
                      </p>
                    </div>
                    {!isDemoWalletMode && (
                      <button
                        onClick={refreshMetaMaskPermissions}
                        className="w-full text-left text-[11px] hover:bg-zinc-900 text-zinc-300 hover:text-white px-2.5 py-1.5 rounded-lg font-sans font-medium transition-all cursor-pointer flex items-center gap-2"
                      >
                        <RefreshCw className="w-3.5 h-3.5 text-zinc-500" />
                        Verify Permissions
                      </button>
                    )}
                    <button 
                      onClick={() => {
                        walletAddress && navigator.clipboard.writeText(walletAddress);
                        triggerToast("Address copied!", "success");
                      }}
                      className="w-full text-left text-[11px] hover:bg-zinc-900 text-zinc-300 hover:text-white px-2.5 py-1.5 rounded-lg font-sans font-medium transition-all cursor-pointer"
                    >
                      Copy Address
                    </button>
                    <button 
                      onClick={disconnectWallet}
                      className="w-full text-left text-[11px] hover:bg-rose-950/20 text-rose-400 px-2.5 py-1.5 rounded-lg font-sans font-medium transition-all cursor-pointer border border-transparent hover:border-rose-900/10"
                    >
                      Disconnect
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* API Link Pill */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-zinc-900/40 border border-white/5 rounded-full font-mono text-[10px]">
            <span className={`w-1.5 h-1.5 rounded-full ${apiConnected ? 'bg-emerald-400 led' : 'bg-amber-400 led'}`} />
            <span className="text-zinc-400">
              {apiConnected ? "Backend Online" : "Local Sandbox State"}
            </span>
          </div>

          {/* Settings / Slider */}
          <button 
            onClick={() => setSettingsOpen(true)}
            className="w-8 h-8 rounded-full border border-white/5 hover:border-white/20 bg-zinc-950/40 flex items-center justify-center text-zinc-400 hover:text-white transition-all cursor-pointer"
            title="Inspect System Configuration"
          >
            <Sliders className="w-3.5 h-3.5" />
          </button>

          {/* Terminal button */}
          <button 
            onClick={() => {
              setSettings({ ...settings, isTerminalMode: !settings.isTerminalMode });
              triggerToast(settings.isTerminalMode ? "Premium visual array loaded" : "Hyper-terminal command deck active", "info");
            }}
            className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all cursor-pointer ${
              settings.isTerminalMode 
                ? 'border-emerald-500 bg-emerald-950/40 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.2)]' 
                : 'border-white/5 bg-zinc-950/40 text-zinc-400 hover:text-white'
            }`}
            title="Toggle Monospaced Deck"
          >
            <Terminal className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Connected chain status check wrong network banner */}
      {metamaskStatus === "connected" && chainId !== "0xa4b1" && !isDemoWalletMode && (
        <div className="bg-amber-500/10 border-b border-amber-500/30 text-amber-300 text-xs font-mono px-5 py-2.5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 animate-bounce shrink-0" />
            <span>Wrong network — switch to Arbitrum One for Yield routes</span>
          </div>
          <button 
            onClick={switchNetworkToArbitrum}
            className="px-3 py-1 bg-amber-400 hover:bg-white text-zinc-950 font-sans font-bold rounded-lg hover:scale-105 transition-all text-xs cursor-pointer shadow-lg"
          >
            Switch to Arbitrum
          </button>
        </div>
      )}

      {/* ── MAIN WORKSPACE PANEL ─────────────────────────────────── */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Side Navigation Panel */}
        <Sidebar 
          conversations={conversations}
          activeConvId={activeConvId}
          balances={balances}
          activeNetwork={activeNetwork}
          onSelectConv={setActiveConvId}
          onNewConv={() => {
            const newId = `conv_${Date.now()}`;
            const newC: Conversation = {
              id: newId,
              title: "New secure transaction context",
              messageCount: 0,
              updatedAt: "just now",
              messages: []
            };
            setConversations(p => [newC, ...p]);
            setActiveConvId(newId);
          }}
          onQuickFill={fillQuickPhrase}
          onResetSandbox={handleResetSandbox}
        />

        {/* Center Panel - Conversational Core */}
        <main className="flex-1 flex flex-col overflow-hidden relative">

          {/* Active Listening indicator bar */}
          <div className="shrink-0 bg-zinc-950/20 px-4 py-2 border-b border-white/[0.03] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 led inline-block" />
              <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest">
                MetaPilot Routing System Active
              </span>
            </div>
          </div>

          {/* Messages Flow Feed */}
          <div className="flex-1 overflow-y-auto p-5 space-y-5">
            {(!activeConversation || activeConversation.messages.length === 0) ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-6">
                <div className="w-14 h-14 rounded-3xl bg-zinc-900 border border-white/5 flex items-center justify-center text-zinc-400 shadow-2xl animate-fade-in shrink-0">
                  <Cpu className="w-6 h-6 text-[#5DCAA5]" />
                </div>
                <div className="max-w-md space-y-2">
                  <h3 className="font-display font-medium text-lg leading-snug text-white">
                    MetaPilot
                  </h3>
                  <p className="text-xs text-zinc-500 leading-normal">
                    Secure DeFi routing and on-chain yield optimization on Arbitrum. Inquire about stable yields, swap tokens, or command hardware-enclave ledger attestation checks.
                  </p>
                </div>

                {/* Grid of Empty State Suggestion Chips */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-w-lg w-full pt-2">
                  <button
                    onClick={() => fillQuickPhrase("Where should I put my USDC?")}
                    className="p-3 text-left bg-[#0c0c0f]/60 hover:bg-zinc-900 border border-white/5 hover:border-white/10 rounded-2xl cursor-pointer transition-all flex flex-col gap-1 group text-xs text-zinc-300"
                  >
                    <span className="font-semibold text-zinc-200 group-hover:text-[#5DCAA5] transition-colors flex items-center gap-1">
                      <span>Put USDC to work</span>
                      <ArrowRight className="w-3 h-3 text-zinc-650 group-hover:translate-x-0.5 transition-transform" />
                    </span>
                    <span className="text-[10px] text-zinc-550 font-normal leading-tight">Compare major aggregates to find optimal stablecoin routes.</span>
                  </button>
                  <button
                    onClick={() => fillQuickPhrase("Suggest high yield pool for ETH")}
                    className="p-3 text-left bg-[#0c0c0f]/60 hover:bg-zinc-900 border border-white/5 hover:border-white/10 rounded-2xl cursor-pointer transition-all flex flex-col gap-1 group text-xs text-zinc-300"
                  >
                    <span className="font-semibold text-zinc-200 group-hover:text-[#5DCAA5] transition-colors flex items-center gap-1">
                      <span>High APY for ETH</span>
                      <ArrowRight className="w-3 h-3 text-zinc-650 group-hover:translate-x-0.5 transition-transform" />
                    </span>
                    <span className="text-[10px] text-zinc-550 font-normal leading-tight">Identify liquid staking yield indexes on layer-2.</span>
                  </button>
                  <button
                    onClick={() => fillQuickPhrase("What are the risk parameters of Aave pools?")}
                    className="p-3 text-left bg-[#0c0c0f]/60 hover:bg-zinc-900 border border-white/5 hover:border-white/10 rounded-2xl cursor-pointer transition-all flex flex-col gap-1 group text-xs text-zinc-300"
                  >
                    <span className="font-semibold text-zinc-200 group-hover:text-[#5DCAA5] transition-colors flex items-center gap-1">
                      <span>Audit pool safety score</span>
                      <ArrowRight className="w-3 h-3 text-zinc-650 group-hover:translate-x-0.5 transition-transform" />
                    </span>
                    <span className="text-[10px] text-zinc-550 font-normal leading-tight">Analyze collateral parameters and exposure reports.</span>
                  </button>
                  <button
                    onClick={() => fillQuickPhrase("Swap 1.5 ETH for USDC and deposit to secure yield")}
                    className="p-3 text-left bg-[#0c0c0f]/60 hover:bg-zinc-900 border border-white/5 hover:border-white/10 rounded-2xl cursor-pointer transition-all flex flex-col gap-1 group text-xs text-zinc-300"
                  >
                    <span className="font-semibold text-zinc-200 group-hover:text-[#5DCAA5] transition-colors flex items-center gap-1">
                      <span>Multi-hop routing</span>
                      <ArrowRight className="w-3 h-3 text-zinc-650 group-hover:translate-x-0.5 transition-transform" />
                    </span>
                    <span className="text-[10px] text-zinc-550 font-normal leading-tight">Combine swapping and yield deposit routes in one run.</span>
                  </button>
                </div>
              </div>
            ) : (
              activeConversation.messages.map((m) => {
                const isUser = m.role === "user";
                const isThoughtOpen = thinkingExpanded[m.id] || false;

                return (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={m.id}
                    className={`flex gap-3 max-w-[85%] ${isUser ? 'ml-auto justify-end' : 'mr-auto items-start'}`}
                  >
                    {/* Assistant Avatar Icon */}
                    {!isUser && (
                      <div className="w-8 h-8 rounded-2xl glass border border-zinc-850 bg-zinc-900 flex items-center justify-center shrink-0 shadow-md">
                        <Lock className="w-3.5 h-3.5 text-zinc-100" />
                      </div>
                    )}

                    <div className={`flex flex-col gap-1.5 ${isUser ? 'items-end' : 'items-start'}`}>
                      
                      {/* Speaker Header */}
                      <div className="flex items-center gap-2 px-1">
                        <span className="text-[10px] font-mono font-medium text-zinc-450 uppercase tracking-widest">
                          {isUser ? "Local Signature Account" : "MetaPilot Agent"}
                        </span>
                        <span className="text-[9px] font-mono text-zinc-600">{m.timestamp}</span>
                      </div>

                      {/* Chat Bubble Container */}
                      <div className={`p-4 rounded-3xl relative text-sm ${
                        isUser 
                          ? 'bg-gradient-to-tr from-emerald-950/20 to-zinc-900/40 border border-[#5DCAA5]/20 text-zinc-100 rounded-tr-sm' 
                          : 'glass border border-white/5 text-zinc-300 rounded-tl-sm shadow-[0_10px_30px_rgba(0,0,0,0.2)]'
                      }`}>
                        {/* Grok-style Collapsible Thought Accordion */}
                        {!isUser && m.thought && (
                          <div className="mb-3">
                            <button
                              onClick={() => setThinkingExpanded(prev => ({ ...prev, [m.id]: !isThoughtOpen }))}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-[10px] font-mono text-zinc-400 cursor-pointer transition-all hover:bg-zinc-850"
                            >
                              <Cpu className="w-3.5 h-3.5 text-zinc-400" />
                              <span>Thinking Process</span>
                              {isThoughtOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                            </button>

                            <AnimatePresence>
                              {isThoughtOpen && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: "auto", opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  className="overflow-hidden mt-1.5"
                                >
                                  <div className="p-3 rounded-2xl bg-zinc-900/40 border border-white/5 font-mono text-[10px] text-zinc-500 leading-relaxed max-w-full overflow-x-auto break-words select-text">
                                    {m.thought}
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        )}

                        {/* Content block with formatted Markdown structures */}
                        <div className="space-y-2 select-text font-sans tracking-wide leading-relaxed text-xs text-zinc-300 markdown-body">
                          {isUser ? (
                            <p className="text-xs text-zinc-100 font-sans leading-relaxed">{m.content}</p>
                          ) : (
                            <Markdown
                              components={{
                                p: ({ children }) => <p className="mb-2 last:mb-0 text-zinc-300 text-xs leading-relaxed">{children}</p>,
                                li: ({ children }) => <li className="text-zinc-400 text-xs list-disc ml-4 mb-1 leading-relaxed">{children}</li>,
                                ul: ({ children }) => <ul className="my-2 space-y-1">{children}</ul>,
                                ol: ({ children }) => <ol className="my-2 list-decimal ml-4 space-y-1">{children}</ol>,
                                code: ({ children }) => <code className="bg-zinc-950 border border-white/5 px-1.5 py-0.5 rounded text-[10.5px] font-mono text-light-100 font-medium">{children}</code>,
                                strong: ({ children }) => <strong className="text-zinc-100 font-semibold font-sans">{children}</strong>,
                                pre: ({ children }) => <pre className="p-3 bg-zinc-950 border border-zinc-900 rounded-xl overflow-x-auto text-[10px] my-2 font-mono text-zinc-300">{children}</pre>
                              }}
                            >
                              {m.content}
                            </Markdown>
                          )}
                        </div>

                        {/* Associated DeFi Execute Card (only appears when Claude response includes recommendation) */}
                        {m.recommendation && !dismissedCards[m.id] && (
                          <div className="exec-card mt-3.5 border border-white/5 bg-zinc-950/45 p-4 rounded-xl max-w-xs shadow-xl backdrop-blur-sm">
                            <div className="flex justify-between items-center text-[10px] font-mono mb-2 pb-1.5 border-b border-white/5 text-zinc-500 uppercase tracking-widest font-bold">
                              <span className="flex items-center gap-1"><Cpu className="w-3.5 h-3.5 text-[#5DCAA5]" /> Route Proposal</span>
                              <span className="badge-low px-2 py-0.5 bg-zinc-900 border border-white/5 rounded-full font-sans lowercase font-bold text-zinc-400">
                                {m.recommendation.risk} risk
                              </span>
                            </div>

                            <div className="space-y-1.5 font-mono text-xs">
                              <div className="exec-row flex justify-between">
                                <span className="exec-label text-zinc-500">Protocol</span>
                                <span className="text-zinc-300 font-bold font-sans">{m.recommendation.protocol}</span>
                              </div>
                              <div className="exec-row flex justify-between">
                                <span className="exec-label text-zinc-500">Token</span>
                                <span className="text-zinc-300">{m.recommendation.token}</span>
                              </div>
                              <div className="exec-row flex justify-between">
                                <span className="exec-label text-zinc-500">Amount</span>
                                <span className="text-zinc-300 font-semibold">{m.recommendation.amount}</span>
                              </div>
                              <div className="exec-row flex justify-between">
                                <span className="exec-label text-zinc-500">Est. APY</span>
                                <span className="text-[#5DCAA5] font-bold">{m.recommendation.apy}</span>
                              </div>
                            </div>

                            {executedCards[m.id] ? (
                              <div className="mt-3.5 p-2 bg-emerald-950/20 text-emerald-400 border border-emerald-950/40 text-center rounded-lg text-[10.5px] font-mono font-bold flex items-center justify-center gap-1.5 animate-pulse">
                                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full led inline-block" />
                                Deposited On Arbitrum
                              </div>
                            ) : (
                              <div className="exec-btns flex gap-2 mt-3.5">
                                <button 
                                  onClick={() => {
                                    setDismissedCards(prev => ({ ...prev, [m.id]: true }));
                                    triggerToast("Yield route dismissed", "info");
                                  }}
                                  className="exec-btn flex-1 text-[11px] py-1.5 rounded-lg border border-zinc-805 bg-zinc-900 text-zinc-400 font-bold cursor-pointer hover:border-zinc-700 hover:text-white transition-all text-center"
                                >
                                  Cancel
                                </button>
                                <button 
                                  onClick={() => handleExecuteYield(m.id, m.recommendation!)}
                                  className="exec-btn primary flex-1 text-[11px] py-1.5 rounded-lg bg-emerald-500 text-black hover:bg-emerald-400 font-extrabold cursor-pointer transition-all text-center"
                                >
                                  Execute
                                </button>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Associated Tool Call outputs (similar to Grok style) */}
                        {m.toolCalls && m.toolCalls.length > 0 && (
                          <div className="mt-3.5 pt-3.5 border-t border-white/5 flex flex-wrap gap-2">
                            {m.toolCalls.map((tc, tci) => (
                              <div 
                                key={tci}
                                className="px-3 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 flex items-center gap-1.5 font-mono text-[9px] text-zinc-400 shadow-sm"
                              >
                                <FileCode className="w-3 h-3 text-zinc-400" />
                                <span className="font-bold text-zinc-500">{tc.name}</span>
                                <span className="text-zinc-700">|</span>
                                <span className="text-zinc-400 select-all truncate max-w-[150px]" title={tc.result}>{tc.result}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* User Avatar */}
                    {isUser && (
                      <div className="w-8 h-8 rounded-2xl bg-[#5DCAA5]/10 border border-[#5DCAA5]/20 flex items-center justify-center shrink-0 shadow-md">
                        <Wallet className="w-3.5 h-3.5 text-[#5DCAA5]" />
                      </div>
                    )}
                  </motion.div>
                );
              })
            )}

            {/* Live Loading state indicators */}
            {isStreaming && (
              <div className="flex gap-3 max-w-[85%] items-start">
                <div className="w-8 h-8 rounded-2xl glass border border-zinc-850 bg-zinc-900 flex items-center justify-center shrink-0">
                  <Lock className="w-3.5 h-3.5 text-zinc-100" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] font-mono font-medium text-zinc-400 uppercase">
                    MetaPilot Agent
                  </span>
                  <div className="p-4 rounded-3xl glass border border-zinc-800 flex flex-col gap-2 min-w-[200px]">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-zinc-500 font-semibold uppercase tracking-wider">Calculating optimal route</span>
                      <div className="flex gap-1.5 py-1">
                        <span className="w-1.5 h-1.5 bg-[#5DCAA5] rounded-full animate-bounce [animation-delay:0s]" />
                        <span className="w-1.5 h-1.5 bg-[#5DCAA5] rounded-full animate-bounce [animation-delay:0.2s]" />
                        <span className="w-1.5 h-1.5 bg-[#5DCAA5] rounded-full animate-bounce [animation-delay:0.4s]" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Chat Core Outbound Input Block */}
          <div className="p-4 border-t border-white/5 bg-ink-950/80 shrink-0">
            {metamaskStatus !== "connected" ? (
              <div className="py-6 px-4 bg-zinc-950/40 border border-dashed border-white/5 rounded-2xl text-center flex flex-col items-center justify-center gap-3">
                <Lock className="w-5 h-5 text-zinc-650 shrink-0 animate-pulse" />
                <div className="space-y-1">
                  <p className="text-xs text-zinc-400 font-medium font-sans">MetaPilot Secured Gateway Offline</p>
                  <p className="text-[10px] text-zinc-650 leading-normal max-w-xs font-mono">Connect your MetaMask Web3 wallet on Arbitrum One to unlock active yield comparison, routing drafts, and live simulation execution.</p>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={connectMetaMask}
                    className="text-[10.5px] bg-[#5DCAA5] hover:bg-[#4cb391] text-zinc-950 font-bold px-5 py-2 rounded-xl cursor-pointer transition-all shadow-md shadow-[#5DCAA5]/10"
                  >
                    Connect MetaMask
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Context helpers parameters list */}
                <div className="flex flex-wrap gap-1.5 mb-3 items-center select-none">
                  <span className="text-[9px] text-zinc-650 font-mono uppercase tracking-widest hidden sm:block mr-1">
                    Suggested Drafts:
                  </span>
                  <button 
                    onClick={() => fillQuickPhrase("Where should I put my USDC?")}
                    className="text-[9.5px] font-mono font-bold text-zinc-400 hover:text-white bg-zinc-900 border border-white/5 hover:border-white/10 px-3 py-1 rounded-full transition-all cursor-pointer"
                  >
                    Optimize USDC
                  </button>
                  <button 
                    onClick={() => fillQuickPhrase("Suggest high yield pool for ETH")}
                    className="text-[9.5px] font-mono font-bold text-zinc-400 hover:text-white bg-zinc-900 border border-white/5 hover:border-white/10 px-3 py-1 rounded-full transition-all cursor-pointer"
                  >
                    Optimize ETH
                  </button>
                  <button 
                    onClick={() => fillQuickPhrase("Run BOLOS genuine attestation test")}
                    className="text-[9.5px] font-mono font-bold text-zinc-400 hover:text-white bg-zinc-900 border border-white/5 hover:border-white/10 px-3 py-1 rounded-full transition-all cursor-pointer"
                  >
                    Seculos Audits
                  </button>
                </div>

                {/* Input Submission */}
                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <div className="flex-1 glass rounded-2xl border border-white/5 focus-within:border-zinc-500 transition-all flex items-center px-4 py-3 gap-3 relative bg-zinc-950/20">
                    <input 
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Ask 'Where should I put my USDC?', suggest ETH yield, or run ledger audits..."
                      disabled={isStreaming}
                      className="flex-1 bg-transparent text-sm text-zinc-200 placeholder-zinc-650 focus:outline-none"
                    />
                  </div>

                  <button 
                    type="submit"
                    disabled={isStreaming || !searchQuery.trim()}
                    className="px-6 bg-zinc-100 hover:bg-white text-zinc-950 font-display font-black text-sm rounded-2xl cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-1.5 active:scale-95 shadow-lg shadow-white/5 shrink-0"
                  >
                    <span>Send</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              </>
            )}
          </div>
        </main>

        {/* Right Side Panel - Markets Spot Action & Yields */}
        <SpeculosEmulator 
          txLog={txLog}
          selectedToken={selectedToken}
          setSelectedToken={setSelectedToken}
          balances={balances}
          alerts={alerts}
          onAddAlert={handleAddAlert}
          onDeleteAlert={handleDeleteAlert}
          prices={prices}
          onSimulatePriceTick={handleSimulatePriceTick}
          onOpenReceiptDetails={handleOpenReceiptDetails}
          activeTab={rightPanelTab}
          onActiveTabChange={setRightPanelTab}
        />
      </div>

      {/* ── TRANSACTION DETAIL LEDGER OVERLAYS ───────────────────────── */}
      <TransactionLogModal 
        isOpen={receiptModalOpen}
        onClose={() => setReceiptModalOpen(false)}
        tx={selectedReceiptTx}
      />

      {/* ── EXECUTION CONFIRMATION OVERLAYS ───────────────────────── */}
      <ExecutionPlanModal 
        isOpen={executionModalOpen}
        onClose={() => setExecutionModalOpen(false)}
        onConfirm={confirmBroadcastRoutePlan}
        plan={activeExecutionPlan}
        isDemoWalletMode={isDemoWalletMode}
      />

      {/* ── SETTINGS CONFIGURATION OVERLAYS ───────────────────────── */}
      <SettingsModal 
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        settings={settings}
        balances={balances}
        onSave={handleSaveSettings}
      />

      {/* ── TOAST STACK SYSTEM ─────────────────────────────────── */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div 
              key={t.id}
              layout
              initial={{ opacity: 0, y: 15, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className={`p-3.5 rounded-2xl border flex items-center gap-2.5 shadow-2xl pointer-events-auto bg-[#07070d] ${
                t.type === "success" ? 'border-emerald-500/30 text-emerald-300' 
                : t.type === "warning" ? 'border-amber-500/30 text-amber-300' 
                : t.type === "error" ? 'border-rose-500/30 text-rose-300' 
                : 'border-white/5 text-zinc-300'
              }`}
            >
              {t.type === "success" && <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />}
              {t.type === "warning" && <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />}
              {t.type === "error" && <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />}
              {t.type !== "success" && t.type !== "warning" && t.type !== "error" && <Lock className="w-4 h-4 text-indigo-400 shrink-0" />}
              <span className="text-[11px] font-sans font-medium">{t.msg}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

    </div>
  );
}
