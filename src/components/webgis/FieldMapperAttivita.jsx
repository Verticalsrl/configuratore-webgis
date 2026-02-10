import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

export default function FieldMapperAttivita({ fields, config, onChange }) {
  const handleChange = (key, value) => {
    onChange({ ...config, [key]: value });
  };

  const renderFieldSelect = (label, configKey, placeholder = "Seleziona campo") => (
    <div className="space-y-2">
      <Label className="text-slate-400 text-sm">{label}</Label>
      <Select
        value={config[configKey] || ''}
        onValueChange={(v) => handleChange(configKey, v)}
      >
        <SelectTrigger className="bg-slate-900 border-slate-600 text-white">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="_none">-- Non mappare --</SelectItem>
          {fields.map((f) => (
            <SelectItem key={f} value={f}>{f}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Sezione Dati Anagrafici */}
      <div>
        <h4 className="text-sm font-medium mb-4 text-white">Dati Anagrafici</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {renderFieldSelect('ID', 'campo_id')}
          {renderFieldSelect('Ragione Sociale', 'campo_ragione_sociale')}
          {renderFieldSelect('Partita IVA', 'campo_partita_iva')}
          {renderFieldSelect('Codice Fiscale', 'campo_codice_fiscale')}
          {renderFieldSelect('Natura Giuridica', 'campo_natura_giuridica')}
          {renderFieldSelect('PMI (Piccola/Media Impresa)', 'campo_pmi')}
        </div>
      </div>

      {/* Sezione Indirizzo */}
      <div className="pt-4 border-t border-slate-700">
        <h4 className="text-sm font-medium mb-4 text-white">Indirizzo</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {renderFieldSelect('Strada', 'campo_strada')}
          {renderFieldSelect('Civico', 'campo_civico')}
          {renderFieldSelect('Frazione', 'campo_frazione')}
          {renderFieldSelect('Comune', 'campo_comune')}
          {renderFieldSelect('CAP', 'campo_cap')}
          {renderFieldSelect('Provincia', 'campo_provincia')}
          {renderFieldSelect('Regione', 'campo_regione')}
          {renderFieldSelect('Provincia Sede Legale', 'campo_prov_sede_legale')}
        </div>
      </div>

      {/* Sezione Coordinate */}
      <div className="pt-4 border-t border-slate-700">
        <h4 className="text-sm font-medium mb-4 text-white">Coordinate Geografiche</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {renderFieldSelect('Latitudine', 'campo_latitudine')}
          {renderFieldSelect('Longitudine', 'campo_longitudine')}
        </div>
        <p className="text-xs text-slate-500 mt-2">
          Se non specificate, le coordinate verranno estratte dalla geometria GeoJSON
        </p>
      </div>

      {/* Sezione Attività Economica */}
      <div className="pt-4 border-t border-slate-700">
        <h4 className="text-sm font-medium mb-4 text-white">Attività Economica</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {renderFieldSelect('Mestiere', 'campo_mestiere')}
          {renderFieldSelect('Descrizione Mestiere', 'campo_descrizione_mestiere')}
          {renderFieldSelect('Codice ATECO 2025', 'campo_ateco')}
          {renderFieldSelect('Descrizione ATECO', 'campo_descrizione_ateco')}
        </div>
      </div>
    </div>
  );
}
