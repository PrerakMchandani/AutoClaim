
import React from 'react';
import { CheckCircle, AlertTriangle, User, Calendar, Receipt, DollarSign, Info, CreditCard, XCircle } from 'lucide-react';
import { ClaimResult } from '../types';

interface ResultCardProps {
  result: ClaimResult;
}

const ResultCard: React.FC<ResultCardProps> = ({ result }) => {
  const isApproved = result.status === 'Auto-Approved' || result.status === 'Approved';
  const isFinalApproved = result.status === 'Approved';
  const isRejected = result.status === 'Rejected';

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500 transition-colors">
      {isFinalApproved && (
        <div className="bg-indigo-600 text-white p-4 flex items-center gap-3 animate-pulse">
          <CreditCard className="w-6 h-6" />
          <p className="font-bold text-sm">Accepted - Amount will be credited shortly.</p>
        </div>
      )}

      {isRejected && (
        <div className="bg-red-600 text-white p-4 flex items-center gap-3">
          <XCircle className="w-6 h-6" />
          <p className="font-bold text-sm">Rejected - Check the admin reason below.</p>
        </div>
      )}
      
      <div className={`p-6 flex items-center justify-between ${
        isRejected ? 'bg-red-50 dark:bg-red-950/30' : isApproved ? 'bg-emerald-50 dark:bg-emerald-950/30' : 'bg-amber-50 dark:bg-amber-950/30'
      }`}>
        <div className="flex items-center gap-3">
          {isRejected ? (
            <XCircle className="w-8 h-8 text-red-600 dark:text-red-500" />
          ) : isApproved ? (
            <CheckCircle className="w-8 h-8 text-emerald-600 dark:text-emerald-500" />
          ) : (
            <AlertTriangle className="w-8 h-8 text-amber-600 dark:text-amber-500" />
          )}
          <div>
            <h3 className={`text-xl font-bold ${
              isRejected ? 'text-red-900 dark:text-red-400' : isApproved ? 'text-emerald-900 dark:text-emerald-400' : 'text-amber-900 dark:text-amber-400'
            }`}>
              {result.status}
            </h3>
            <p className={`text-xs font-medium ${
              isRejected ? 'text-red-700/60 dark:text-red-300/60' : isApproved ? 'text-emerald-700/60 dark:text-emerald-300/60' : 'text-amber-700/60 dark:text-amber-300/60'
            }`}>
              {isFinalApproved ? 'Final approval granted by Finance' : 
               isRejected ? 'Claim rejected by Finance' : 'Status determined by AI analysis'}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">Eligible Amount</p>
          <p className={`text-3xl font-black ${isRejected ? 'text-slate-300 dark:text-slate-600 line-through' : 'text-slate-900 dark:text-white'}`}>
            ${result.eligibleAmount.toFixed(2)}
          </p>
        </div>
      </div>

      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <h4 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Extracted Metadata</h4>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-400 transition-colors"><User className="w-4 h-4" /></div>
              <div>
                <p className="text-[10px] text-slate-500 font-bold uppercase">On-Bill Name</p>
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{result.details.customerName}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-400 transition-colors"><Receipt className="w-4 h-4" /></div>
              <div>
                <p className="text-[10px] text-slate-500 font-bold uppercase">Provider</p>
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{result.details.provider}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-400 transition-colors"><Calendar className="w-4 h-4" /></div>
              <div>
                <p className="text-[10px] text-slate-500 font-bold uppercase">Period</p>
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{result.months.join(', ')}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-400 transition-colors"><DollarSign className="w-4 h-4" /></div>
              <div>
                <p className="text-[10px] text-slate-500 font-bold uppercase">Total Billed</p>
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">${result.details.totalAmount.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <h4 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">AI Intelligence</h4>
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-200 dark:border-slate-700/50 flex gap-3 transition-colors">
              <Info className="w-5 h-5 text-indigo-500 dark:text-indigo-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-slate-600 dark:text-slate-300 italic leading-relaxed">
                "{result.reasoning}"
              </p>
            </div>
          </div>

          {result.adminReason && (
            <div className="space-y-2">
              <h4 className="text-[10px] font-black text-red-500/80 uppercase tracking-[0.2em]">Finance Feedback</h4>
              <div className="bg-red-50 dark:bg-red-500/10 rounded-xl p-4 border border-red-100 dark:border-red-500/20 flex gap-3 transition-colors">
                <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700 dark:text-red-200 font-medium leading-relaxed">
                  {result.adminReason}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResultCard;
