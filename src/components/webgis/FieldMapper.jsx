import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function FieldMapper({ fields, config, onChange }) {
  const handleChange = (key, value) => {
    onChange({ ...config, [key]: value });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-slate-400 text-sm">Campo Superficie (mq)</Label>
          <Select
            value={config.campo_superficie || ''}
            onValueChange={(v) => handleChange('campo_superficie', v)}
          >
            <SelectTrigger className="bg-slate-900 border-slate-600 text-white">
              <SelectValue placeholder="Seleziona campo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="_none">-- Non mappare --</SelectItem>
              {fields.map((f) => (
                <SelectItem key={f} value={f}>{f}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-slate-400 text-sm">Campo Stato</Label>
          <Select
            value={config.campo_stato || ''}
            onValueChange={(v) => handleChange('campo_stato', v)}
          >
            <SelectTrigger className="bg-slate-900 border-slate-600 text-white">
              <SelectValue placeholder="Seleziona campo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="_none">-- Non mappare --</SelectItem>
              {fields.map((f) => (
                <SelectItem key={f} value={f}>{f}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-slate-400 text-sm">Campo Indirizzo</Label>
          <Select
            value={config.campo_indirizzo || ''}
            onValueChange={(v) => handleChange('campo_indirizzo', v)}
          >
            <SelectTrigger className="bg-slate-900 border-slate-600 text-white">
              <SelectValue placeholder="Seleziona campo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="_none">-- Non mappare --</SelectItem>
              {fields.map((f) => (
                <SelectItem key={f} value={f}>{f}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-slate-400 text-sm">Campo Canone</Label>
          <Select
            value={config.campo_canone || ''}
            onValueChange={(v) => handleChange('campo_canone', v)}
          >
            <SelectTrigger className="bg-slate-900 border-slate-600 text-white">
              <SelectValue placeholder="Seleziona campo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="_none">-- Non mappare --</SelectItem>
              {fields.map((f) => (
                <SelectItem key={f} value={f}>{f}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-slate-400 text-sm">Campo Conduttore</Label>
          <Select
            value={config.campo_conduttore || ''}
            onValueChange={(v) => handleChange('campo_conduttore', v)}
          >
            <SelectTrigger className="bg-slate-900 border-slate-600 text-white">
              <SelectValue placeholder="Seleziona campo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="_none">-- Non mappare --</SelectItem>
              {fields.map((f) => (
                <SelectItem key={f} value={f}>{f}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="pt-4 border-t border-slate-700">
        <h4 className="text-sm font-medium mb-4">Valori per lo stato</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-slate-400 text-sm">Valore "Sfitto"</Label>
            <Input
              value={config.valore_sfitto || ''}
              onChange={(e) => handleChange('valore_sfitto', e.target.value)}
              placeholder="es. SFITTO, Libero, 0..."
              className="bg-slate-900 border-slate-600 text-white"
            />
            <p className="text-xs text-slate-500">Il valore nel campo stato che indica "sfitto"</p>
          </div>
          <div className="space-y-2">
            <Label className="text-slate-400 text-sm">Valore "Occupato"</Label>
            <Input
              value={config.valore_occupato || ''}
              onChange={(e) => handleChange('valore_occupato', e.target.value)}
              placeholder="es. OCCUPATO, Affittato, 1..."
              className="bg-slate-900 border-slate-600 text-white"
            />
            <p className="text-xs text-slate-500">Il valore nel campo stato che indica "occupato"</p>
          </div>
          <div className="space-y-2">
            <Label className="text-slate-400 text-sm">Valore "Altri"</Label>
            <Input
              value={config.valore_altri || ''}
              onChange={(e) => handleChange('valore_altri', e.target.value)}
              placeholder="es. ALTRI, In lavorazione..."
              className="bg-slate-900 border-slate-600 text-white"
            />
            <p className="text-xs text-slate-500">Il valore nel campo stato che indica "altri"</p>
          </div>
        </div>
      </div>
    </div>
  );
}