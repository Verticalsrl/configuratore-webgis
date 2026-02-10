import React from 'react';
import { cn } from '@/lib/utils';
import { Eye } from 'lucide-react';

export default function LocalePopup({ locale, onOpenStreetView }) {
  if (!locale) return null;

  const hasCoords = locale.coordinates || locale.geometry?.coordinates;

  return (
    <div className="min-w-[260px]">
      {/* Street View button */}
      {hasCoords && onOpenStreetView && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onOpenStreetView(locale);
          }}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 mb-3 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          <Eye className="w-4 h-4" />
          Street View
        </button>
      )}

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
            <span className="text-slate-800 font-medium">&euro; {locale.canone.toLocaleString()}</span>
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
