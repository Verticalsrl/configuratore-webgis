import React from 'react';
import { cn } from '@/lib/utils';

export default function LocalePopup({ locale }) {
  if (!locale) return null;

  return (
    <div className="min-w-[240px]">
      <div className="text-sm font-semibold text-slate-800 mb-3 pb-2 border-b border-slate-200">
        {locale.indirizzo || 'Locale'}
      </div>
      
      <div className="space-y-2">
        {locale.superficie > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Superficie</span>
            <span className="text-slate-800 font-medium">{locale.superficie.toFixed(0)} mq</span>
          </div>
        )}
        
        {locale.canone > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Canone</span>
            <span className="text-slate-800 font-medium">€ {locale.canone.toLocaleString()}</span>
          </div>
        )}
        
        {locale.conduttore && (
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Conduttore</span>
            <span className="text-slate-800 font-medium">{locale.conduttore}</span>
          </div>
        )}
      </div>
      
      <div className="mt-3">
        <span
          className={cn(
            "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold",
            locale.stato === 'sfitto' 
              ? "bg-red-50 text-red-600" 
              : locale.stato === 'occupato'
              ? "bg-green-50 text-green-600"
              : "bg-yellow-50 text-yellow-600"
          )}
        >
          <span className={cn(
            "w-2 h-2 rounded-full",
            locale.stato === 'sfitto' 
              ? "bg-red-500" 
              : locale.stato === 'occupato'
              ? "bg-green-500"
              : "bg-yellow-500"
          )} />
          {locale.stato === 'sfitto' ? 'Sfitto' : locale.stato === 'occupato' ? 'Occupato' : 'Altri'}
        </span>
      </div>
    </div>
  );
}