
import React, { useState, useMemo } from 'react';
import { 
  LayoutDashboard, Users, Clock, CheckCircle2, ChevronRight, 
  Eye, XCircle, Send, Trash2, Filter, Calendar, ShieldX,
  Database, RefreshCw
} from 'lucide-react';
import { ClaimResult } from '../types';
import ResultCard from './ResultCard';

interface AdminDashboardProps {
  claims: ClaimResult[];
  onApprove: (id: string) => void;
  onReject: (id: string, reason: string) => void;
  onDelete: (id: string) => void;
  onClear: () => void;
}

type FilterRange = 'all' | '15d' | '1m' | '3m' | '1y';

const AdminDashboard: React.FC<AdminDashboardProps> = ({ claims, onApprove, onReject, onDelete, onClear }) => {
  const [selectedClaim, setSelectedClaim] = useState<ClaimResult | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [filter, setFilter] = useState<FilterRange>('all');

  const filteredClaims = useMemo(() => {
    if (filter === 'all') return claims;
    const now = new Date();
    const ranges = {
      '15d': 15 * 24 * 60 * 60 * 1000,
      '1m': 30 * 24 * 60 * 60 * 1000,
      '3m': 90 * 24 * 60 * 60 * 1000,
      '1y': 365 * 24 * 60 * 60 * 1000,
    };
    return claims.filter(c => {
      const submitted = new Date(c.submittedAt).getTime();
      return (now.getTime() - submitted) <= (ranges[filter as keyof typeof ranges] || 0);
    });
  }, [claims, filter]);

  const pendingCount = filteredClaims.filter(c => c.status !== 'Approved' && c.status !== 'Rejected').length;
  const approvedCount = filteredClaims.filter(c => c.status === 'Approved').length;

  const handleOpenClaim = (claim: ClaimResult) => {
    setSelectedClaim(claim);
    setShowRejectInput(false);
    setRejectionReason("");
  };

  const submitRejection = () => {
    if (!rejectionReason.trim()) return;
    if (selectedClaim) {
      onReject(selectedClaim.id, rejectionReason);
      setSelectedClaim(null);
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      {/* Utility Bar */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
        <div className="flex flex-wrap gap-2 bg-white dark:bg-slate-900/50 p-2.5 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-xl backdrop-blur-md transition-colors">
          {(['all', '15d', '1m', '3m', '1y'] as FilterRange[]).map((r) => (
            <button
              key={r}
              onClick={() => setFilter(r)}
              className={`px-6 py-2.5 rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.2em] transition-all ${
                filter === r ? 'bg-indigo-600 text-white shadow-2xl shadow-indigo-600/30' : 'text-slate-400 dark:text-slate-600 hover:text-slate-900 dark:hover:text-slate-300'
              }`}
            >
              {r === 'all' ? 'Entire Ledger' : r.toUpperCase()}
            </button>
          ))}
        </div>
        
        <div className="flex gap-4">
          <button 
            onClick={() => { if(confirm('Sync local data with core database?')) window.location.reload(); }}
            className="flex items-center gap-3 px-6 py-3 text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl transition-all active:scale-95 shadow-sm"
          >
            <RefreshCw size={14} /> Refresh Cache
          </button>
          <button 
            onClick={() => { if(confirm('CRITICAL ACTION: Purge all local audit records? This cannot be undone.')) onClear(); }}
            className="flex items-center gap-3 px-6 py-3 text-[10px] font-black uppercase tracking-[0.3em] text-red-600 dark:text-red-500 hover:text-white hover:bg-red-600 bg-red-600/5 dark:bg-red-600/5 border border-red-200 dark:border-red-600/20 rounded-2xl transition-all active:scale-95 shadow-lg shadow-red-600/5"
          >
            <Database size={14} /> Wipe Dashboard
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white dark:bg-slate-900 p-10 rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-2xl group hover:border-indigo-600/40 transition-all relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/5 blur-[80px]"></div>
          <div className="flex items-center gap-3 text-indigo-600 dark:text-indigo-400 mb-4 relative z-10">
            <LayoutDashboard size={20} />
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 dark:text-slate-600">Total Records</span>
          </div>
          <p className="text-5xl font-black text-slate-900 dark:text-white italic relative z-10">{filteredClaims.length}</p>
        </div>
        
        <div className="bg-white dark:bg-slate-900 p-10 rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-2xl group hover:border-amber-500/40 transition-all relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-600/5 blur-[80px]"></div>
          <div className="flex items-center gap-3 text-amber-600 dark:text-amber-500 mb-4 relative z-10">
            <Clock size={20} />
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 dark:text-slate-600">Awaiting Decision</span>
          </div>
          <p className="text-5xl font-black text-slate-900 dark:text-white italic relative z-10">{pendingCount}</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-10 rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-2xl group hover:border-emerald-500/40 transition-all relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-600/5 blur-[80px]"></div>
          <div className="flex items-center gap-3 text-emerald-600 dark:text-emerald-500 mb-4 relative z-10">
            <CheckCircle2 size={20} />
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 dark:text-slate-600">Verified & Approved</span>
          </div>
          <p className="text-5xl font-black text-slate-900 dark:text-white italic relative z-10">{approvedCount}</p>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-white dark:bg-slate-900 rounded-[4rem] shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden transition-colors">
        <div className="px-10 py-8 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/20 backdrop-blur-md">
          <h3 className="font-black text-slate-900 dark:text-white text-sm uppercase tracking-[0.3em] italic flex items-center gap-3">
            <Database className="text-indigo-600" size={18} />
            Transaction Ledger
          </h3>
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 dark:text-slate-600 bg-white dark:bg-slate-950 px-4 py-1.5 rounded-full border border-slate-200 dark:border-slate-800">
            {filteredClaims.length} Objects Found
          </span>
        </div>
        
        {filteredClaims.length === 0 ? (
          <div className="p-40 text-center space-y-8">
            <div className="bg-slate-100 dark:bg-slate-950 w-32 h-32 rounded-[2.5rem] flex items-center justify-center mx-auto border border-slate-200 dark:border-slate-800 shadow-inner">
              <ShieldX className="text-slate-300 dark:text-slate-900" size={56} />
            </div>
            <p className="text-slate-400 dark:text-slate-700 font-black text-xs uppercase tracking-[0.5em] italic">Database currently silent</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-950/50 text-slate-400 dark:text-slate-700 text-[10px] font-black uppercase tracking-[0.4em] border-b border-slate-200 dark:border-slate-800">
                  <th className="px-10 py-8">Employee Context</th>
                  <th className="px-10 py-8">Metadata</th>
                  <th className="px-10 py-8">Cycle</th>
                  <th className="px-10 py-8">Sum</th>
                  <th className="px-10 py-8">Status</th>
                  <th className="px-10 py-8 text-right">Operation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredClaims.map((claim) => (
                  <tr key={claim.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors group">
                    <td className="px-10 py-8">
                      <div className="flex items-center gap-5">
                        <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-500 flex items-center justify-center font-black text-sm border border-slate-200 dark:border-indigo-500/10 uppercase italic shadow-inner">
                          {claim.userId.charAt(0)}
                        </div>
                        <div>
                          <span className="font-black text-slate-800 dark:text-slate-200 block text-base tracking-tighter">{claim.userId}</span>
                          <span className="text-[9px] text-slate-400 dark:text-slate-600 uppercase font-black tracking-[0.3em] mt-1 block">Filing Hash: {claim.id.slice(0, 8)}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-8">
                      <div className="flex flex-col gap-1">
                        <span className="text-[11px] font-black text-indigo-600 dark:text-indigo-500 uppercase tracking-[0.3em] italic">{claim.type}</span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-700 font-black truncate max-w-[200px] uppercase tracking-widest">Ref: {claim.details.customerName}</span>
                      </div>
                    </td>
                    <td className="px-10 py-8">
                      <span className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] bg-slate-50 dark:bg-slate-950 px-3 py-1 rounded-lg border border-slate-200 dark:border-slate-800">
                        {claim.months.length} Months
                      </span>
                    </td>
                    <td className="px-10 py-8 font-black text-slate-900 dark:text-white text-lg tabular-nums italic">
                      ${claim.eligibleAmount.toFixed(2)}
                    </td>
                    <td className="px-10 py-8">
                      <span className={`px-4 py-2 rounded-2xl text-[9px] font-black uppercase tracking-[0.3em] border
                        ${claim.status === 'Approved' ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-500 border-emerald-100 dark:border-emerald-500/10' : 
                          claim.status === 'Rejected' ? 'bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-500 border-red-100 dark:border-red-500/10' : 
                          'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-500 border-amber-100 dark:border-amber-500/10'}
                      `}>
                        {claim.status}
                      </span>
                    </td>
                    <td className="px-10 py-8 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <button 
                          onClick={() => handleOpenClaim(claim)}
                          title="Inspect Protocol"
                          className="p-4 text-slate-400 dark:text-slate-600 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-white dark:hover:bg-slate-950 rounded-2xl transition-all border border-transparent hover:border-slate-200 dark:hover:border-slate-800 shadow-sm"
                        >
                          <Eye size={22} />
                        </button>
                        <button 
                          onClick={(e) => { 
                            e.stopPropagation();
                            if(confirm(`PERMANENTLY DELETE RECORD #${claim.id.slice(0,8)}?`)) onDelete(claim.id); 
                          }}
                          title="Purge Record"
                          className="p-4 text-slate-400 dark:text-slate-700 hover:text-red-600 dark:hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/5 rounded-2xl transition-all border border-transparent hover:border-red-200 dark:hover:border-red-500/20"
                        >
                          <Trash2 size={22} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Inspector Modal */}
      {selectedClaim && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-8 bg-white/80 dark:bg-slate-950/95 backdrop-blur-3xl animate-in fade-in duration-400">
          <div className="w-full max-w-5xl animate-in zoom-in-95 duration-400 max-h-[95vh] overflow-y-auto no-scrollbar">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-4">
                <div className="bg-indigo-600/10 dark:bg-indigo-600/20 p-3 rounded-2xl border border-indigo-200 dark:border-indigo-500/30">
                  <Database size={24} className="text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <h4 className="text-slate-900 dark:text-white font-black uppercase tracking-[0.4em] text-xs">Inspecting Transaction</h4>
                  <p className="text-slate-400 dark:text-slate-600 text-[10px] font-bold uppercase tracking-widest mt-1">UUID: {selectedClaim.id}</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedClaim(null)}
                className="bg-slate-100 dark:bg-slate-900 hover:bg-indigo-600 text-slate-600 dark:text-white p-4 rounded-full transition-all border border-slate-200 dark:border-slate-800 hover:border-indigo-400 group shadow-2xl"
              >
                <ChevronRight className="rotate-90 group-hover:scale-125 transition-transform" />
              </button>
            </div>
            
            <ResultCard result={selectedClaim} />
            
            {/* Action Panel for Pending Claims */}
            {selectedClaim.status !== 'Approved' && selectedClaim.status !== 'Rejected' && (
              <div className="mt-8 p-12 bg-white dark:bg-slate-900 rounded-[4rem] border border-slate-200 dark:border-slate-800 space-y-10 shadow-2xl relative overflow-hidden transition-colors">
                <div className="absolute top-0 left-0 w-2 h-full bg-indigo-600/40"></div>
                {showRejectInput ? (
                  <div className="space-y-8 animate-in fade-in slide-in-from-top-4">
                    <div className="space-y-2">
                      <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.6em] mb-4">Mandatory Auditor Findings</label>
                      <textarea 
                        autoFocus
                        placeholder="Specify rationale for denial (e.g. Identity mismatch with employee database, date outside corporate policy range...)"
                        className="w-full p-8 rounded-[2rem] bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:border-red-500 focus:ring-8 focus:ring-red-500/5 outline-none transition-all h-48 text-base font-medium leading-relaxed shadow-inner"
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                      />
                    </div>
                    <div className="flex gap-6">
                      <button 
                        onClick={submitRejection}
                        disabled={!rejectionReason.trim()}
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white font-black py-6 rounded-[1.5rem] flex items-center justify-center gap-4 disabled:bg-slate-100 dark:disabled:bg-slate-800 disabled:text-slate-400 dark:disabled:text-slate-700 transition-all uppercase text-[11px] tracking-[0.4em] shadow-2xl shadow-red-600/30 italic"
                      >
                        <Send size={18} /> Finalize Rejection
                      </button>
                      <button 
                        onClick={() => setShowRejectInput(false)}
                        className="px-12 py-6 bg-slate-100 dark:bg-slate-950 text-slate-600 font-black rounded-[1.5rem] hover:bg-slate-200 dark:hover:bg-slate-800 transition-all uppercase text-[11px] tracking-[0.4em] border border-slate-200 dark:border-slate-800"
                      >
                        Back
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-8">
                    <button 
                      onClick={() => {
                        onApprove(selectedClaim.id);
                        setSelectedClaim(null);
                      }}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-black py-8 rounded-[2rem] shadow-2xl shadow-emerald-600/30 transition-all flex items-center justify-center gap-5 uppercase text-[11px] tracking-[0.5em] italic group active:scale-[0.98]"
                    >
                      <CheckCircle2 size={32} className="group-hover:scale-110 transition-transform" />
                      Commit Verification
                    </button>
                    <button 
                      onClick={() => setShowRejectInput(true)}
                      className="flex-1 bg-slate-50 dark:bg-slate-950 text-red-600 dark:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 border border-slate-200 dark:border-slate-800 font-black py-8 rounded-[2rem] transition-all flex items-center justify-center gap-5 uppercase text-[11px] tracking-[0.5em] italic active:scale-[0.98]"
                    >
                      <XCircle size={32} />
                      Issue Rejection
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
