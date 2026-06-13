import React, { useState } from 'react';
import { Sliders, X, Sparkles, ShieldAlert } from 'lucide-react';
import { AppSettings, BalanceState } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  balances: BalanceState;
  onSave: (newSettings: AppSettings, newBalances: BalanceState) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  balances,
  onSave
}) => {
  const [apiUrl, setApiUrl] = useState(settings.apiUrl);
  const [walletAddr, setWalletAddr] = useState(settings.walletAddress);
  const [ethBal, setEthBal] = useState(balances.ETH.toString());
  const [btcBal, setBtcBal] = useState(balances.BTC.toString());
  const [usdtBal, setUsdtBal] = useState(balances.USDT.toString());
  const [arbBal, setArbBal] = useState((balances.ARB || 1250).toString());
  const [model, setModel] = useState(settings.model);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(
      {
        ...settings,
        apiUrl,
        walletAddress: walletAddr,
        model
      },
      {
        ETH: parseFloat(ethBal) || 0,
        BTC: parseFloat(btcBal) || 0,
        USDT: parseFloat(usdtBal) || 0,
        ARB: parseFloat(arbBal) || 0
      }
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div 
        className="glass rounded-3xl w-full max-w-md p-6 bg-ink-950/90 border border-white/10 shadow-3xl animate-in fade-in zoom-in duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex justify-between items-center mb-5">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-teal-bright" />
            <h3 className="font-display font-bold text-lg text-white">
              Hardware Settings
            </h3>
          </div>
          <button 
            onClick={onClose}
            className="text-zinc-500 hover:text-white bg-white/5 hover:bg-white/10 p-1.5 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-mono text-zinc-400 uppercase tracking-widest mb-1 shadow-sm">
              Model Endpoint Engine
            </label>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full bg-ink-900 border border-white/5 text-zinc-200 text-xs font-mono p-3 rounded-2xl focus:outline-none focus:border-teal-bright transition-colors cursor-pointer"
            >
              <option value="Grok 3 (Deepsearch Verified)">Grok 3 (Deepsearch Verified)</option>
              <option value="LedgerMind Guardian v2">LedgerMind Guardian v2</option>
              <option value="ST33 Hardware Authenticator">ST33 Hardware Authenticator</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-mono text-zinc-400 uppercase tracking-widest mb-1">
              Speculos CLI API Endpoint URL
            </label>
            <input 
              type="text" 
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
              placeholder="http://localhost:8000"
              className="w-full bg-ink-900 border border-white/5 rounded-2xl p-3 text-zinc-200 font-mono text-xs focus:outline-none focus:border-teal-bright transition-all"
            />
          </div>

          <div>
            <label className="block text-[10px] font-mono text-zinc-400 uppercase tracking-widest mb-1">
              Hardware Wallet Core Address
            </label>
            <input 
              type="text" 
              value={walletAddr}
              onChange={(e) => setWalletAddr(e.target.value)}
              placeholder="0x..."
              className="w-full bg-ink-900 border border-white/5 rounded-2xl p-3 text-zinc-200 font-mono text-xs focus:outline-none focus:border-teal-bright transition-all"
            />
          </div>

          <div className="grid grid-cols-4 gap-1.5">
            <div>
              <label className="block text-[8px] font-mono text-zinc-500 uppercase tracking-wider mb-1">
                ETH
              </label>
              <input 
                type="number" 
                step="0.0001"
                value={ethBal}
                onChange={(e) => setEthBal(e.target.value)}
                className="w-full bg-ink-900 border border-white/5 rounded-xl p-2 text-zinc-200 font-mono text-xs focus:outline-none focus:border-teal-bright"
              />
            </div>
            <div>
              <label className="block text-[8px] font-mono text-zinc-500 uppercase tracking-wider mb-1">
                BTC
              </label>
              <input 
                type="number" 
                step="0.0001"
                value={btcBal}
                onChange={(e) => setBtcBal(e.target.value)}
                className="w-full bg-ink-900 border border-white/5 rounded-xl p-2 text-zinc-200 font-mono text-xs focus:outline-none focus:border-teal-bright"
              />
            </div>
            <div>
              <label className="block text-[8px] font-mono text-zinc-500 uppercase tracking-wider mb-1">
                ARB
              </label>
              <input 
                type="number" 
                step="0.1"
                value={arbBal}
                onChange={(e) => setArbBal(e.target.value)}
                className="w-full bg-ink-900 border border-white/5 rounded-xl p-2 text-zinc-200 font-mono text-xs focus:outline-none focus:border-teal-bright"
              />
            </div>
            <div>
              <label className="block text-[8px] font-mono text-zinc-500 uppercase tracking-wider mb-1">
                USDT
              </label>
              <input 
                type="number" 
                step="0.01"
                value={usdtBal}
                onChange={(e) => setUsdtBal(e.target.value)}
                className="w-full bg-ink-900 border border-white/5 rounded-xl p-2 text-zinc-200 font-mono text-xs focus:outline-none focus:border-teal-bright"
              />
            </div>
          </div>

          <div className="p-3 bg-indigo-950/30 border border-indigo-500/10 rounded-2xl text-[10px] font-mono text-zinc-400 leading-relaxed flex gap-2">
            <Sparkles className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
            <span>
              Balances are managed inside the device sandbox state. Custom coordinates can be injected in real-time to simulate multiple asset indexes.
            </span>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-2 pt-2">
            <button 
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="bg-teal-bright hover:brightness-110 text-black font-display font-semibold text-xs py-2.5 px-6 rounded-full cursor-pointer transition-all active:scale-95"
            >
              Save Parameters
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
