import React from 'react';
import { Building2, Download, Settings, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function MapSidebar({ 
  project, 
  stats, 
  filters, 
  onFilterChange,
  onExport,
  onReset
}) {
  const tasso = stats.totale > 0 
    ? ((stats.sfitti / stats.totale) * 100).toFixed(1) 
    : 0;

  return (
    <div className="w-80 bg-slate-800 p-5 overflow-y-auto flex flex-col h-full border-r border-slate-700">
      {/* Logo */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-11 h-11 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
          <Building2 className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-lg font-semibold text-white">{project?.nome || 'WebGIS'}</h1>
          <span className="text-xs text-slate-400">Locali Commerciali</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-2.5 mb-6">
        <div className="bg-slate-700/50 rounded-xl p-3.5">
          <div className="text-xs text-slate-400 uppercase tracking-wide mb-1">Totale</div>
          <div className="text-2xl font-bold text-white">{stats.totale}</div>
        </div>
        <div className="bg-slate-700/50 rounded-xl p-3.5">
          <div className="text-xs text-slate-400 uppercase tracking-wide mb-1">Sfitti</div>
          <div className="text-2xl font-bold text-red-400">{stats.sfitti}</div>
        </div>
        <div className="bg-slate-700/50 rounded-xl p-3.5">
          <div className="text-xs text-slate-400 uppercase tracking-wide mb-1">Occupati</div>
          <div className="text-2xl font-bold text-green-400">{stats.occupati}</div>
        </div>
        <div className="bg-slate-700/50 rounded-xl p-3.5">
          <div className="text-xs text-slate-400 uppercase tracking-wide mb-1">Tasso</div>
          <div className="text-2xl font-bold text-amber-400">{tasso}%</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex-1">
        <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wide mb-4">Filtri</h3>
        
        <div className="space-y-4">
          {/* Status Filter */}
          <div>
            <label className="text-xs text-slate-400 block mb-2">Stato</label>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="show-sfitti"
                  checked={filters.showSfitti}
                  onCheckedChange={(checked) => onFilterChange({ ...filters, showSfitti: checked })}
                />
                <label htmlFor="show-sfitti" className="text-sm text-white flex items-center gap-2 cursor-pointer">
                  <span className="w-3 h-3 rounded-full bg-red-400" />
                  Sfitti
                </label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="show-occupati"
                  checked={filters.showOccupati}
                  onCheckedChange={(checked) => onFilterChange({ ...filters, showOccupati: checked })}
                />
                <label htmlFor="show-occupati" className="text-sm text-white flex items-center gap-2 cursor-pointer">
                  <span className="w-3 h-3 rounded-full bg-green-400" />
                  Occupati
                </label>
              </div>
            </div>
          </div>

          {/* Search */}
          <div>
            <label className="text-xs text-slate-400 block mb-2">Cerca indirizzo</label>
            <Input
              value={filters.search}
              onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
              placeholder="Cerca..."
              className="bg-slate-900 border-slate-600 text-white text-sm"
            />
          </div>

          {/* Surface Range */}
          <div>
            <label className="text-xs text-slate-400 block mb-2">Superficie (mq)</label>
            <div className="grid grid-cols-2 gap-2">
              <Input
                type="number"
                value={filters.minSuperficie}
                onChange={(e) => onFilterChange({ ...filters, minSuperficie: e.target.value })}
                placeholder="Min"
                className="bg-slate-900 border-slate-600 text-white text-sm"
              />
              <Input
                type="number"
                value={filters.maxSuperficie}
                onChange={(e) => onFilterChange({ ...filters, maxSuperficie: e.target.value })}
                placeholder="Max"
                className="bg-slate-900 border-slate-600 text-white text-sm"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="pt-4 mt-4 border-t border-slate-700 space-y-2">
        <Button
          onClick={onExport}
          variant="outline"
          className="w-full bg-slate-700 border-slate-600 hover:bg-slate-600 text-white"
        >
          <Download className="w-4 h-4 mr-2" />
          Esporta CSV
        </Button>
        <Button
          onClick={onReset}
          variant="outline"
          className="w-full bg-slate-700 border-slate-600 hover:bg-slate-600 text-white"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Nuovo Progetto
        </Button>
      </div>
    </div>
  );
}