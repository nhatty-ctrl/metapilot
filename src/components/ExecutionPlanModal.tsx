import React from 'react';
import { 
  X, 
  Play, 
  ShieldCheck, 
  ShieldAlert, 
  ExternalLink,
  ChevronRight,
  Sparkles,
  ArrowRightLeft,
  Coins,
  ArrowUpRight
} from 'lucide-react';
import { ExecutionPlan } from '../types';

interface ExecutionPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  plan: ExecutionPlan | null;
  isDemoWalletMode: boolean;
}

export const ExecutionPlanModal: React.FC<ExecutionPlanModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  plan,
  isDemoWalletMode
}) => {
  if (!isOpen || !plan) return null;

  const isHighRisk = plan.risk === "High";
  const isMediumRisk = plan.risk === "Medium";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop overlay */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Modal Card frame */}
      <div className="relative w-full max-w-lg bg-[#0c0c12]/95 border border-white/10 rounded-3xl overflow-hidden shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] z-10 flex flex-col">
        {/* Header segment */}
        <div className="p-5 border-b border-white/5 flex items-center justify-between bg-zinc-950/40">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-xl ${
              plan.action === 'deposit' ? 'bg-[#5DCAA5]/10 text-[#5DCAA5]' : 'bg-indigo-500/10 text-indigo-400'
            }`}>
              {plan.action === 'deposit' ? <Sparkles className="w-4 h-4" /> : <ArrowRightLeft className="w-4 h-4" />}
            </div>
            <div>
              <h3 className="font-semibold text-sm text-white font-sans">
                MetaPilot Routing Plan
              </h3>
              <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
                {isDemoWalletMode ? "Sandbox Execution Preview" : "Connected Wallet Simulation Preview"}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full border border-white/5 hover:border-white/10 bg-zinc-900/40 text-zinc-500 hover:text-white flex items-center justify-center transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content body segment */}
        <div className="p-6 space-y-5 flex-1 overflow-y-auto">
          {/* Asset Summary Details */}
          <div className="p-4 bg-zinc-950/50 rounded-2xl border border-white/5 space-y-3">
            <div className="flex justify-between items-center pb-2.5 border-b border-white/[0.04] text-xs">
              <span className="text-zinc-500 font-mono">Intent Action</span>
              <span className="font-semibold text-zinc-200 uppercase tracking-wide text-[11px] font-mono">
                {plan.action}
              </span>
            </div>
            <div className="flex justify-between items-center pb-2.5 border-b border-white/[0.04] text-xs">
              <span className="text-zinc-500 font-mono">Interacting Protocol</span>
              <span className="font-bold text-zinc-100 font-sans flex items-center gap-1.5">
                <Coins className="w-3.5 h-3.5 text-[#5DCAA5]" />
                {plan.protocol}
              </span>
            </div>
            <div className="flex justify-between items-center pb-2.5 border-b border-white/[0.04] text-xs">
              <span className="text-zinc-500 font-mono">Allocation Size</span>
              <span className="font-extrabold text-white font-mono">{plan.amount}</span>
            </div>
            {plan.apy && plan.apy !== "0%" && (
              <div className="flex justify-between items-center pb-2.5 border-b border-white/[0.04] text-xs">
                <span className="text-zinc-500 font-mono">Optimized APY</span>
                <span className="text-[#5DCAA5] font-black font-mono flex items-center gap-0.5">
                  <ArrowUpRight className="w-3.5 h-3.5 text-[#5DCAA5]" />
                  {plan.apy}
                </span>
              </div>
            )}
            <div className="flex justify-between items-center text-xs">
              <span className="text-zinc-500 font-mono">Route Risk Score</span>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono ${
                isHighRisk ? 'bg-rose-950/40 text-rose-400 border border-rose-900/30' :
                isMediumRisk ? 'bg-amber-950/40 text-amber-400 border border-amber-900/30' :
                'bg-emerald-950/40 text-emerald-400 border border-emerald-900/30'
              }`}>
                {plan.risk || "Low"} Risk
              </span>
            </div>
          </div>

          {/* Step-by-Step execution process checklist */}
          <div className="space-y-3">
            <h4 className="text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-500 px-1">
              Executing Routing Path ({plan.steps.length} Steps)
            </h4>
            <div className="space-y-2">
              {plan.steps.map((step, idx) => (
                <div 
                  key={idx} 
                  className="bg-zinc-950/20 border border-white/[0.02] hover:border-white/5 p-3 rounded-xl flex gap-3 items-start transition-all group"
                >
                  <div className="w-5 h-5 rounded-full bg-zinc-900 border border-white/5 text-[9.5px] font-mono font-black text-zinc-500 group-hover:text-[#5DCAA5] group-hover:border-[#5DCAA5]/30 flex items-center justify-center shrink-0 transition-all">
                    {idx + 1}
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-[11.5px] leading-relaxed text-zinc-300 font-sans tracking-wide">
                      {step}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Safety Check alert callout */}
          <div className="p-3 bg-emerald-950/10 border border-emerald-500/10 rounded-xl flex gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <p className="text-[10px] font-sans font-bold text-emerald-300">MetaPilot Secure Sandboxing Active</p>
              <p className="text-[9.5px] font-mono text-zinc-500 leading-relaxed">
                {isDemoWalletMode
                  ? "This action runs in demo mode and cannot touch a real wallet."
                  : "MetaMask granted address-read access only. This app will create a local simulated receipt here; a real signature or transaction would still require a separate MetaMask confirmation."}
              </p>
            </div>
          </div>
        </div>

        {/* Action Button Footer */}
        <div className="p-5 border-t border-white/5 bg-zinc-950/40 flex gap-2.5">
          <button
            onClick={onClose}
            className="flex-1 py-3 text-xs font-mono font-bold text-zinc-400 hover:text-white bg-zinc-900 border border-white/5 hover:border-white/10 rounded-2xl cursor-pointer transition-all text-center"
          >
            Cancel Route
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-3 text-xs font-sans font-extrabold text-[#0c0c12] bg-[#5DCAA5] hover:bg-emerald-400 rounded-2xl cursor-pointer transition-all text-center flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/10 active:scale-95"
          >
            <span>{isDemoWalletMode ? "Confirm Demo Route" : "Confirm Simulation"}</span>
            <ChevronRight className="w-4 h-4 shrink-0 stroke-[2.5]" />
          </button>
        </div>
      </div>
    </div>
  );
};
