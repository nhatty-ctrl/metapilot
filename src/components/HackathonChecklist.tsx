import React, { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, Loader, Trophy } from 'lucide-react';

interface HackathonChecklistProps {
  isOpen: boolean;
  onClose: () => void;
}

export function HackathonChecklist({ isOpen, onClose }: HackathonChecklistProps) {
  const [loading, setLoading] = useState(false);
  const [metamaskQualified, setMetamaskQualified] = useState<boolean | null>(null);
  const [arbitrumQualified, setArbitrumQualified] = useState<boolean | null>(null);
  const [checks, setChecks] = useState<Record<string, any>>({});
  const [recommendations, setRecommendations] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen) {
      fetchQualificationStatus();
    }
  }, [isOpen]);

  const fetchQualificationStatus = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/hackathon/qualification');
      const data = await response.json();

      if (data.success) {
        setMetamaskQualified(data.data.qualifications.metamaskHackathon);
        setArbitrumQualified(data.data.qualifications.arbitrumHackathon);
        setChecks(data.data.checks);
        setRecommendations(data.data.summary.recommendations);
      }
    } catch (error) {
      console.error('Error fetching qualification status:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const CheckItem = ({ status, label }: { status?: boolean; label: string }) => (
    <div className="flex items-center gap-3 p-2">
      {status ? (
        <CheckCircle className="w-5 h-5 text-green-400" />
      ) : (
        <AlertCircle className="w-5 h-5 text-red-400" />
      )}
      <span className={status ? "text-gray-300" : "text-gray-400"}>{label}</span>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl border border-cyan-500/30 shadow-2xl">
        <div className="p-6 border-b border-cyan-500/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Trophy className="w-6 h-6 text-yellow-400" />
              <h2 className="text-2xl font-bold text-white">Hackathon Qualification Checker</h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader className="w-8 h-8 text-cyan-400 animate-spin" />
              <span className="ml-3 text-gray-300">Running qualification checks...</span>
            </div>
          ) : (
            <>
              {/* Overall Status */}
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className={`p-4 rounded-lg border-2 ${
                  metamaskQualified 
                    ? "bg-green-900/20 border-green-500/50" 
                    : "bg-red-900/20 border-red-500/50"
                }`}>
                  <div className="flex items-center gap-2 mb-2">
                    {metamaskQualified ? (
                      <CheckCircle className="w-5 h-5 text-green-400" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-red-400" />
                    )}
                    <span className="text-sm font-semibold text-gray-300">MetaMask Hackathon</span>
                  </div>
                  <p className={`text-lg font-bold ${metamaskQualified ? "text-green-400" : "text-red-400"}`}>
                    {metamaskQualified ? "✓ QUALIFIED" : "✗ NOT QUALIFIED"}
                  </p>
                </div>

                <div className={`p-4 rounded-lg border-2 ${
                  arbitrumQualified 
                    ? "bg-green-900/20 border-green-500/50" 
                    : "bg-red-900/20 border-red-500/50"
                }`}>
                  <div className="flex items-center gap-2 mb-2">
                    {arbitrumQualified ? (
                      <CheckCircle className="w-5 h-5 text-green-400" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-red-400" />
                    )}
                    <span className="text-sm font-semibold text-gray-300">Arbitrum Hackathon</span>
                  </div>
                  <p className={`text-lg font-bold ${arbitrumQualified ? "text-green-400" : "text-red-400"}`}>
                    {arbitrumQualified ? "✓ QUALIFIED" : "✗ NOT QUALIFIED"}
                  </p>
                </div>
              </div>

              {/* MetaMask Checks */}
              <div className="mb-6">
                <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-400" />
                  MetaMask Requirements
                </h3>
                <div className="bg-slate-800/50 rounded-lg p-4 space-y-2">
                  <CheckItem
                    status={checks.metaMaskSmartAccounts?.metaMaskSmartAccountsKit}
                    label="MetaMask Smart Accounts Kit Installed"
                  />
                  <CheckItem
                    status={checks.metaMaskSmartAccounts?.erc7715Support}
                    label="ERC-7715 Advanced Permissions Enabled"
                  />
                  <CheckItem
                    status={checks.oneShortRelayer?.connectivity}
                    label="1Shot Relayer Accessible"
                  />
                  <CheckItem
                    status={checks.veniceAI?.apiConnectivity}
                    label="Venice AI API Connected"
                  />
                  <CheckItem
                    status={checks.database?.databaseConnected}
                    label="Database Connected"
                  />
                </div>
              </div>

              {/* Arbitrum Checks */}
              <div className="mb-6">
                <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-blue-400" />
                  Arbitrum Requirements
                </h3>
                <div className="bg-slate-800/50 rounded-lg p-4 space-y-2">
                  <CheckItem
                    status={checks.arbitrumSetup?.rpcConnectivity}
                    label="Arbitrum RPC Connectivity"
                  />
                  <CheckItem
                    status={checks.arbitrumSetup?.contractsDeployed}
                    label="Smart Contracts Deployed"
                  />
                  <CheckItem
                    status={checks.walletBalanceFetching?.ethersJsInstalled}
                    label="Ethers.js Installed"
                  />
                  <CheckItem
                    status={checks.walletBalanceFetching?.priceOracleConnected}
                    label="Price Oracle Connected"
                  />
                  <CheckItem
                    status={checks.database?.databaseConnected}
                    label="Database Connected"
                  />
                </div>
              </div>

              {/* Recommendations */}
              {recommendations.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-yellow-400" />
                    Recommendations
                  </h3>
                  <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4">
                    <ul className="space-y-2">
                      {recommendations.map((rec, idx) => (
                        <li key={idx} className="text-sm text-yellow-200 flex items-start gap-2">
                          <span className="text-yellow-400 font-bold mt-0.5">•</span>
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-slate-700">
                <button
                  onClick={fetchQualificationStatus}
                  className="flex-1 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-lg text-white font-semibold transition"
                >
                  Refresh Status
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-white font-semibold transition"
                >
                  Close
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
