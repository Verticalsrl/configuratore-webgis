import React from 'react';

export default function MapLegend() {
  return (
    <div className="absolute bottom-6 right-4 bg-white rounded-xl shadow-lg p-4 z-[1000]">
      <h4 className="text-sm font-semibold text-slate-800 mb-3">Legenda</h4>
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <div className="w-5 h-3.5 rounded bg-red-400/70" />
          Sfitto
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <div className="w-5 h-3.5 rounded bg-green-400/70" />
          Occupato
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <div className="w-5 h-3.5 rounded bg-yellow-400/70" />
          Altri
        </div>
      </div>
    </div>
  );
}