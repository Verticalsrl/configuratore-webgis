import React from 'react';
import { Building2, AlertCircle, CheckCircle2, Percent } from 'lucide-react';

export default function PreviewStats({ stats }) {
  const tasso = stats.totale > 0 
    ? ((stats.sfitti / stats.totale) * 100).toFixed(1) 
    : 0;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <div className="bg-slate-700/50 rounded-xl p-4 text-center">
        <Building2 className="w-6 h-6 mx-auto mb-2 text-blue-400" />
        <div className="text-2xl font-bold">{stats.totale}</div>
        <div className="text-xs text-slate-400 mt-1">Totale Locali</div>
      </div>
      
      <div className="bg-slate-700/50 rounded-xl p-4 text-center">
        <AlertCircle className="w-6 h-6 mx-auto mb-2 text-red-400" />
        <div className="text-2xl font-bold text-red-400">{stats.sfitti}</div>
        <div className="text-xs text-slate-400 mt-1">Sfitti</div>
      </div>
      
      <div className="bg-slate-700/50 rounded-xl p-4 text-center">
        <CheckCircle2 className="w-6 h-6 mx-auto mb-2 text-green-400" />
        <div className="text-2xl font-bold text-green-400">{stats.occupati}</div>
        <div className="text-xs text-slate-400 mt-1">Occupati</div>
      </div>

      {stats.altri > 0 && (
        <div className="bg-slate-700/50 rounded-xl p-4 text-center">
          <AlertCircle className="w-6 h-6 mx-auto mb-2 text-yellow-400" />
          <div className="text-2xl font-bold text-yellow-400">{stats.altri}</div>
          <div className="text-xs text-slate-400 mt-1">Altri</div>
        </div>
      )}
      
      <div className="bg-slate-700/50 rounded-xl p-4 text-center">
        <Percent className="w-6 h-6 mx-auto mb-2 text-amber-400" />
        <div className="text-2xl font-bold text-amber-400">{tasso}%</div>
        <div className="text-xs text-slate-400 mt-1">Tasso Sfitto</div>
      </div>
    </div>
  );
}