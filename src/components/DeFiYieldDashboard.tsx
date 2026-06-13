import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import { Percent, TrendingUp, Sparkles, Building2 } from 'lucide-react';

const HISTORICAL_APY_DATA = [
  { protocol: 'Lido Staking', Q1_APY: 3.20, Q2_APY: 3.50, Q3_APY: 4.10, Current_APY: 3.85, fill: '#3b82f6' },
  { protocol: 'Aave V3', Q1_APY: 5.40, Q2_APY: 6.80, Q3_APY: 9.20, Current_APY: 12.42, fill: '#10b981' },
  { protocol: 'GMX GLP', Q1_APY: 11.50, Q2_APY: 14.25, Q3_APY: 16.00, Current_APY: 18.25, fill: '#f59e0b' },
  { protocol: 'Pendle Yield', Q1_APY: 12.00, Q2_APY: 15.50, Q3_APY: 19.80, Current_APY: 18.20, fill: '#ec4899' },
  { protocol: 'Camelot CL', Q1_APY: 18.20, Q2_APY: 21.00, Q3_APY: 26.50, Current_APY: 24.60, fill: '#5DCAA5' },
];

interface DeFiYieldDashboardProps {
  className?: string;
}

export const DeFiYieldDashboard: React.FC<DeFiYieldDashboardProps> = ({ className = "" }) => {
  return (
    <div className={`p-4 bg-zinc-950/50 border border-white/5 rounded-2xl space-y-4 shadow-xl backdrop-blur-md ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-zinc-900 border border-white/10 flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-[#5DCAA5]" />
          </div>
          <div>
            <h4 className="text-xs font-mono font-bold text-zinc-200 uppercase tracking-wider">Protocol APY Trends</h4>
            <span className="text-[9px] font-mono text-zinc-500">Comparative APY history over last 3 Quarters vs. Current</span>
          </div>
        </div>
        <div className="px-2.5 py-1 rounded-lg bg-[#5DCAA5]/10 border border-[#5DCAA5]/20 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-[#5DCAA5] animate-pulse" />
          <span className="text-[9px] font-mono text-[#5DCAA5] font-black uppercase">Optimized L2</span>
        </div>
      </div>

      {/* Recharts Bar Chart Container */}
      <div className="h-44 w-full bg-zinc-950/40 rounded-xl p-2 border border-white/[0.02]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={HISTORICAL_APY_DATA}
            margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
            <XAxis 
              dataKey="protocol" 
              stroke="#52525b" 
              fontSize={8} 
              fontFamily="monospace"
              tickLine={false} 
              axisLine={false}
            />
            <YAxis 
              stroke="#52525b" 
              fontSize={8} 
              fontFamily="monospace"
              tickLine={false} 
              axisLine={false} 
              unit="%"
            />
            <Tooltip
              cursor={{ fill: 'rgba(255,255,255,0.02)' }}
              contentStyle={{
                backgroundColor: '#09090b',
                borderColor: 'rgba(255,255,255,0.1)',
                borderRadius: '12px',
                fontSize: '10px',
                fontFamily: 'monospace',
                color: '#fff'
              }}
              labelStyle={{ fontWeight: 'bold', color: '#5DCAA5' }}
            />
            <Legend 
              verticalAlign="top" 
              height={20} 
              iconSize={6}
              iconType="circle"
              wrapperStyle={{ fontSize: '7.5px', fontFamily: 'monospace', letterSpacing: '0.05em' }}
            />
            <Bar dataKey="Q1_APY" name="Q1 APY" fill="#27272a" radius={[2, 2, 0, 0]} />
            <Bar dataKey="Q2_APY" name="Q2 APY" fill="#3f3f46" radius={[2, 2, 0, 0]} />
            <Bar dataKey="Q3_APY" name="Q3 APY" fill="#71717a" radius={[2, 2, 0, 0]} />
            <Bar dataKey="Current_APY" name="Current" fill="#5DCAA5" radius={[3, 3, 0, 0]}>
              {HISTORICAL_APY_DATA.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Insight Footer Grid */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="p-2 bg-zinc-900/40 rounded-xl border border-white/5">
          <p className="text-[14px] font-mono font-black text-[#5DCAA5]">24.60%</p>
          <p className="text-[7.5px] font-mono text-zinc-500 uppercase tracking-widest mt-0.5">Top APY (Camelot)</p>
        </div>
        <div className="p-2 bg-zinc-900/40 rounded-xl border border-white/5">
          <p className="text-[14px] font-mono font-black text-blue-400">AA</p>
          <p className="text-[7.5px] font-mono text-zinc-500 uppercase tracking-widest mt-0.5">Safety (Lido)</p>
        </div>
        <div className="p-2 bg-zinc-900/40 rounded-xl border border-white/5">
          <p className="text-[14px] font-mono font-black text-purple-400">$210.4M</p>
          <p className="text-[7.5px] font-mono text-zinc-500 uppercase tracking-widest mt-0.5">Max TVL Pool</p>
        </div>
      </div>
    </div>
  );
};
