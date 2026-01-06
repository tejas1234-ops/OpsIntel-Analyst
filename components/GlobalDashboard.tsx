import React from 'react';
import { GlobalSynthesisResult } from '../types';
import { 
  TrendingUp, TrendingDown, Target, ShieldAlert, 
  CheckCircle2, AlertTriangle, Briefcase, Info, 
  Activity, ArrowRight, Zap, Search, Layers, BarChart4
} from 'lucide-react';

interface GlobalDashboardProps {
  data: GlobalSynthesisResult;
}

const GlobalDashboard: React.FC<GlobalDashboardProps> = ({ data }) => {
  return (
    <div className="space-y-8 pb-12 animate-fade-in">
      
      {/* 1. MANAGEMENT INSIGHTS HERO */}
      <div className="bg-gradient-to-br from-indigo-900/40 to-slate-900/80 border border-indigo-500/30 rounded-3xl p-8 shadow-2xl backdrop-blur-md">
        <div className="flex flex-col md:flex-row gap-8 items-start">
          <div className="shrink-0 p-4 bg-indigo-500/10 rounded-2xl border border-indigo-500/20">
            <Zap className="w-10 h-10 text-indigo-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-indigo-400 text-xs font-black uppercase tracking-[0.2em] mb-3">Global Cross-Period Synthesis</h3>
            <p className="text-slate-100 text-xl font-medium leading-relaxed">
              {data.management_insights}
            </p>
            <div className="mt-6 p-4 bg-slate-900/60 rounded-xl border border-slate-700/50">
              <div className="flex items-center gap-2 mb-2">
                <BarChart4 className="w-4 h-4 text-emerald-400" />
                <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Structural Assessment</span>
              </div>
              <p className="text-sm text-slate-300 italic">{data.structural_assessment}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. WoW SUMMARY TABLE */}
      <div className="bg-slate-800/40 border border-slate-700/60 rounded-2xl overflow-hidden shadow-xl">
        <div className="px-6 py-4 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-400" />
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-tight">Period-over-Period Performance Matrix</h3>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] text-slate-500 font-bold uppercase tracking-widest border-b border-slate-700/50">
                <th className="px-6 py-4">Metric Segment</th>
                <th className="px-6 py-4">Baseline Trend</th>
                <th className="px-6 py-4">Current Execution</th>
                <th className="px-6 py-4">Trend Description</th>
                <th className="px-6 py-4 text-right">Impact</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/30">
              {data.wow_summary_table.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-700/20 transition-colors">
                  <td className="px-6 py-4">
                    <span className="text-sm font-bold text-slate-200">{row.metric}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-400">{row.previous_state}</td>
                  <td className="px-6 py-4 text-sm text-slate-100 font-semibold">{row.current_state}</td>
                  <td className="px-6 py-4 text-xs text-slate-500 italic">{row.trend_description}</td>
                  <td className="px-6 py-4 text-right">
                    <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${
                      row.impact_level === 'High' ? 'bg-red-500/10 text-red-400' :
                      row.impact_level === 'Medium' ? 'bg-amber-500/10 text-amber-400' :
                      'bg-blue-500/10 text-blue-400'
                    }`}>
                      {row.impact_level}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. POSITIVES VS NEGATIVES (Behavioral List) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* POSITIVES */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 px-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <h3 className="text-sm font-black text-slate-100 uppercase tracking-widest">Operational Gains (Positives)</h3>
          </div>
          <div className="grid gap-4">
            {data.positives.map((item, idx) => (
              <div key={idx} className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-5 hover:bg-emerald-500/10 transition-all">
                <div className="flex justify-between items-start mb-3">
                  <h4 className="text-emerald-400 font-black text-xs uppercase tracking-tight">{item.area}</h4>
                  <TrendingUp className="w-4 h-4 text-emerald-500/50" />
                </div>
                <p className="text-sm text-slate-100 font-semibold mb-2">{item.outcome}</p>
                <div className="space-y-2 mt-4 pt-4 border-t border-emerald-500/10">
                  <div>
                    <span className="text-[10px] text-slate-500 font-bold uppercase block">Root Driver</span>
                    <p className="text-xs text-slate-400 italic">{item.cause}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 font-bold uppercase block">Business Implication</span>
                    <p className="text-xs text-emerald-400/80">{item.implication}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* NEGATIVES */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 px-2">
            <AlertTriangle className="w-5 h-5 text-rose-400" />
            <h3 className="text-sm font-black text-slate-100 uppercase tracking-widest">Execution Risks (Negatives)</h3>
          </div>
          <div className="grid gap-4">
            {data.negatives.map((item, idx) => (
              <div key={idx} className="bg-rose-500/5 border border-rose-500/20 rounded-2xl p-5 hover:bg-rose-500/10 transition-all">
                <div className="flex justify-between items-start mb-3">
                  <h4 className="text-rose-400 font-black text-xs uppercase tracking-tight">{item.area}</h4>
                  <TrendingDown className="w-4 h-4 text-rose-500/50" />
                </div>
                <p className="text-sm text-slate-100 font-semibold mb-2">{item.outcome}</p>
                <div className="space-y-2 mt-4 pt-4 border-t border-rose-500/10">
                  <div>
                    <span className="text-[10px] text-slate-500 font-bold uppercase block">Trigger Condition</span>
                    <p className="text-xs text-slate-400 italic">{item.cause}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 font-bold uppercase block">Strategic Impact</span>
                    <p className="text-xs text-rose-400/80">{item.implication}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 4. RISK SIGNALS RADAR */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {data.risk_signals.map((risk, idx) => (
          <div key={idx} className="bg-slate-900/60 border border-slate-700/60 rounded-2xl p-6 relative overflow-hidden group hover:border-blue-500/30 transition-all">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <ShieldAlert className="w-12 h-12 text-blue-400" />
            </div>
            <h4 className="text-xs font-black text-blue-400 uppercase tracking-widest mb-4">Risk Signal {idx + 1}</h4>
            <p className="text-sm font-bold text-slate-200 mb-2">{risk.signal}</p>
            <p className="text-[11px] text-slate-500 mb-4 leading-relaxed"><span className="text-slate-400 font-bold">Trigger:</span> {risk.trigger}</p>
            <div className="mt-auto pt-4 border-t border-slate-700/50 flex items-center gap-2">
              <ArrowRight className="w-3.5 h-3.5 text-blue-500" />
              <span className="text-[10px] text-blue-300 font-bold uppercase tracking-tight">Rec: {risk.action}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GlobalDashboard;