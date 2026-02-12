import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Eye, Pencil, Check, X, Loader2, Trash2 } from 'lucide-react';

const DEFAULT_POPUP_FIELDS = [
  'ragione_sociale', 'mestiere', 'ateco2025', 'indirizzo',
  'comune', 'partita_iva', 'codice_fiscale'
];

export default function AttivitaPopup({ attivita, onOpenStreetView, user, popupFields, onUpdateAttivita, onDeleteAttivita }) {
  if (!attivita) return null;

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [editData, setEditData] = useState({});

  const fields = popupFields || DEFAULT_POPUP_FIELDS;
  const hasCoords = attivita.coordinates;
  const canEdit = !!user && !!onUpdateAttivita;

  const startEditing = () => {
    // Include tutti i campi dell'attività, inclusi quelli da properties_raw
    const allFields = {
      ragione_sociale: attivita.ragione_sociale || '',
      partita_iva: attivita.partita_iva || '',
      codice_fiscale: attivita.codice_fiscale || '',
      natura_giuridica: attivita.natura_giuridica || '',
      pmi: attivita.pmi || '',
      mestiere: attivita.mestiere || '',
      descrizione_mestiere: attivita.descrizione_mestiere || '',
      ateco2025: attivita.ateco2025 || '',
      descrizione_ateco: attivita.descrizione_ateco || '',
      strada: attivita.strada || '',
      civico: attivita.civico || '',
      frazione: attivita.frazione || '',
      comune: attivita.comune || '',
      cap: attivita.cap || '',
      provincia: attivita.provincia || '',
      regione: attivita.regione || '',
      prov_sede_legale: attivita.prov_sede_legale || '',
      latitudine: attivita.latitudine || '',
      longitudine: attivita.longitudine || '',
      // Aggiungi eventuali campi custom da properties_raw
      ...(attivita.properties_raw || {})
    };
    setEditData(allFields);
    setEditing(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onUpdateAttivita(attivita.id, editData);
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Sei sicuro di voler eliminare questa attività commerciale?\n\n${attivita.ragione_sociale || 'Attività senza ragione sociale'}`)) {
      return;
    }
    setDeleting(true);
    try {
      await onDeleteAttivita(attivita.id);
    } finally {
      setDeleting(false);
    }
  };

  if (editing) {
    return (
      <div className="min-w-[320px] max-w-[380px] flex flex-col" style={{ maxHeight: '60vh' }}>
        <div className="text-sm font-semibold text-slate-800 mb-3 pb-2 border-b border-slate-200 flex-shrink-0">
          Modifica Attività
        </div>

        <div className="space-y-3 overflow-y-auto flex-1 pr-1">
          <div>
            <label className="text-xs text-slate-500 block mb-1">Ragione Sociale</label>
            <input
              type="text"
              value={editData.ragione_sociale}
              onChange={(e) => setEditData({ ...editData, ragione_sociale: e.target.value })}
              className="w-full text-sm border border-gray-300 rounded-md px-2 py-1.5 bg-white text-gray-900"
            />
          </div>

          <div>
            <label className="text-xs text-slate-500 block mb-1">Partita IVA</label>
            <input
              type="text"
              value={editData.partita_iva}
              onChange={(e) => setEditData({ ...editData, partita_iva: e.target.value })}
              className="w-full text-sm border border-gray-300 rounded-md px-2 py-1.5 bg-white text-gray-900"
            />
          </div>

          <div>
            <label className="text-xs text-slate-500 block mb-1">Mestiere</label>
            <input
              type="text"
              value={editData.mestiere}
              onChange={(e) => setEditData({ ...editData, mestiere: e.target.value })}
              className="w-full text-sm border border-gray-300 rounded-md px-2 py-1.5 bg-white text-gray-900"
            />
          </div>

          <div>
            <label className="text-xs text-slate-500 block mb-1">Codice ATECO</label>
            <input
              type="text"
              value={editData.ateco2025}
              onChange={(e) => setEditData({ ...editData, ateco2025: e.target.value })}
              className="w-full text-sm border border-gray-300 rounded-md px-2 py-1.5 bg-white text-gray-900"
            />
          </div>

          <div>
            <label className="text-xs text-slate-500 block mb-1">Indirizzo</label>
            <div className="grid grid-cols-3 gap-2">
              <input
                type="text"
                value={editData.strada}
                onChange={(e) => setEditData({ ...editData, strada: e.target.value })}
                placeholder="Via"
                className="col-span-2 w-full text-sm border border-gray-300 rounded-md px-2 py-1.5 bg-white text-gray-900"
              />
              <input
                type="text"
                value={editData.civico}
                onChange={(e) => setEditData({ ...editData, civico: e.target.value })}
                placeholder="N."
                className="w-full text-sm border border-gray-300 rounded-md px-2 py-1.5 bg-white text-gray-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-slate-500 block mb-1">Comune</label>
              <input
                type="text"
                value={editData.comune}
                onChange={(e) => setEditData({ ...editData, comune: e.target.value })}
                className="w-full text-sm border border-gray-300 rounded-md px-2 py-1.5 bg-white text-gray-900"
              />
            </div>
            <div>
              <label className="text-xs text-slate-500 block mb-1">CAP</label>
              <input
                type="text"
                value={editData.cap}
                onChange={(e) => setEditData({ ...editData, cap: e.target.value })}
                className="w-full text-sm border border-gray-300 rounded-md px-2 py-1.5 bg-white text-gray-900"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-500 block mb-1">Provincia</label>
            <input
              type="text"
              value={editData.provincia}
              onChange={(e) => setEditData({ ...editData, provincia: e.target.value })}
              className="w-full text-sm border border-gray-300 rounded-md px-2 py-1.5 bg-white text-gray-900"
            />
          </div>

          {/* Campi aggiuntivi dal GeoJSON */}
          {Object.keys(editData).filter(key =>
            !['ragione_sociale', 'partita_iva', 'mestiere', 'ateco2025', 'strada', 'civico', 'comune', 'cap', 'provincia'].includes(key)
          ).map(key => (
            <div key={key}>
              <label className="text-xs text-slate-500 block mb-1">
                {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </label>
              <input
                type="text"
                value={editData[key] || ''}
                onChange={(e) => setEditData({ ...editData, [key]: e.target.value })}
                className="w-full text-sm border border-gray-300 rounded-md px-2 py-1.5 bg-white text-gray-900"
                placeholder={`Inserisci ${key}`}
              />
            </div>
          ))}

        </div>

        <div className="flex gap-2 pt-2 mt-2 border-t border-slate-200 flex-shrink-0">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
            Salva
          </button>
          <button
            onClick={() => setEditing(false)}
            disabled={saving}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
            Annulla
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-w-[280px]">
      {/* Action buttons */}
      <div className="flex gap-2 mb-3 flex-wrap">
        {hasCoords && onOpenStreetView && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenStreetView(attivita);
            }}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            <Eye className="w-4 h-4" />
            Street View
          </button>
        )}
        {canEdit && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              startEditing();
            }}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-amber-500 text-white rounded-lg text-sm font-medium hover:bg-amber-600 transition-colors"
          >
            <Pencil className="w-4 h-4" />
            Modifica
          </button>
        )}
        {user && onDeleteAttivita && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDelete();
            }}
            disabled={deleting}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
          >
            {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            Elimina
          </button>
        )}
      </div>

      {/* Header */}
      {fields.includes('ragione_sociale') && (
        <div className="text-sm font-semibold text-slate-800 mb-3 pb-2 border-b border-slate-200">
          {attivita.ragione_sociale || 'Attività Commerciale'}
        </div>
      )}

      {/* Info */}
      <div className="space-y-2">
        {fields.includes('mestiere') && attivita.mestiere && (
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Mestiere</span>
            <span className="text-slate-800 font-medium">{attivita.mestiere}</span>
          </div>
        )}

        {fields.includes('descrizione_mestiere') && attivita.descrizione_mestiere && (
          <div className="text-sm">
            <span className="text-slate-500">Desc. Mestiere:</span>
            <span className="text-slate-800 ml-2">{attivita.descrizione_mestiere}</span>
          </div>
        )}

        {fields.includes('ateco2025') && attivita.ateco2025 && (
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">ATECO</span>
            <span className="text-slate-800 font-medium">{attivita.ateco2025}</span>
          </div>
        )}

        {fields.includes('descrizione_ateco') && attivita.descrizione_ateco && (
          <div className="text-sm">
            <span className="text-slate-500">Desc. ATECO:</span>
            <span className="text-slate-800 ml-2">{attivita.descrizione_ateco}</span>
          </div>
        )}

        {fields.includes('indirizzo') && (attivita.strada || attivita.civico) && (
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Indirizzo</span>
            <span className="text-slate-800 font-medium">
              {attivita.strada} {attivita.civico}
            </span>
          </div>
        )}

        {fields.includes('frazione') && attivita.frazione && (
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Frazione</span>
            <span className="text-slate-800 font-medium">{attivita.frazione}</span>
          </div>
        )}

        {fields.includes('comune') && attivita.comune && (
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Comune</span>
            <span className="text-slate-800 font-medium">
              {attivita.comune} {fields.includes('cap') && attivita.cap && `(${attivita.cap})`}
            </span>
          </div>
        )}

        {fields.includes('cap') && attivita.cap && !fields.includes('comune') && (
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">CAP</span>
            <span className="text-slate-800 font-medium">{attivita.cap}</span>
          </div>
        )}

        {fields.includes('provincia') && attivita.provincia && (
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Provincia</span>
            <span className="text-slate-800 font-medium">{attivita.provincia}</span>
          </div>
        )}

        {fields.includes('regione') && attivita.regione && (
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Regione</span>
            <span className="text-slate-800 font-medium">{attivita.regione}</span>
          </div>
        )}

        {fields.includes('prov_sede_legale') && attivita.prov_sede_legale && (
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Prov. Sede Legale</span>
            <span className="text-slate-800 font-medium">{attivita.prov_sede_legale}</span>
          </div>
        )}

        {fields.includes('partita_iva') && attivita.partita_iva && (
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">P.IVA</span>
            <span className="text-slate-800 font-medium">{attivita.partita_iva}</span>
          </div>
        )}

        {fields.includes('codice_fiscale') && attivita.codice_fiscale && (
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">C.F.</span>
            <span className="text-slate-800 font-medium">{attivita.codice_fiscale}</span>
          </div>
        )}

        {fields.includes('natura_giuridica') && attivita.natura_giuridica && (
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Natura Giuridica</span>
            <span className="text-slate-800 font-medium">{attivita.natura_giuridica}</span>
          </div>
        )}

        {fields.includes('pmi') && attivita.pmi && (
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">PMI</span>
            <span className="text-slate-800 font-medium">{attivita.pmi}</span>
          </div>
        )}

        {fields.includes('latitudine') && attivita.latitudine && (
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Latitudine</span>
            <span className="text-slate-800 font-medium">{attivita.latitudine.toFixed(6)}</span>
          </div>
        )}

        {fields.includes('longitudine') && attivita.longitudine && (
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Longitudine</span>
            <span className="text-slate-800 font-medium">{attivita.longitudine.toFixed(6)}</span>
          </div>
        )}
      </div>

      {/* Badge mestiere - sempre visibile se presente */}
      {fields.includes('mestiere') && attivita.mestiere && (
        <div className="mt-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-600">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            {attivita.mestiere}
          </span>
        </div>
      )}
    </div>
  );
}
