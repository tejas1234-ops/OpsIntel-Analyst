import React, { useState, useCallback, useRef, useEffect } from 'react';
import { read, utils } from 'xlsx';
import { SAMPLE_DATA } from './constants';
import { analyzeWorkflow, analyzeGlobalSynthesis } from './services/geminiService';
import { AnalysisResult, AppStatus, User, UserRole, DatasetMetadata, GlobalSynthesisResult } from './types';
import Dashboard from './components/Dashboard';
import GlobalDashboard from './components/GlobalDashboard';
import { 
  BrainCircuit, UploadCloud, FileText, Loader2, 
  FileSpreadsheet, CheckCircle2, ShieldCheck, 
  LayoutDashboard, Database, LogOut,
  AlertCircle, Sparkles,
  Globe, Clipboard,
  Trash2, FileJson, X, ShieldAlert
} from 'lucide-react';

const ANALYSIS_STEPS = [
  { title: "Data Ingestion & Normalization", desc: "Parsing raw workflow logs and validating event timelines..." },
  { title: "Process Mining & Bottlenecks", desc: "Identifying execution loops and invisible idle time..." },
  { title: "SLA Risk Profiling", desc: "Calculating breach probabilities and workload efficiency..." },
  { title: "Financial Impact Modeling", desc: "Quantifying revenue leakage from operational friction..." },
  { title: "Strategic Insight Synthesis", desc: "Generating corrective actions and executive summaries..." }
];

const DEFAULT_DATASETS: DatasetMetadata[] = [
  { id: 'curr', name: 'Current Week', timestamp: '2023-11-01 09:00', status: 'pending' },
  { id: 'prev', name: 'Previous Week', timestamp: '2023-10-25 18:00', status: 'pending' },
  { id: 'hist', name: 'Earlier Hist.', timestamp: '2023-10-18 18:00', status: 'pending' },
];

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('Analyst');
  
  const [activeDatasetId, setActiveDatasetId] = useState<string | 'global'>('curr');
  const [datasets, setDatasets] = useState<DatasetMetadata[]>(DEFAULT_DATASETS);
  const [datasetContents, setDatasetContents] = useState<Record<string, string>>({});
  const [analyses, setAnalyses] = useState<Record<string, AnalysisResult>>({});
  const [globalAnalysis, setGlobalAnalysis] = useState<GlobalSynthesisResult | null>(null);
  
  const [statuses, setStatuses] = useState<Record<string, AppStatus>>({});
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const readyDatasetsCount = Object.keys(analyses).length;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginId.trim() || !password.trim()) return;
    setUser({ id: loginId, name: loginId, role: selectedRole, email: `${loginId.toLowerCase()}@opsintel.io` });
  };

  const handleAnalyze = useCallback(async (targetId: string) => {
    const content = datasetContents[targetId];
    if (!content) return;

    setStatuses(prev => ({ ...prev, [targetId]: AppStatus.ANALYZING }));
    setError(null);
    setCurrentStep(0);

    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => (prev < ANALYSIS_STEPS.length - 1 ? prev + 1 : prev));
    }, 1200);

    try {
      const result = await analyzeWorkflow(content);
      setAnalyses(prev => ({ ...prev, [targetId]: result }));
      setDatasets(prev => prev.map(d => d.id === targetId ? { ...d, status: 'synced', timestamp: new Date().toLocaleString() } : d));
      setStatuses(prev => ({ ...prev, [targetId]: AppStatus.COMPLETED }));
    } catch (e: any) {
      setError(e.message || "Analysis failed.");
      setStatuses(prev => ({ ...prev, [targetId]: AppStatus.ERROR }));
    } finally {
      clearInterval(stepInterval);
    }
  }, [datasetContents]);

  const handleGlobalSynthesis = async () => {
    if (readyDatasetsCount < 2) return;
    setStatuses(prev => ({ ...prev, global: AppStatus.ANALYZING }));
    setActiveDatasetId('global');
    try {
      const result = await analyzeGlobalSynthesis(analyses);
      setGlobalAnalysis(result);
      setStatuses(prev => ({ ...prev, global: AppStatus.COMPLETED }));
    } catch (e: any) {
      setError("Global Synthesis failed.");
      setStatuses(prev => ({ ...prev, global: AppStatus.ERROR }));
    }
  };

  useEffect(() => {
    if (activeDatasetId !== 'global' && 
        datasetContents[activeDatasetId] && 
        !analyses[activeDatasetId] && 
        statuses[activeDatasetId] !== AppStatus.ANALYZING) {
      handleAnalyze(activeDatasetId);
    }
  }, [activeDatasetId, datasetContents, analyses, handleAnalyze, statuses]);

  const loadSampleData = useCallback(() => {
    if (activeDatasetId === 'global') return;
    setDatasetContents(prev => ({ ...prev, [activeDatasetId]: SAMPLE_DATA }));
  }, [activeDatasetId]);

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setDatasetContents(prev => ({ ...prev, [activeDatasetId]: text }));
      }
    } catch (err) {
      setError("Clipboard access denied or empty.");
    }
  };

  const processFile = (file: File) => {
    if (activeDatasetId === 'global') return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const fileName = file.name.toLowerCase();
        
        if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
          const workbook = read(data, { type: 'array' });
          const json = utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);
          setDatasetContents(prev => ({ ...prev, [activeDatasetId]: JSON.stringify(json, null, 2) }));
        } else if (fileName.endsWith('.csv')) {
          const workbook = read(data, { type: 'array' });
          const json = utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);
          setDatasetContents(prev => ({ ...prev, [activeDatasetId]: JSON.stringify(json, null, 2) }));
        } else if (fileName.endsWith('.json')) {
          const text = new TextDecoder().decode(data as ArrayBuffer);
          setDatasetContents(prev => ({ ...prev, [activeDatasetId]: text }));
        } else {
          setError("Unsupported file format. Use .xlsx, .csv, or .json");
        }
      } catch (err) { setError("Parsing failed. Check file structure."); }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files?.[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const resetAll = () => {
    setAnalyses({});
    setDatasetContents({});
    setStatuses({});
    setGlobalAnalysis(null);
    setError(null);
  };

  const renderDatasetStatus = (d: DatasetMetadata) => {
    const s = statuses[d.id];
    if (s === AppStatus.ANALYZING) return (
      <div className="ml-auto flex items-center gap-1 text-[10px] font-bold text-blue-400 animate-pulse">
        <Loader2 className="w-3 h-3 animate-spin" />
      </div>
    );
    if (analyses[d.id]) return (
      <div className="ml-auto text-emerald-400"><CheckCircle2 className="w-3 h-3" /></div>
    );
    return null;
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-slate-800 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden animate-fade-in">
          <div className="p-8 text-center bg-slate-800/50 border-b border-slate-700">
            <div className="bg-blue-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl">
              <ShieldCheck className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">OpsIntel Gateway</h1>
            <p className="text-slate-400 text-sm mt-2">Enterprise Operational Intelligence</p>
          </div>
          <form onSubmit={handleLogin} className="p-8 space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] uppercase text-slate-500 font-bold tracking-widest">Enterprise ID</label>
              <input type="text" value={loginId} onChange={(e) => setLoginId(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3 px-4 text-sm text-white" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase text-slate-500 font-bold tracking-widest">Security Token</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3 px-4 text-sm text-white" />
            </div>
            <button type="submit" className="w-full py-4 bg-blue-600 hover:bg-blue-500 rounded-xl text-white font-bold transition-all">Start Session</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 flex overflow-hidden">
      <aside className="w-72 bg-slate-800/50 border-r border-slate-700 flex flex-col backdrop-blur-md">
        <div className="p-6 border-b border-slate-700 flex items-center gap-3">
          <div className="bg-blue-500 p-1.5 rounded-lg"><BrainCircuit className="w-5 h-5 text-white" /></div>
          <span className="font-bold text-white tracking-tight">OpsIntel Command</span>
        </div>
        
        <nav className="flex-1 p-4 space-y-6 overflow-y-auto">
          <div>
            <p className="text-[10px] uppercase text-slate-500 font-bold mb-3 tracking-widest">Aggregate View</p>
            <button
              onClick={handleGlobalSynthesis}
              disabled={readyDatasetsCount < 2}
              className={`w-full flex items-center gap-3 px-4 py-4 rounded-xl text-xs font-black transition-all border ${
                activeDatasetId === 'global' ? 'bg-indigo-600 border-indigo-400 text-white shadow-lg' : 
                readyDatasetsCount >= 2 ? 'bg-slate-700/50 border-slate-600 text-indigo-400' : 'bg-slate-800/30 border-slate-800 text-slate-600 opacity-50'
              }`}
            >
              <Globe className="w-4 h-4" />
              <span className="uppercase tracking-widest text-left">Global WoW Trends</span>
            </button>
          </div>
          <div>
            <div className="flex items-center justify-between mb-3 px-1">
              <p className="text-[10px] uppercase text-slate-500 font-bold tracking-widest">Datasets</p>
              <button onClick={resetAll} title="Reset all data" className="text-slate-500 hover:text-rose-400 transition-colors">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="space-y-2">
              {datasets.map(d => (
                <button
                  key={d.id}
                  onClick={() => setActiveDatasetId(d.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all group ${
                    activeDatasetId === d.id ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-700/50 hover:text-white'
                  }`}
                >
                  <Database className="w-4 h-4" />
                  <span className="truncate">{d.name}</span>
                  {renderDatasetStatus(d)}
                </button>
              ))}
            </div>
          </div>
        </nav>
        <div className="p-4 border-t border-slate-700">
          <button onClick={() => setUser(null)} className="flex items-center gap-2 text-xs text-slate-500 hover:text-rose-400 transition-colors">
            <LogOut className="w-4 h-4" /> 
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto bg-[#0a0f1d]">
        <header className="sticky top-0 z-20 bg-[#0a0f1d]/80 backdrop-blur-md border-b border-slate-800 px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              {activeDatasetId === 'global' ? <Globe className="w-5 h-5 text-indigo-400" /> : <LayoutDashboard className="w-5 h-5 text-blue-400" />}
              {activeDatasetId === 'global' ? 'Global Analysis' : datasets.find(d => d.id === activeDatasetId)?.name}
            </h2>
          </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto">
          {activeDatasetId === 'global' ? (
             statuses.global === AppStatus.ANALYZING ? (
               <div className="py-20 text-center"><Loader2 className="w-12 h-12 text-indigo-500 animate-spin mx-auto mb-4" /><p className="text-slate-500">Synthesizing WoW Trends...</p></div>
             ) : globalAnalysis ? <GlobalDashboard data={globalAnalysis} /> : <p className="text-center text-slate-500">Global Synthesis Required (min 2 datasets).</p>
          ) : !analyses[activeDatasetId] && statuses[activeDatasetId] !== AppStatus.ANALYZING ? (
            <div className="max-w-4xl mx-auto py-12 animate-fade-in">
              <div className="text-center mb-12">
                <Database className="w-16 h-16 text-slate-700 mx-auto mb-6" />
                <h3 className="text-3xl font-black text-white mb-2 uppercase tracking-tight">Data Management Center</h3>
                <p className="text-slate-400 text-sm">Upload, paste, or use sample logs to start intelligence extraction.</p>
              </div>

              {error && (
                <div className="mb-8 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex flex-col gap-2 text-rose-400 animate-fade-in shadow-xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-sm font-bold">
                      <ShieldAlert className="w-5 h-5" />
                      Analysis Error Detected
                    </div>
                    <button onClick={() => setError(null)}><X className="w-4 h-4" /></button>
                  </div>
                  <p className="text-xs ml-8 text-rose-400/80">{error}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div 
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`relative group col-span-2 md:col-span-1 p-10 border-2 border-dashed rounded-3xl transition-all cursor-pointer flex flex-col items-center justify-center text-center ${
                    isDragging ? 'bg-blue-600/10 border-blue-500 shadow-[0_0_30px_rgba(59,130,246,0.2)]' : 'bg-slate-800/40 border-slate-700 hover:border-blue-500/50 hover:bg-slate-800/60'
                  }`}
                >
                  <input type="file" ref={fileInputRef} className="hidden" accept=".xlsx,.xls,.csv,.json" onChange={(e) => { if (e.target.files?.[0]) processFile(e.target.files[0]); }} />
                  <div className={`p-4 rounded-2xl mb-4 transition-colors ${isDragging ? 'bg-blue-500 text-white' : 'bg-slate-700/50 text-blue-400'}`}>
                    <UploadCloud className="w-10 h-10" />
                  </div>
                  <h4 className="text-slate-200 font-black text-sm uppercase tracking-widest mb-2">Drop Operational Logs</h4>
                  <p className="text-xs text-slate-500 leading-relaxed px-4">Accepts Excel (.xlsx), CSV, or JSON exports from ServiceNow, Jira, or custom ITSM tools.</p>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  <button 
                    onClick={handlePaste}
                    className="p-8 bg-slate-800/40 border border-slate-700 rounded-3xl hover:bg-slate-800/60 hover:border-indigo-500/50 transition-all text-center flex flex-col items-center group"
                  >
                    <div className="p-3 bg-indigo-500/10 rounded-xl mb-3 text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-all">
                      <Clipboard className="w-6 h-6" />
                    </div>
                    <h4 className="text-slate-200 font-bold text-xs uppercase tracking-widest">Paste from Clipboard</h4>
                    <p className="text-[10px] text-slate-500 mt-1 italic">Directly paste JSON/CSV strings</p>
                  </button>

                  <button 
                    onClick={loadSampleData}
                    className="p-8 bg-slate-800/40 border border-slate-700 rounded-3xl hover:bg-slate-800/60 hover:border-emerald-500/50 transition-all text-center flex flex-col items-center group"
                  >
                    <div className="p-3 bg-emerald-500/10 rounded-xl mb-3 text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                      <Sparkles className="w-6 h-6" />
                    </div>
                    <h4 className="text-slate-200 font-bold text-xs uppercase tracking-widest">Load Demo Context</h4>
                    <p className="text-[10px] text-slate-500 mt-1 italic">Use curated operational dataset</p>
                  </button>
                </div>
              </div>

              <div className="mt-12 flex flex-wrap justify-center gap-8 opacity-40">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                  <FileSpreadsheet className="w-4 h-4" />
                  Excel Support
                </div>
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                  <FileText className="w-4 h-4" />
                  CSV Exports
                </div>
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                  <FileJson className="w-4 h-4" />
                  JSON Parsing
                </div>
              </div>
            </div>
          ) : statuses[activeDatasetId] === AppStatus.ANALYZING ? (
            <div className="max-w-xl mx-auto py-10">
              <div className="text-center mb-10"><Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" /><h3 className="text-xl font-bold text-white">Extracting Intelligence</h3></div>
              <div className="space-y-4 bg-slate-800/30 p-8 rounded-2xl border border-slate-700">
                {ANALYSIS_STEPS.map((step, idx) => (
                  <div key={idx} className={`flex items-start gap-4 transition-all ${idx > currentStep ? 'opacity-30' : 'opacity-100'}`}>
                    <div className={`mt-1 flex items-center justify-center w-5 h-5 rounded-full border ${idx < currentStep ? 'bg-emerald-500 border-emerald-500 text-white' : idx === currentStep ? 'border-blue-500 text-blue-400 animate-pulse' : 'border-slate-600'}`}>{idx < currentStep ? <CheckCircle2 className="w-3 h-3" /> : idx + 1}</div>
                    <div><p className="text-sm font-bold text-slate-200">{step.title}</p><p className="text-[10px] text-slate-500">{step.desc}</p></div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            analyses[activeDatasetId] && <Dashboard data={analyses[activeDatasetId]} onReset={() => {
              setAnalyses(prev => { const n = {...prev}; delete n[activeDatasetId]; return n; });
              setDatasetContents(prev => { const n = {...prev}; delete n[activeDatasetId]; return n; });
              setStatuses(prev => { const n = {...prev}; delete n[activeDatasetId]; return n; });
            }} />
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
