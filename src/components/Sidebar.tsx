import React from 'react';
import { 
  MessageSquare, 
  Plus, 
  Compass, 
  ArrowRight, 
  Coins, 
  RefreshCw,
  Wallet,
  CoinsIcon
} from 'lucide-react';
import { Conversation, BalanceState, Network } from '../types';
import { formatCurrency } from '../utils/cryptoHelpers';

interface SidebarProps {
  conversations: Conversation[];
  activeConvId: string | null;
  balances: BalanceState;
  activeNetwork: Network;
  onSelectConv: (id: string | null) => void;
  onNewConv: () => void;
  onQuickFill: (text: string) => void;
  onResetSandbox: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  conversations,
  activeConvId,
  balances,
  activeNetwork,
  onSelectConv,
  onNewConv,
  onQuickFill,
  onResetSandbox
}) => {
  const getNetworkTicker = (net: Network) => {
    switch (net) {
      case Network.Bitcoin: return "BTC";
      case Network.Solana: return "SOL";
      case Network.Ethereum:
      case Network.Arbitrum:
      case Network.Base:
      default: return "ETH";
    }
  };

  const ethUSD = balances.ETH * 3082.50;
  const btcUSD = balances.BTC * 64920.00;
  const arbUSD = (balances.ARB || 0) * 0.95;
  const totalUSD = ethUSD + btcUSD + arbUSD + balances.USDT;

  return (
    <aside className="w-72 flex flex-col shrink-0 glass border-r border-white/5 bg-ink-950/70 overflow-hidden select-none">
      
      {/* Conversations Header */}
      <div className="p-4 border-b border-white/5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-3.5 h-3.5 text-zinc-400" />
          <span className="text-[10px] font-mono font-bold tracking-widest text-zinc-400 uppercase">
            Conversations
          </span>
        </div>
        <button 
          onClick={onNewConv}
          className="text-[10px] font-mono font-bold text-zinc-100 hover:text-white bg-zinc-800 hover:bg-zinc-750 border border-zinc-700 rounded-full px-3 py-1 cursor-pointer transition-all flex items-center gap-1 active:scale-95 shadow-sm"
        >
          <Plus className="w-2.5 h-2.5" />
          <span>New Chat</span>
        </button>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {conversations.length === 0 ? (
          <div className="p-4 text-center rounded-2xl border border-white/5 bg-white/[0.01]">
            <p className="text-[10px] font-mono text-zinc-500">No session logs recorded</p>
            <p className="text-[9px] text-zinc-650 mt-1">Ready for first encrypted chat</p>
          </div>
        ) : (
          conversations.map((c) => (
            <button
              key={c.id}
              onClick={() => onSelectConv(c.id)}
              className={`w-full text-left p-3 rounded-2xl border transition-all flex flex-col gap-1 cursor-pointer ${
                activeConvId === c.id
                  ? 'bg-zinc-900 border-zinc-700 ring-1 ring-zinc-800 text-zinc-100'
                  : 'bg-white/[0.01] hover:bg-white/[0.03] border-white/5 hover:border-white/10'
              }`}
            >
              <div className="text-xs font-semibold text-zinc-200 truncate pr-2">
                {c.title || "Untitled Session"}
              </div>
              <div className="flex items-center justify-between text-[9px] font-mono text-zinc-500 mt-1">
                <span>{c.messages.filter(m => m.role === 'assistant').length} responses</span>
                <span>{c.updatedAt}</span>
              </div>
            </button>
          ))
        )}
      </div>

      {/* Quick Action Block */}
      <div className="p-3 border-t border-white/5 flex flex-col gap-2 shrink-0">
        <div className="flex items-center gap-2 px-1 py-1">
          <Compass className="w-3.5 h-3.5 text-zinc-500" />
          <span className="text-[9px] font-mono font-bold tracking-widest text-zinc-500 uppercase">
            Quick Procedures
          </span>
        </div>

        <div className="space-y-1.5">
          <button 
            onClick={() => onQuickFill("Audit pocket and retrieve my secure hardware balances")}
            className="w-full flex items-center justify-between p-2.5 rounded-xl border border-white/5 hover:border-zinc-700 bg-white/[0.01] hover:bg-zinc-900 text-left transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-2">
              <Wallet className="w-3.5 h-3.5 text-zinc-400" />
              <div>
                <p className="text-[11px] font-bold text-zinc-300">Read Portfolio</p>
                <p className="text-[9px] font-mono text-zinc-500">Requires no signature</p>
              </div>
            </div>
            <ArrowRight className="w-3 h-3 text-zinc-650 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
          </button>

          <button 
            onClick={() => onQuickFill("Send 0.05 ETH to 0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045")}
            className="w-full flex items-center justify-between p-2.5 rounded-xl border border-white/5 hover:border-zinc-700 bg-white/[0.01] hover:bg-zinc-900 text-left transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-2">
              <ArrowRight className="w-3.5 h-3.5 text-zinc-400 rotate-[-45deg]" />
              <div>
                <p className="text-[11px] font-bold text-zinc-300">Outgoing Transfer</p>
                <p className="text-[9px] font-mono text-zinc-500">Staged on device</p>
              </div>
            </div>
            <ArrowRight className="w-3 h-3 text-zinc-650 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
          </button>

          <button 
            onClick={() => onQuickFill("Swap 0.5 ETH for USDT atomic contract")}
            className="w-full flex items-center justify-between p-2.5 rounded-xl border border-white/5 hover:border-zinc-750 bg-white/[0.01] hover:bg-zinc-900 text-left transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-2">
              <RefreshCw className="w-3.5 h-3.5 text-zinc-400" />
              <div>
                <p className="text-[11px] font-bold text-zinc-300">Perform Swap</p>
                <p className="text-[9px] font-mono text-zinc-500">Slippage protected</p>
              </div>
            </div>
            <ArrowRight className="w-3 h-3 text-zinc-650 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
          </button>
        </div>
      </div>

      {/* Asset Balances Panel */}
      <div className="p-4 border-t border-white/5 shrink-0 bg-ink-950/40">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Coins className="w-3.5 h-3.5 text-zinc-400" />
            <span className="text-[9px] font-mono font-bold tracking-widest text-zinc-400 uppercase">
              Current Balances
            </span>
          </div>
          <span className="text-[9px] font-mono font-bold text-zinc-400 bg-zinc-900 border border-white/5 px-2 py-0.5 rounded-full uppercase">
            Vault
          </span>
        </div>

        <div className="space-y-2 text-[11px] font-mono text-zinc-300">
          <div className="flex justify-between items-center bg-white/[0.01] border border-white/5 p-2 rounded-xl">
            <span className="text-zinc-500 font-semibold">{getNetworkTicker(activeNetwork)}</span>
            <span className="text-white font-bold">{balances.ETH.toFixed(4)}</span>
          </div>
          <div className="flex justify-between items-center bg-white/[0.01] border border-white/5 p-2 rounded-xl">
            <span className="text-zinc-500 font-semibold">WBTC</span>
            <span className="text-white font-bold">{balances.BTC.toFixed(5)}</span>
          </div>
          <div className="flex justify-between items-center bg-white/[0.01] border border-white/5 p-2 rounded-xl">
            <span className="text-zinc-500 font-semibold">ARB</span>
            <span className="text-white font-bold">{(balances.ARB || 0).toFixed(1)}</span>
          </div>
          <div className="flex justify-between items-center bg-white/[0.01] border border-white/5 p-2 rounded-xl">
            <span className="text-zinc-500 font-semibold">USDT</span>
            <span className="text-white font-bold">{balances.USDT.toLocaleString()}</span>
          </div>
        </div>

        {/* Total portfolio worth summary */}
        <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between">
          <span className="text-[9px] font-mono text-zinc-500 uppercase">Portfolio Value</span>
          <span className="text-sm font-sans font-bold text-white tracking-tight">
            {formatCurrency(totalUSD)}
          </span>
        </div>

        <button 
          onClick={onResetSandbox}
          className="w-full mt-3 py-2 text-[10px] font-mono text-zinc-500 hover:text-zinc-300 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
        >
          <RefreshCw className="w-2.5 h-2.5" />
          <span>Reset Sandbox Ledger</span>
        </button>
      </div>
    </aside>
  );
};
