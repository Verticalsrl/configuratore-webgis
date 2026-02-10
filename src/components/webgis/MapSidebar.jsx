import React from 'react';
import { Building2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';

export default function MapSidebar({ 
  project, 
  stats, 
  filters, 
  onFilterChange,
  user
}) {
  const tasso = stats.totale > 0 
    ? ((stats.sfitti / stats.totale) * 100).toFixed(1) 
    : 0;

  return (
    <div className="w-80 bg-white p-5 overflow-y-auto flex flex-col h-full border-r border-gray-200">
      {/* Logo */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-11 h-11 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
          <Building2 className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-lg font-semibold text-gray-900">{project?.nome || 'WebGIS'}</h1>
          <span className="text-xs text-gray-500">Locali Commerciali</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-2.5 mb-6">
        <div className="bg-gray-50 rounded-xl p-3.5 border border-gray-200">
          <div className="text-xs text-gray-600 uppercase tracking-wide mb-1">Totale</div>
          <div className="text-2xl font-bold text-gray-900">{stats.totale}</div>
        </div>
        <div className="bg-red-50 rounded-xl p-3.5 border border-red-200">
          <div className="text-xs text-red-600 uppercase tracking-wide mb-1">Sfitti</div>
          <div className="text-2xl font-bold text-red-600">{stats.sfitti}</div>
        </div>
        <div className="bg-green-50 rounded-xl p-3.5 border border-green-200">
          <div className="text-xs text-green-600 uppercase tracking-wide mb-1">Occupati</div>
          <div className="text-2xl font-bold text-green-600">{stats.occupati}</div>
        </div>
        {stats.altri > 0 && (
          <div className="bg-yellow-50 rounded-xl p-3.5 border border-yellow-200">
            <div className="text-xs text-yellow-600 uppercase tracking-wide mb-1">Altri</div>
            <div className="text-2xl font-bold text-yellow-600">{stats.altri}</div>
          </div>
        )}
        <div className="bg-amber-50 rounded-xl p-3.5 border border-amber-200">
          <div className="text-xs text-amber-600 uppercase tracking-wide mb-1">Tasso</div>
          <div className="text-2xl font-bold text-amber-600">{tasso}%</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex-1">
        <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-4">Filtri</h3>
        
        <div className="space-y-4">
          {/* Status Filter */}
          <div>
            <label className="text-xs text-gray-600 block mb-2">Stato</label>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="show-sfitti"
                  checked={filters.showSfitti}
                  onCheckedChange={(checked) => onFilterChange({ ...filters, showSfitti: checked })}
                />
                <label htmlFor="show-sfitti" className="text-sm text-gray-900 flex items-center gap-2 cursor-pointer">
                  <span className="w-3 h-3 rounded-full bg-red-500" />
                  Sfitti
                </label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="show-occupati"
                  checked={filters.showOccupati}
                  onCheckedChange={(checked) => onFilterChange({ ...filters, showOccupati: checked })}
                />
                <label htmlFor="show-occupati" className="text-sm text-gray-900 flex items-center gap-2 cursor-pointer">
                  <span className="w-3 h-3 rounded-full bg-green-500" />
                  Occupati
                </label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="show-altri"
                  checked={filters.showAltri}
                  onCheckedChange={(checked) => onFilterChange({ ...filters, showAltri: checked })}
                />
                <label htmlFor="show-altri" className="text-sm text-gray-900 flex items-center gap-2 cursor-pointer">
                  <span className="w-3 h-3 rounded-full bg-yellow-500" />
                  Altri
                </label>
              </div>
            </div>
          </div>

          {/* Search */}
          <div>
            <label className="text-xs text-gray-600 block mb-2">Cerca indirizzo</label>
            <Input
              value={filters.search}
              onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
              placeholder="Cerca..."
              className="bg-white border-gray-300 text-gray-900 text-sm"
            />
          </div>

          {/* Surface Range */}
          <div>
            <label className="text-xs text-gray-600 block mb-2">Superficie (mq)</label>
            <div className="grid grid-cols-2 gap-2">
              <Input
                type="number"
                value={filters.minSuperficie}
                onChange={(e) => onFilterChange({ ...filters, minSuperficie: e.target.value })}
                placeholder="Min"
                className="bg-white border-gray-300 text-gray-900 text-sm"
              />
              <Input
                type="number"
                value={filters.maxSuperficie}
                onChange={(e) => onFilterChange({ ...filters, maxSuperficie: e.target.value })}
                placeholder="Max"
                className="bg-white border-gray-300 text-gray-900 text-sm"
              />
            </div>
          </div>

          {/* Foglio and Particella Search */}
          <div>
            <label className="text-xs text-gray-600 block mb-2">Cerca Foglio</label>
            <Input
              value={filters.foglioSearch || ''}
              onChange={(e) => onFilterChange({ ...filters, foglioSearch: e.target.value })}
              placeholder="N. Foglio"
              className="bg-white border-gray-300 text-gray-900 text-sm"
            />
          </div>

          <div>
            <label className="text-xs text-gray-600 block mb-2">Cerca Particella</label>
            <Input
              value={filters.particellaSearch || ''}
              onChange={(e) => onFilterChange({ ...filters, particellaSearch: e.target.value })}
              placeholder="N. Particella"
              className="bg-white border-gray-300 text-gray-900 text-sm"
            />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="pt-4 mt-4 border-t border-gray-200 space-y-2">
        <Link to={createPageUrl('Projects')}>
          <Button
            variant="outline"
            className="w-full bg-white border-gray-300 hover:bg-gray-50 text-gray-900"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Tutti i Progetti
          </Button>
        </Link>
      </div>
    </div>
  );
}