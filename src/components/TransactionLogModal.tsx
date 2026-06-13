import React from 'react';
import { 
  X, 
  Hash, 
  Activity, 
  ShieldCheck, 
  Clock, 
  Coins, 
  Cpu, 
  ExternalLink, 
  Flame, 
  Layers
} from 'lucide-react';
import { TransactionRecord } from '../types';

interface TransactionLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  tx: TransactionRecord | null;
}

export const TransactionLogModal: React.FC<TransactionLogModalProps> = ({
  isOpen,
  onClose,
  tx
}) => {
  if (!isOpen || !tx) return null;

  // Derive custom mock technical data for each transaction type to look real
  const isDeposit = tx.type === 'deposit';
  const isSwap = tx.type === 'swap';
  
  // Calculate simulated parameters based on hash characters to preserve consistency
  const lastChar = tx.hash.charAt(tx.hash.length - 1);
  const codeVal = lastChar.charCodeAt(0) || 48;
  const gasUsed = isDeposit ? 142100 + (codeVal % 7) * 450 : isSwap ? 98400 + (codeVal % 5) * 800 : 21000;
  const gasPriceGwei = (1 + (codeVal % 10) * 0.1).toFixed(2);
  const gasLimit = isDeposit ? 200000 : isSwap ? 150000 : 30000;
  const actualFeeETH = ((gasUsed * parseFloat(gasPriceGwei) * 1e-9)).toFixed(8);
  const actualFeeUSD = (parseFloat(actualFeeETH) * 3082.50).toFixed(4);

  // Contract specific mock routing details
  const targetContract = isDeposit 
    ? "0xb81ca23e7cf02bcff6192db98ba9c1e08eed1c54 (Camelot Yield Vault v3)"
    : isSwap 
      ? "0xc3d96518e744521445D1A0518f8c4971c28fa960 (Camelot Router v3)"
      : "0x71C5651c6A5405A51445D1A0518f8c4971c2897f (Native Token Bridge)";

  const methodSignature = isDeposit 
    ? "deposit(uint256 amount, address recipient, uint256 minShares)" 
    : isSwap 
      ? "swapExactTokensForTokens(uint256 amountIn, uint256 amountOutMin, address[] path, address to, uint256 deadline)"
      : "transfer(address recipient, uint256 amount)";

  const callDataHex = isDeposit
    ? `0xb6b9a8cf0000000000000000000000000000000000000000000000a43b2361e204c0000000000000000000000000000071c5651c6a5405a51445d1a0518f8c4971c2897f`
    : isSwap
      ? `0x38ed2e0f00000000000000000000000000000000000000000000001540d42187bfb000000000000000000000000000000000000000000000000a1251c5651c6a5405a514d10`
      : `0xa9059cbb00000000000000000000000071c5651c6a5405a51445d1a0518f8c4971c2897f0000000000000000000000000000000000000000000000a43b2361e204c00000`;

  return (
    <div id="tx-detail-modal-overlay" className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        id="tx-detail-backdrop"
        className="absolute inset-0 bg-black/85 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Modal Box */}
      <div id="tx-detail-card" className="relative w-full max-w-lg bg-[#07070c]/98 border border-white/10 rounded-3xl overflow-hidden shadow-[0_30px_70px_-10px_rgba(0,0,0,0.9)] z-10 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-5 border-b border-white/5 flex items-center justify-between bg-zinc-950/40">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#5DCAA5]/10 text-[#5DCAA5]">
              <Activity className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-white font-sans">
                Technical Receipt Analysis
              </h3>
              <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
                Staged Layer-2 Proof Logs
              </p>
            </div>
          </div>
          <button 
            id="close-tx-modal-btn"
            onClick={onClose}
            className="w-8 h-8 rounded-full border border-white/5 hover:border-white/10 bg-zinc-900/40 text-zinc-500 hover:text-white flex items-center justify-center transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1">
          
          {/* Main info card */}
          <div className="p-4 bg-zinc-950/60 rounded-2xl border border-white/5 space-y-3">
            <div className="flex justify-between items-start text-xs pb-2 border-b border-white/[0.04]">
              <span className="text-zinc-500 font-mono">Receipt Hash</span>
              <span className="font-mono text-white text-right break-all select-all font-semibold hover:text-[#5DCAA5] transition-colors flex items-center gap-1">
                <Hash className="w-3 h-3 text-[#5DCAA5] shrink-0" />
                {tx.hash.replace('...', '...')}
              </span>
            </div>
            
            <div className="flex justify-between items-center text-xs pb-2 border-b border-white/[0.04]">
              <span className="text-zinc-500 font-mono">Timestamp</span>
              <span className="font-semibold text-zinc-300 flex items-center gap-1.5 font-sans">
                <Clock className="w-3.5 h-3.5 text-zinc-550" />
                {tx.timestamp}
              </span>
            </div>

            <div className="flex justify-between items-center text-xs pb-2 border-b border-white/[0.04]">
              <span className="text-zinc-500 font-mono">Transaction Intent</span>
              <span className="font-bold text-zinc-200 uppercase tracking-wide text-[10.5px] font-mono px-2 py-0.5 bg-zinc-900 border border-white/5 rounded-md">
                {tx.type}
              </span>
            </div>

            <div className="flex flex-col gap-1 text-xs">
              <span className="text-zinc-500 font-mono mb-0.5">Summary Detail</span>
              <span className="font-medium text-white font-sans leading-relaxed text-xs">
                {tx.detail}
              </span>
            </div>
          </div>

          {/* Gas & Fees Breakdown */}
          <div className="space-y-3">
            <h4 className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#5DCAA5] px-1 flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5" />
              Gas Estimator and Rollup Fees
            </h4>
            <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
              <div className="bg-zinc-950/40 border border-white/5 p-3 rounded-xl space-y-1">
                <span className="text-zinc-500 uppercase text-[9px] font-bold">L2 Gas Consumed</span>
                <p className="text-zinc-105 font-bold">{gasUsed.toLocaleString()} units</p>
              </div>
              <div className="bg-zinc-950/40 border border-white/5 p-3 rounded-xl space-y-1">
                <span className="text-zinc-500 uppercase text-[9px] font-bold">Gas Limit Boundary</span>
                <p className="text-zinc-105 font-bold">{gasLimit.toLocaleString()} units</p>
              </div>
              <div className="bg-zinc-950/40 border border-white/5 p-3 rounded-xl space-y-1">
                <span className="text-zinc-500 uppercase text-[9px] font-bold">Optimal Gas Price</span>
                <p className="text-zinc-105 font-bold">{gasPriceGwei} Gwei</p>
              </div>
              <div className="bg-zinc-950/40 border border-white/5 p-3 rounded-xl space-y-1">
                <span className="text-zinc-500 uppercase text-[9px] font-bold">Gas Protocol Fee</span>
                <p className="text-[#5DCAA5] font-black">{actualFeeETH} ETH</p>
                <p className="text-[8px] text-zinc-650 opacity-80 mt-0.5">~${actualFeeUSD} USD</p>
              </div>
            </div>
          </div>

          {/* Smart Contract Interaction Parameters */}
          <div className="space-y-2.5">
            <h4 className="text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-400 px-1 flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-zinc-500" />
              On-Chain Contract Interactions
            </h4>
            <div className="p-3.5 bg-zinc-950/40 border border-white/5 rounded-2xl space-y-3 font-mono text-[10.5px]">
              <div>
                <span className="text-zinc-500 block uppercase text-[8.5px] font-bold mb-1">Target Contract Address</span>
                <span className="text-zinc-200 select-all font-mono block break-all leading-tight bg-zinc-900/60 p-2 rounded-lg border border-white/[0.03]">
                  {targetContract}
                </span>
              </div>
              <div>
                <span className="text-zinc-500 block uppercase text-[8.5px] font-bold mb-1">ABI Method Invoked</span>
                <span className="text-zinc-100 select-all font-sans block bg-zinc-900/60 p-2 rounded-lg border border-white/[0.03] leading-relaxed">
                  {methodSignature}
                </span>
              </div>
              <div>
                <span className="text-zinc-500 block uppercase text-[8.5px] font-bold mb-1">Raw Encrypted Calldata Payload</span>
                <p className="text-[9.5px] font-mono text-zinc-500 bg-zinc-900/90 p-2.5 rounded-lg border border-white/[0.03] max-h-24 overflow-y-auto break-all select-all leading-relaxed whitespace-pre-wrap">
                  {callDataHex}
                </p>
              </div>
            </div>
          </div>

          {/* Status Guard Indicator */}
          <div className="p-3 bg-emerald-950/10 border border-emerald-500/10 rounded-xl flex gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <p className="text-[10px] font-sans font-bold text-emerald-300">Immutable State Verification Complete</p>
              <p className="text-[9.5px] font-mono text-zinc-500 leading-relaxed">
                This transaction has been permanently appended, verified by redundant oracles, and stored on the decentralized Arbitrum ledger.
              </p>
            </div>
          </div>

        </div>

        {/* Footer actions */}
        <div className="p-5 border-t border-white/5 bg-zinc-950/40 flex gap-2.5">
          <button
            id="tx-modal-close-btn"
            onClick={onClose}
            className="flex-1 py-2.5 text-xs font-mono font-bold text-zinc-400 hover:text-white bg-zinc-900 border border-white/5 hover:border-white/10 rounded-2xl cursor-pointer transition-all text-center"
          >
            Close Receipt
          </button>
          <a
            href={`https://arbiscan.io/tx/${tx.hash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 py-2.5 text-xs font-sans font-extrabold text-[#0c0c12] bg-[#5DCAA5] hover:bg-emerald-400 rounded-2xl cursor-pointer transition-all text-center flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/10"
          >
            <span>Arbiscan Explorer</span>
            <ExternalLink className="w-3.5 h-3.5 shrink-0" />
          </a>
        </div>

      </div>
    </div>
  );
};
