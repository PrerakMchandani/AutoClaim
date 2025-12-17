
import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, ChevronRight, Loader2, Sparkles, CheckSquare, 
  Users, User, LayoutDashboard, History, CheckCircle, LogOut,
  Building, UserCheck, ArrowRight, Lock, UserRound, KeyRound,
  ShieldAlert, ChevronLeft, Sun, Moon, RefreshCw, AlertCircle
} from 'lucide-react';
import FileUpload from './components/FileUpload';
import ResultCard from './components/ResultCard';
import AdminDashboard from './components/AdminDashboard';
import { validateClaim } from './services/geminiService';
import { ReimbursementType, UploadedFile, ClaimResult, UserSession, UserRole } from './types';

const MONTHS = [
  "January", "February", "March", "April", "May", "June", 
  "July", "August", "September", "October", "November", "December"
];

function App() {
  // Initialize state directly from localStorage for immediate consistency
  const [session, setSession] = useState<UserSession | null>(() => {
    const saved = localStorage.getItem('autoclaim_session');
    return saved ? JSON.parse(saved) : null;
  });
  
  const [claims, setClaims] = useState<ClaimResult[]>(() => {
    const saved = localStorage.getItem('autoclaim_db');
    return saved ? JSON.parse(saved) : [];
  });

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('autoclaim_theme');
    if (saved) return saved as 'light' | 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  const [loginStep, setLoginStep] = useState<'role' | 'input'>('role');
  const [loginRole, setLoginRole] = useState<UserRole>('employee');
  const [loginInput, setLoginInput] = useState("");
  
  const [reimbursementType, setReimbursementType] = useState<ReimbursementType>(ReimbursementType.WIFI);
  const [selectedMonths, setSelectedMonths] = useState<string[]>([]);
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentResult, setCurrentResult] = useState<ClaimResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  // Sync theme
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('autoclaim_theme', theme);
  }, [theme]);

  // Sync claims
  useEffect(() => {
    localStorage.setItem('autoclaim_db', JSON.stringify(claims));
  }, [claims]);

  // Sync session
  useEffect(() => {
    if (session) {
      localStorage.setItem('autoclaim_session', JSON.stringify(session));
    } else {
      localStorage.removeItem('autoclaim_session');
    }
  }, [session]);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  const handleLogin = () => {
    if (loginRole === 'employee' && !loginInput.trim()) {
      setError("Full identification required.");
      return;
    }
    
    if (loginRole === 'admin' && loginInput !== 'FinAdmin') {
      setError("Unauthorized administrative credential.");
      return;
    }

    const newSession = {
      name: loginRole === 'admin' ? 'Finance Operations' : loginInput.trim(),
      role: loginRole
    };
    setSession(newSession);
    setLoginInput("");
    setError(null);
  };

  const handleLogout = () => {
    setSession(null);
    setLoginStep('role');
    resetForm();
  };

  const handleHardReset = () => {
    if (confirm("SYSTEM RESET: Purge all local data including claims, themes, and sessions?")) {
      localStorage.clear();
      window.location.reload();
    }
  };

  const toggleMonth = (month: string) => {
    setSelectedMonths(prev => {
      if (prev.includes(month)) return prev.filter(m => m !== month);
      if (prev.length >= 2) {
        setError("Filing policy: Maximum 2 cycles per submission.");
        return prev;
      }
      setError(null);
      return [...prev, month];
    });
  };

  const handleValidate = async () => {
    if (files.length === 0 || selectedMonths.length === 0 || !session) {
      setError("Document evidence and billing cycles are required.");
      return;
    }

    setError(null);
    setIsLoading(true);
    setCurrentResult(null);

    try {
      const aiResult = await validateClaim(files, reimbursementType, selectedMonths, session.name);
      
      const newClaim: ClaimResult = {
        ...aiResult,
        id: Math.random().toString(36).substring(2, 11),
        userId: session.name,
        submittedAt: new Date().toISOString(),
      };

      setCurrentResult(newClaim);
      setClaims(prev => [newClaim, ...prev]);
    } catch (err: any) {
      setError(err.message || "Cognitive extraction failure.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = (id: string) => {
    setClaims(prev => prev.map(c => c.id === id ? { ...c, status: 'Approved' as const } : c));
  };

  const handleReject = (id: string, reason: string) => {
    setClaims(prev => prev.map(c => c.id === id ? { 
      ...c, 
      status: 'Rejected' as const, 
      adminReason: reason 
    } : c));
  };

  const handleDeleteClaim = (id: string) => {
    setClaims(prev => prev.filter(c => c.id !== id));
  };

  const handleClearAll = () => {
    setClaims([]);
  };

  const resetForm = () => {
    setFiles([]);
    setSelectedMonths([]);
    setCurrentResult(null);
    setError(null);
    setShowHistory(false);
  };

  if (!session) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 flex flex-col items-center justify-center p-6 selection:bg-indigo-500/30 transition-colors duration-300">
        <div className="max-w-md w-full space-y-10 bg-slate-50 dark:bg-slate-900 p-12 rounded-[3rem] shadow-2xl border border-slate-200 dark:border-slate-800 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-600 to-transparent"></div>
          
          <div className="text-center relative z-10">
            <div className="bg-indigo-600 w-24 h-24 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-indigo-600/30">
              <ShieldCheck className="text-white w-14 h-14" />
            </div>
            <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic">AutoClaim</h2>
            <p className="text-slate-500 mt-2 font-black uppercase tracking-[0.3em] text-[10px]">Secure Infrastructure Login</p>
          </div>

          <div className="space-y-8 relative z-10">
            {loginStep === 'role' ? (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <button 
                  onClick={() => { setLoginRole('employee'); setLoginStep('input'); }}
                  className="w-full bg-white dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-indigo-500/50 p-6 rounded-3xl flex items-center gap-6 transition-all group active:scale-[0.98]"
                >
                  <div className="p-4 bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 rounded-2xl group-hover:bg-indigo-600 group-hover:text-white transition-all">
                    <User size={24} />
                  </div>
                  <div className="text-left">
                    <p className="font-black text-slate-900 dark:text-white uppercase tracking-widest text-xs">Employee</p>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">Filing Terminal</p>
                  </div>
                  <ChevronRight className="ml-auto text-slate-400 dark:text-slate-700 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" size={20} />
                </button>

                <button 
                  onClick={() => { setLoginRole('admin'); setLoginStep('input'); }}
                  className="w-full bg-white dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-indigo-500/50 p-6 rounded-3xl flex items-center gap-6 transition-all group active:scale-[0.98]"
                >
                  <div className="p-4 bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 rounded-2xl group-hover:bg-indigo-600 group-hover:text-white transition-all">
                    <Lock size={24} />
                  </div>
                  <div className="text-left">
                    <p className="font-black text-slate-900 dark:text-white uppercase tracking-widest text-xs">Finance Admin</p>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">Audit Console</p>
                  </div>
                  <ChevronRight className="ml-auto text-slate-400 dark:text-slate-700 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" size={20} />
                </button>
              </div>
            ) : (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="flex items-center gap-3 mb-4">
                  <button onClick={() => { setLoginStep('role'); setError(null); }} className="p-2 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">
                    <ChevronLeft size={20} />
                  </button>
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-500 italic">{loginRole} Portal Access</span>
                </div>

                <div className="relative group">
                  {loginRole === 'employee' ? <UserRound className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-600 group-focus-within:text-indigo-500 transition-colors" size={18} /> : <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-600 group-focus-within:text-indigo-500 transition-colors" size={18} />}
                  <input 
                    autoFocus
                    type={loginRole === 'admin' ? 'password' : 'text'}
                    placeholder={loginRole === 'employee' ? 'Full Legal Name' : 'Security Access Token'} 
                    className="w-full pl-12 pr-4 py-5 rounded-2xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-semibold text-sm"
                    value={loginInput}
                    onChange={(e) => setLoginInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                  />
                </div>

                {error && <p className="text-center text-red-500 text-[10px] font-black uppercase tracking-widest bg-red-500/10 py-3 rounded-xl border border-red-500/20 flex items-center justify-center gap-2"><ShieldAlert size={12} /> {error}</p>}

                <button 
                  onClick={handleLogin}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black py-5 rounded-2xl flex items-center justify-center gap-3 transition-all group shadow-2xl shadow-indigo-600/20 active:scale-[0.98] uppercase text-xs tracking-[0.2em]"
                >
                  Verify Access
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Diagnostics Bar */}
        <div className="mt-8 flex items-center gap-6 text-slate-400 dark:text-slate-700 font-black text-[9px] uppercase tracking-[0.4em]">
           <button onClick={handleHardReset} className="flex items-center gap-2 hover:text-red-500 transition-colors">
             <AlertCircle size={14} /> System Flush (Clear Cache)
           </button>
           <div className="w-1 h-1 bg-slate-200 dark:bg-slate-800 rounded-full"></div>
           <p>Hardware Cryptography Active</p>
        </div>
      </div>
    );
  }

  const myClaims = claims.filter(c => c.userId === session.name);

  return (
    <div className="min-h-screen pb-20 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-200 selection:bg-indigo-500/30 transition-colors duration-300">
      <header className="bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-900 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-xl shadow-lg shadow-indigo-600/20"><ShieldCheck className="text-white w-5 h-5" /></div>
            <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic">AutoClaim</h1>
          </div>
          
          <div className="flex items-center gap-4 sm:gap-6">
            <button 
              onClick={toggleTheme}
              className="p-3 bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 rounded-xl transition-all active:scale-95 hover:bg-white dark:hover:bg-slate-800"
              title="Toggle Theme"
            >
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </button>
            <div className="hidden sm:flex flex-col items-end">
              <p className="text-sm font-black text-slate-900 dark:text-white leading-none">{session.name}</p>
              <p className="text-[10px] uppercase font-black text-slate-400 dark:text-slate-600 tracking-[0.3em] mt-1">{session.role}</p>
            </div>
            <button onClick={handleLogout} className="p-3 bg-slate-100 dark:bg-slate-900 text-slate-400 dark:text-slate-500 hover:text-red-500 border border-slate-200 dark:border-slate-800 rounded-xl transition-all active:scale-95 shadow-lg">
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 pt-12">
        {session.role === 'employee' ? (
          <div className="space-y-12 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row justify-between items-end gap-6">
              <div className="space-y-2">
                <h2 className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter italic">Auth Success: <span className="text-indigo-600 dark:text-indigo-500">{session.name.split(' ')[0]}</span></h2>
                <p className="text-slate-400 dark:text-slate-600 font-black uppercase tracking-[0.4em] text-[10px]">Processing Reimbursement Core</p>
              </div>
              <div className="flex bg-white dark:bg-slate-900 p-2 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl">
                <button 
                  onClick={() => setShowHistory(false)}
                  className={`px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${!showHistory ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20' : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-300'}`}
                >
                  New Filing
                </button>
                <button 
                  onClick={() => setShowHistory(true)}
                  className={`px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${showHistory ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20' : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-300'}`}
                >
                  Document Vault
                </button>
              </div>
            </div>

            {showHistory ? (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-500">
                {myClaims.length === 0 ? (
                  <div className="bg-white dark:bg-slate-900/40 rounded-[4rem] p-32 text-center border border-slate-200 dark:border-slate-800 shadow-2xl border-dashed">
                    <History className="mx-auto text-slate-200 dark:text-slate-800 mb-6" size={80} />
                    <p className="text-slate-400 dark:text-slate-700 font-black uppercase tracking-[0.5em] text-xs italic">Filing Vault Empty</p>
                  </div>
                ) : (
                  myClaims.map(claim => (
                    <ResultCard key={claim.id} result={claim} />
                  ))
                )}
              </div>
            ) : (
              <div className="max-w-5xl mx-auto">
                {currentResult ? (
                  <div className="space-y-8 animate-in zoom-in-95 duration-500">
                    <div className="bg-emerald-500/5 border border-emerald-500/20 p-10 rounded-[3rem] flex items-center gap-8 text-emerald-600 dark:text-emerald-400 shadow-2xl">
                      <div className="bg-emerald-500/10 p-5 rounded-3xl shadow-inner"><UserCheck className="w-16 h-16 text-emerald-600 dark:text-emerald-500" /></div>
                      <div>
                        <p className="font-black text-3xl tracking-tighter uppercase italic">Verified</p>
                        <p className="text-xs text-emerald-700/60 dark:text-emerald-300/40 font-black tracking-[0.3em] uppercase mt-2">Document Chain Secured · Auditor Alert Dispatched</p>
                      </div>
                    </div>
                    <ResultCard result={currentResult} />
                    <button onClick={resetForm} className="w-full py-7 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-[2.5rem] font-black uppercase tracking-[0.3em] hover:bg-slate-100 dark:hover:bg-slate-800 transition-all shadow-2xl active:scale-[0.98] border border-slate-200 dark:border-slate-800 italic">
                      Return to Workspace
                    </button>
                  </div>
                ) : (
                  <div className="bg-white dark:bg-slate-900 rounded-[3.5rem] shadow-2xl border border-slate-200 dark:border-slate-800 p-12 space-y-16 transition-colors">
                    <section>
                      <div className="flex items-center gap-4 mb-10">
                        <span className="bg-indigo-600 text-white w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg shadow-xl shadow-indigo-600/30">1</span>
                        <h3 className="font-black text-slate-900 dark:text-white uppercase tracking-[0.3em] text-[11px] italic">Evidence Acquisition</h3>
                      </div>
                      <FileUpload selectedFiles={files} onFilesSelect={setFiles} />
                    </section>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                      <section>
                        <div className="flex items-center gap-4 mb-10">
                          <span className="bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg border border-slate-200 dark:border-slate-700">2</span>
                          <h3 className="font-black text-slate-900 dark:text-white uppercase tracking-[0.3em] text-[11px] italic">Service Parameter</h3>
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                          {Object.values(ReimbursementType).map(type => (
                            <button
                              key={type}
                              onClick={() => setReimbursementType(type)}
                              className={`p-8 rounded-[2.5rem] border-2 transition-all flex flex-col items-center gap-5 group ${
                                reimbursementType === type ? 'border-indigo-600 bg-indigo-600/5 text-indigo-600 dark:text-indigo-400 shadow-2xl' : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/30 text-slate-400 dark:text-slate-600 hover:border-slate-300 dark:hover:border-slate-700'
                              }`}
                            >
                              <div className={`p-5 rounded-2xl transition-all ${reimbursementType === type ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/30' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-700 group-hover:bg-slate-200 dark:group-hover:bg-slate-700'}`}>
                                {type === ReimbursementType.WIFI ? <Sparkles size={32} /> : <CheckSquare size={32} />}
                              </div>
                              <span className="font-black text-xs uppercase tracking-[0.2em]">{type} Protocol</span>
                            </button>
                          ))}
                        </div>
                      </section>

                      <section>
                        <div className="flex items-center gap-4 mb-10">
                          <span className="bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg border border-slate-200 dark:border-slate-700">3</span>
                          <h3 className="font-black text-slate-900 dark:text-white uppercase tracking-[0.3em] text-[11px] italic">Billing Window</h3>
                        </div>
                        <div className="grid grid-cols-4 gap-2">
                          {MONTHS.map(month => (
                            <button
                              key={month}
                              onClick={() => toggleMonth(month)}
                              className={`py-4 rounded-xl border font-black uppercase transition-all text-[9px] tracking-widest ${
                                selectedMonths.includes(month) ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'bg-white dark:bg-slate-800/20 border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:text-slate-600 dark:hover:text-slate-400'
                              }`}
                            >
                              {month.substring(0, 3)}
                            </button>
                          ))}
                        </div>
                        <p className="mt-5 text-[9px] font-black text-slate-400 dark:text-slate-800 uppercase tracking-[0.3em] px-2 italic">Limits: 2 Month Scope per ID</p>
                      </section>
                    </div>

                    {error && <div className="p-6 bg-red-500/10 rounded-[2rem] text-red-600 dark:text-red-500 text-[10px] font-black uppercase tracking-[0.3em] border border-red-500/20 text-center shadow-inner">{error}</div>}

                    <button
                      disabled={isLoading}
                      onClick={handleValidate}
                      className={`w-full py-8 rounded-[3rem] font-black text-xl flex items-center justify-center gap-5 transition-all uppercase tracking-[0.4em] italic ${
                        isLoading ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-700 cursor-wait' : 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-2xl shadow-indigo-600/20 active:scale-95'
                      }`}
                    >
                      {isLoading ? <><Loader2 className="animate-spin" /> Deep Scan Active...</> : <>Execute Neural Scan <ChevronRight size={28}/></>}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-12 animate-in fade-in duration-700">
            <div className="space-y-2">
              <h2 className="text-6xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic">Audit Matrix</h2>
              <p className="text-slate-400 dark:text-slate-700 font-black uppercase tracking-[0.5em] text-[11px] mt-3">High-Frequency Verification Console · FinOps v4.9</p>
            </div>
            
            <AdminDashboard 
              claims={claims} 
              onApprove={handleApprove} 
              onReject={handleReject}
              onDelete={handleDeleteClaim}
              onClear={handleClearAll}
            />
          </div>
        )}
      </main>

      <footer className="mt-40 py-20 border-t border-slate-200 dark:border-slate-900/30">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-8 text-slate-400 dark:text-slate-800 text-[10px] font-black uppercase tracking-[0.5em]">
          <p>© 2025 AUTOCLAIM CORE · DISTRIBUTED AUDIT NODES</p>
          <div className="flex gap-16">
            <span className="hover:text-indigo-600 dark:hover:text-indigo-500 cursor-pointer transition-colors">COMPLIANCE</span>
            <span className="hover:text-indigo-600 dark:hover:text-indigo-500 cursor-pointer transition-colors">SECURITY</span>
            <span className="hover:text-indigo-600 dark:hover:text-indigo-500 cursor-pointer transition-colors">API v8.2</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
