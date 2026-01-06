import React, { useState } from 'react';
import { AnalysisResult, StaffingRecommendation } from '../types';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend, LineChart, Line, AreaChart, Area
} from 'recharts';
import { 
  TrendingUp, Activity, DollarSign, ShieldAlert, 
  Target, Zap, Clock, AlertTriangle, CheckCircle, 
  BrainCircuit, History, ArrowLeftRight, Users, 
  ChevronRight, Download, Info, BarChart3, InfoIcon,
  ArrowUpRight, ArrowDownRight, Layers, LayoutDashboard,
  CheckCircle2, Gauge, FileSpreadsheet, ListFilter
} from 'lucide-react';

interface DashboardProps {
  data: AnalysisResult;
  onReset: () => void;
}

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const TIME_BLOCKS = ['00-04', '04-08', '08-12', '12-16', '16-20', '20-24'];

const exportToCSV = (data: any[], filename: string) => {
  if (!data || data.length === 0) return;
  
  // Get headers from first object keys
  const headers = Object.keys(data[0]);
  const csvRows = [];
  
  // Add header row
  csvRows.push(headers.join(','));
  
  // Add data rows
  for (const row of data) {
    const values = headers.map(header => {
      const val = row[header];
      const escaped = ('' + val).replace(/"/g, '""');
      return `"${escaped}"`;
    });
    csvRows.push(values.join(','));
  }
  
  const csvString = csvRows.join('\n');
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const Card: React.FC<{ 
  title: string; 
  icon: React.ReactNode; 
  children: React.ReactNode; 
  className?: string;
  insight?: string; 
  headerAction?: React.ReactNode;
}> = ({ title, icon, children, className = "", insight, headerAction }) => (
  <div className={`bg-slate-800/40 border border-slate-700/60 rounded-2xl p-6 shadow-xl backdrop-blur-sm flex flex-col ${className}`}>
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-2.5">
        <div className="p-2 bg-slate-700/50 rounded-xl text-blue-400">
          {icon}
        </div>
        <h3 className="text-sm font-bold text-slate-200 tracking-tight uppercase">{title}</h3>
      </div>
      {headerAction && <div>{headerAction}</div>}
    </div>
    <div className="flex-grow">
      {children}
    </div>
    {insight && (
      <div className="mt-6 pt-4 border-t border-slate-700/30">
        <div className="flex items-start gap-2">
          <Info className="w-3.5 h-3.5 text-blue-400 mt-0.5" />
          <p className="text-[11px] text-slate-400 leading-relaxed italic">
            <span className="font-bold text-slate-300 not-italic">Capacity Context:</span> {insight}
          </p>
        </div>
      </div>
    )}
  </div>
);

const Metric: React.FC<{ 
  label: string; 
  value: string | number; 
  baseline?: string | number;
  subtext?: string; 
  color?: string;
  tooltip: string;
  delta?: number;
  isImprovement?: boolean;
}> = ({ label, value, baseline, subtext, color = "text-slate-100", tooltip, delta, isImprovement }) => (
  <div className="group relative bg-slate-800/60 rounded-2xl p-6 border border-slate-700/50 transition-all hover:bg-slate-800 hover:border-slate-600">
    <div className="flex items-center justify-between mb-2">
      <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">{label}</p>
      <InfoIcon className="w-4 h-4 text-slate-600 cursor-help hover:text-blue-400 transition-colors" />
    </div>
    <div className="flex flex-col gap-1">
      <div className="flex items-baseline gap-3">
        <p className={`text-3xl font-black ${color}`}>{value}</p>
        {delta !== undefined && (
          <div className={`flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full ${
            isImprovement ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
          }`}>
            {isImprovement ? <ArrowDownRight className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
            {Math.abs(delta)}%
          </div>
        )}
      </div>
      {baseline !== undefined && <p className="text-[10px] text-slate-500 font-medium tracking-tight">Baseline: <span className="text-slate-400">{baseline}</span></p>}
    </div>
    {subtext && <p className="text-[10px] text-slate-500 mt-2 font-medium tracking-wide uppercase">{subtext}</p>}
  </div>
);

const Dashboard: React.FC<DashboardProps> = ({ data, onReset }) => {
  const [viewMode, setViewMode] = useState<'capacity' | 'staffing' | 'comparison'>('capacity');

  const getHeatmapColor = (intensity: number) => {
    if (intensity === 0) return 'bg-slate-800';
    if (intensity < 3) return 'bg-emerald-500/30';
    if (intensity < 6) return 'bg-amber-500/50';
    if (intensity < 8) return 'bg-orange-500/70';
    return 'bg-red-500/90';
  };

  const getHeatmapValue = (day: string, time: string) => {
    const point = data.temporal_heatmap?.find(p => 
      p.day.substring(0, 3).toLowerCase() === day.substring(0, 3).toLowerCase() && 
      p.time_block === time
    );
    return point ? point.intensity : 0;
  };

  const comp = data.historical_comparison;
  const base = data.baseline_metrics;

  const ExportButton = ({ dataToExport, filename }: { dataToExport: any[], filename: string }) => (
    <button 
      onClick={(e) => {
        e.stopPropagation();
        exportToCSV(dataToExport, filename);
      }}
      className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600 border border-blue-500/30 rounded-lg text-[10px] font-bold text-blue-400 transition-all uppercase tracking-widest hover:text-white group"
      title="Export to CSV"
    >
      <FileSpreadsheet className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
      <span>Export CSV</span>
    </button>
  );

  return (
    <div className="space-y-8 pb-10">
      
      {/* HEADER SECTION */}
      <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-blue-500/20 rounded-3xl p-8 relative overflow-hidden shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start">
          <div className="shrink-0 p-4 bg-blue-500/10 rounded-2xl border border-blue-500/20">
             <BrainCircuit className="w-10 h-10 text-blue-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-blue-400 text-xs font-black uppercase tracking-[0.2em] mb-3">Enterprise Capacity Synthesis</h3>
            <p className="text-slate-100 text-xl font-medium leading-relaxed max-w-4xl">
              {data.executive_summary}
            </p>
          </div>
          <div className="shrink-0 w-full md:w-auto flex flex-col gap-2">
             <div className="flex flex-wrap gap-2">
                <button 
                  onClick={() => setViewMode('capacity')}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all border ${
                    viewMode === 'capacity' ? 'bg-blue-600 border-blue-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                  }`}
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  Overview
                </button>
                <button 
                  onClick={() => setViewMode('staffing')}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all border ${
                    viewMode === 'staffing' ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  Staffing
                </button>
                <button 
                  onClick={() => setViewMode('comparison')}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all border ${
                    viewMode === 'comparison' ? 'bg-emerald-600 border-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)]' : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                  }`}
                >
                  <History className="w-3.5 h-3.5" />
                  Trends
                </button>
             </div>
             <button onClick={onReset} className="w-full text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-white transition-colors py-2.5 px-4 bg-slate-900/50 border border-slate-800 rounded-xl">
               New Analysis
             </button>
          </div>
        </div>
      </div>

      {/* CORE KPI GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Metric 
          label="SLA Breach Rate" 
          value={`${data.summary_metrics.sla_breach_rate_percent}%`} 
          baseline={`${base.sla_breach_rate_percent}%`}
          color={data.summary_metrics.sla_breach_rate_percent > 15 ? "text-red-400" : "text-emerald-400"}
          tooltip="Overall SLA health vs Historical Baseline."
          delta={comp.breach_rate_change_percent}
          isImprovement={comp.is_improvement.breach_rate}
        />
        <Metric 
          label="Est. Monthly Loss" 
          value={`$${(data.financial_impact.estimated_monthly_loss / 1000).toFixed(1)}k`} 
          baseline={`$${(base.estimated_monthly_loss / 1000).toFixed(1)}k`}
          color="text-rose-400"
          subtext="Revenue Leakage"
          tooltip="Quantified financial friction in the current period."
          delta={comp.loss_change_percent}
          isImprovement={comp.is_improvement.loss}
        />
        <Metric 
          label="Avg. Resolution" 
          value={`${data.summary_metrics.avg_resolution_time_hours.toFixed(1)}h`} 
          baseline={`${base.avg_resolution_time_hours.toFixed(1)}h`}
          color="text-blue-400"
          subtext="Lead Time Efficiency"
          tooltip="Average time taken to resolve issues."
          delta={comp.resolution_time_change_percent}
          isImprovement={comp.is_improvement.resolution_time}
        />
        <Metric 
          label="Workflow Load" 
          value={data.summary_metrics.total_tickets_analyzed} 
          baseline={base.total_tickets_analyzed}
          subtext="Demand Units"
          tooltip="Total volume of tickets analyzed."
        />
      </div>

      {/* VIEW MODES */}
      {viewMode === 'comparison' ? (
        <div className="space-y-8">
           <Card 
            title="Historical Performance Comparison" 
            icon={<History className="w-4 h-4" />} 
            insight={`Comparison of current execution against ${comp.period_label} historical benchmarks.`}
            headerAction={<ExportButton dataToExport={[
              { metric: 'SLA Breach Rate', current: data.summary_metrics.sla_breach_rate_percent, baseline: base.sla_breach_rate_percent, change: comp.breach_rate_change_percent },
              { metric: 'Resolution velocity', current: data.summary_metrics.avg_resolution_time_hours, baseline: base.avg_resolution_time_hours, change: comp.resolution_time_change_percent },
              { metric: 'Monthly Loss', current: data.financial_impact.estimated_monthly_loss, baseline: base.estimated_monthly_loss, change: comp.loss_change_percent }
            ]} filename="historical_benchmarking" />}
           >
             <div className="overflow-x-auto">
               <table className="w-full text-left text-sm">
                 <thead>
                    <tr className="border-b border-slate-700 text-slate-500 font-bold uppercase text-[10px] tracking-widest">
                      <th className="px-6 py-4">Metric Segment</th>
                      <th className="px-6 py-4">Current Period</th>
                      <th className="px-6 py-4">Baseline ({comp.period_label})</th>
                      <th className="px-6 py-4">Variance</th>
                      <th className="px-6 py-4">Status</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-700/50">
                    <tr className="hover:bg-slate-700/20 transition-colors">
                      <td className="px-6 py-5 font-bold text-slate-200">SLA Breach Rate</td>
                      <td className="px-6 py-5 text-slate-100 font-black">{data.summary_metrics.sla_breach_rate_percent}%</td>
                      <td className="px-6 py-5 text-slate-400">{base.sla_breach_rate_percent}%</td>
                      <td className={`px-6 py-5 font-black ${comp.is_improvement.breach_rate ? 'text-emerald-400' : 'text-red-400'}`}>
                        {comp.breach_rate_change_percent > 0 ? '+' : ''}{comp.breach_rate_change_percent}%
                      </td>
                      <td className="px-6 py-5">
                         <div className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase border ${comp.is_improvement.breach_rate ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                            {comp.is_improvement.breach_rate ? <CheckCircle2 className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                            {comp.is_improvement.breach_rate ? 'Target Achieved' : 'Improvement Required'}
                         </div>
                      </td>
                    </tr>
                    <tr className="hover:bg-slate-700/20 transition-colors">
                      <td className="px-6 py-5 font-bold text-slate-200">Resolution Velocity</td>
                      <td className="px-6 py-5 text-slate-100 font-black">{data.summary_metrics.avg_resolution_time_hours}h</td>
                      <td className="px-6 py-5 text-slate-400">{base.avg_resolution_time_hours}h</td>
                      <td className={`px-6 py-5 font-black ${comp.is_improvement.resolution_time ? 'text-emerald-400' : 'text-red-400'}`}>
                        {comp.resolution_time_change_percent > 0 ? '+' : ''}{comp.resolution_time_change_percent}%
                      </td>
                      <td className="px-6 py-5">
                         <div className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase border ${comp.is_improvement.resolution_time ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                            {comp.is_improvement.resolution_time ? <Zap className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                            {comp.is_improvement.resolution_time ? 'Velocity Improved' : 'Bottleneck Detected'}
                         </div>
                      </td>
                    </tr>
                    <tr className="hover:bg-slate-700/20 transition-colors">
                      <td className="px-6 py-5 font-bold text-slate-200">Execution Cost (Loss)</td>
                      <td className="px-6 py-5 text-slate-100 font-black">${data.financial_impact.estimated_monthly_loss.toLocaleString()}</td>
                      <td className="px-6 py-5 text-slate-400">${base.estimated_monthly_loss.toLocaleString()}</td>
                      <td className={`px-6 py-5 font-black ${comp.is_improvement.loss ? 'text-emerald-400' : 'text-red-400'}`}>
                        {comp.loss_change_percent > 0 ? '+' : ''}{comp.loss_change_percent}%
                      </td>
                      <td className="px-6 py-5">
                         <div className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase border ${comp.is_improvement.loss ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                            {comp.is_improvement.loss ? <DollarSign className="w-3 h-3" /> : <ShieldAlert className="w-3 h-3" />}
                            {comp.is_improvement.loss ? 'Loss Reduced' : 'Leakage Warning'}
                         </div>
                      </td>
                    </tr>
                 </tbody>
               </table>
             </div>
           </Card>

           <Card title="Comparative Metric Analysis" icon={<BarChart3 className="w-4 h-4" />} className="h-[400px]">
             <ResponsiveContainer width="100%" height="100%">
               <BarChart 
                data={[
                  { name: 'Breach %', curr: data.summary_metrics.sla_breach_rate_percent, base: base.sla_breach_rate_percent },
                  { name: 'Resolution (h)', curr: data.summary_metrics.avg_resolution_time_hours, base: base.avg_resolution_time_hours },
                  { name: 'Loss ($k)', curr: data.financial_impact.estimated_monthly_loss / 1000, base: base.estimated_monthly_loss / 1000 }
                ]}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
               >
                 <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                 <XAxis dataKey="name" stroke="#64748b" fontSize={11} fontWeight="bold" />
                 <YAxis stroke="#64748b" fontSize={11} />
                 <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: '1px solid #1e293b' }} />
                 <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', textTransform: 'uppercase', fontWeight: 'bold', paddingTop: '10px' }} />
                 <Bar dataKey="curr" name="Current Performance" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                 <Bar dataKey="base" name={`Baseline (${comp.period_label})`} fill="#334155" radius={[4, 4, 0, 0]} />
               </BarChart>
             </ResponsiveContainer>
           </Card>
        </div>
      ) : viewMode === 'staffing' ? (
        <div className="space-y-8 animate-fade-in">
           <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <Card title="Staffing Optimization ROI" icon={<Target className="w-4 h-4" />} className="lg:col-span-1" insight="Quantified benefits of re-allocating staff to match shift demand patterns.">
                <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-slate-900/60 rounded-2xl border border-slate-700/50">
                          <span className="text-[10px] text-slate-500 font-bold uppercase block mb-1">Delay Reduction</span>
                          <p className="text-xl font-black text-emerald-400">-{data.staffing_roi.estimated_delay_reduction_percent}%</p>
                      </div>
                      <div className="p-4 bg-slate-900/60 rounded-2xl border border-slate-700/50">
                          <span className="text-[10px] text-slate-500 font-bold uppercase block mb-1">SLA Gain</span>
                          <p className="text-xl font-black text-blue-400">+{data.staffing_roi.sla_adherence_improvement_percent}%</p>
                      </div>
                    </div>
                    <div className="p-5 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl">
                      <div className="flex items-center gap-2 mb-2">
                          <DollarSign className="w-4 h-4 text-indigo-400" />
                          <span className="text-xs font-bold text-slate-200">Total Recovery Potential</span>
                      </div>
                      <p className="text-3xl font-black text-white">${data.staffing_roi.total_optimized_value.toLocaleString()}</p>
                      <p className="text-[10px] text-slate-500 mt-2 uppercase tracking-widest font-bold">Reduction in Revenue Leakage</p>
                    </div>
                </div>
              </Card>

              <Card 
                title="Workforce Capacity Optimizer" 
                icon={<Users className="w-4 h-4" />} 
                className="lg:col-span-2" 
                insight="Optimal agent count per shift based on volume-to-capacity modeling."
                headerAction={<ExportButton dataToExport={data.staffing_recommendations} filename="staffing_recommendations" />}
              >
                <div className="overflow-x-auto">
                   <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="border-b border-slate-700 text-slate-500 font-bold uppercase text-[10px] tracking-widest">
                          <th className="px-4 py-3">Shift Segment</th>
                          <th className="px-4 py-3">Current Est.</th>
                          <th className="px-4 py-3">Optimal</th>
                          <th className="px-4 py-3">Staffing Gap</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-700/50">
                        {data.staffing_recommendations.map((rec, idx) => (
                          <tr key={idx} className="hover:bg-slate-700/20 transition-colors">
                            <td className="px-4 py-4 font-bold text-slate-200">{rec.shift_name}</td>
                            <td className="px-4 py-4 text-slate-400 font-bold">{rec.current_estimated_agents}</td>
                            <td className="px-4 py-4 text-slate-100 font-black">{rec.recommended_agents}</td>
                            <td className="px-4 py-4">
                              <span className={`font-bold px-2 py-0.5 rounded text-[11px] ${rec.gap > 0 ? 'bg-red-500/10 text-red-400' : rec.gap < 0 ? 'bg-blue-500/10 text-blue-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                                {rec.gap > 0 ? `+${rec.gap} Need` : rec.gap < 0 ? `${Math.abs(rec.gap)} Excess` : 'Aligned'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                   </table>
                </div>
                <div className="mt-4 p-4 bg-slate-900/40 rounded-xl border border-slate-700/50">
                   <p className="text-[10px] text-slate-500 font-black uppercase mb-2">Shift Optimization Logic</p>
                   <p className="text-xs text-slate-300 italic">{data.staffing_recommendations[0]?.justification}</p>
                </div>
              </Card>
           </div>
        </div>
      ) : (
        <div className="space-y-8 animate-fade-in">
           <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <Card 
                title="Shift Capacity Dynamics" 
                icon={<Clock className="w-4 h-4" />} 
                className="lg:col-span-2" 
                insight="Volume visualization to detect execution stress points per shift."
              >
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.shift_analysis} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                      <XAxis dataKey="shift_name" stroke="#64748b" fontSize={11} fontWeight="bold" />
                      <YAxis stroke="#64748b" fontSize={11} />
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: '1px solid #1e293b' }} />
                      <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', textTransform: 'uppercase', fontWeight: 'bold' }} />
                      <Bar dataKey="ticket_volume" name="Ticket Volume" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
                      <Bar dataKey="breach_rate_percent" name="Breach Rate %" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={40} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              <Card title="Critical Risk Signals" icon={<ShieldAlert className="w-4 h-4" />} insight="Automated signal detection highlighting urgent capacity risks.">
                <div className="space-y-4">
                  {data.bottlenecks.map((b, i) => (
                    <div key={i} className="p-4 bg-rose-500/5 border-l-4 border-rose-500 rounded-r-xl group hover:bg-rose-500/10 transition-all">
                       <p className="text-xs text-slate-200 font-bold leading-relaxed">{b}</p>
                    </div>
                  ))}
                  {data.bottlenecks.length === 0 && <p className="text-xs text-slate-500 italic">No critical risks detected in this period.</p>}
                </div>
              </Card>

              {/* NEW AGENT PERFORMANCE TABLE WITH CSV EXPORT BUTTON */}
              <Card 
                title="Agent Performance by Shift" 
                icon={<ListFilter className="w-4 h-4" />} 
                className="lg:col-span-3"
                insight="Operational performance breakdown used for capacity evaluation and team KPI tracking."
                headerAction={<ExportButton dataToExport={data.shift_analysis} filename="agent_performance_analysis" />}
              >
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-slate-700 text-slate-500 font-bold uppercase text-[10px] tracking-widest">
                        <th className="px-6 py-4">Shift Profile</th>
                        <th className="px-6 py-4">Ticket Volume</th>
                        <th className="px-6 py-4">Breach Rate (%)</th>
                        <th className="px-6 py-4">Avg Handling (h)</th>
                        <th className="px-6 py-4 text-right">Stress Score</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700/50">
                      {data.shift_analysis.map((shift, idx) => (
                        <tr key={idx} className="hover:bg-slate-700/20 transition-colors">
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-3">
                              <div className={`w-2 h-2 rounded-full ${
                                shift.stress_score > 7 ? 'bg-red-500 animate-pulse' : 
                                shift.stress_score > 4 ? 'bg-amber-500' : 'bg-emerald-500'
                              }`} />
                              <span className="font-bold text-slate-200">{shift.shift_name}</span>
                            </div>
                          </td>
                          <td className="px-6 py-5 text-slate-300 font-medium">{shift.ticket_volume}</td>
                          <td className="px-6 py-5">
                            <span className={`font-black ${shift.breach_rate_percent > 15 ? 'text-red-400' : 'text-slate-100'}`}>
                              {shift.breach_rate_percent}%
                            </span>
                          </td>
                          <td className="px-6 py-5 text-slate-400">{shift.avg_handling_time_hours.toFixed(1)}h</td>
                          <td className="px-6 py-5 text-right">
                            <span className={`px-2 py-1 rounded text-[10px] font-black ${
                              shift.stress_score > 7 ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 
                              shift.stress_score > 4 ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 
                              'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            }`}>
                              {shift.stress_score}/10
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>

              <Card title="Temporal Workflow Heatmap" icon={<Activity className="w-4 h-4" />} className="lg:col-span-3" insight="Congestion points throughout the 24/7 cycle. Darker zones indicate severe stress.">
                <div className="h-[280px] flex flex-col pt-2">
                   <div className="flex-1 grid grid-cols-7 gap-1.5">
                      <div className="col-span-1"></div> 
                      {TIME_BLOCKS.map(time => (<div key={time} className="text-center text-[9px] text-slate-500 font-black uppercase">{time}</div>))}
                      {DAYS.map(day => (
                        <React.Fragment key={day}>
                           <div className="flex items-center justify-end pr-3 text-[9px] text-slate-400 font-black uppercase">{day}</div>
                           {TIME_BLOCKS.map(time => {
                             const intensity = getHeatmapValue(day, time);
                             return (
                               <div 
                                 key={`${day}-${time}`} 
                                 title={`${day} ${time}: Stress ${intensity}/10`}
                                 className={`rounded-md min-h-[24px] transition-all hover:ring-2 hover:ring-blue-400 cursor-pointer ${getHeatmapColor(intensity)}`} 
                               />
                             );
                           })}
                        </React.Fragment>
                      ))}
                   </div>
                   <div className="mt-6 flex justify-end items-center gap-4">
                      <div className="flex items-center gap-2 text-[9px] text-slate-500 font-bold uppercase">
                         <span>Stable</span>
                         <div className="flex gap-1">
                            {[0, 2, 5, 8, 10].map(v => <div key={v} className={`w-3 h-3 rounded-sm ${getHeatmapColor(v)}`} />)}
                         </div>
                         <span>Extreme</span>
                      </div>
                   </div>
                </div>
              </Card>
           </div>
        </div>
      )}

      {/* FOOTER INSIGHTS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         <Card title="Revenue Leakage Forecast" icon={<DollarSign className="w-4 h-4" />} insight="Linear projection of financial impact if operational friction remains unmitigated.">
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.loss_trend} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorLoss" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="date" stroke="#64748b" fontSize={10} />
                  <YAxis stroke="#64748b" fontSize={10} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: '1px solid #1e293b' }} />
                  <Area type="monotone" dataKey="loss_value" name="Loss Intensity" stroke="#ef4444" fillOpacity={1} fill="url(#colorLoss)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
         </Card>

         <Card title="Actionable Staffing Plan" icon={<Zap className="w-4 h-4" />} insight="Prioritized corrective actions synthesized by the AI Operational Analyst.">
            <div className="space-y-4 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
               {data.recommended_actions.map((rec, i) => (
                 <div key={i} className="p-4 bg-slate-900/40 border border-slate-700 rounded-xl hover:border-blue-500/30 transition-all">
                    <p className="text-[10px] text-blue-400 font-black uppercase mb-1">{rec.expected_impact} Expected</p>
                    <p className="text-xs text-slate-200 font-semibold">{rec.action}</p>
                 </div>
               ))}
            </div>
         </Card>
      </div>
    </div>
  );
};

export default Dashboard;