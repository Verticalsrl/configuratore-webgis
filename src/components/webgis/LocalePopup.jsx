import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Eye, Pencil, Check, X, Loader2, Trash2 } from 'lucide-react';

const DEFAULT_POPUP_FIELDS = ['indirizzo', 'superficie', 'canone', 'conduttore', 'stato'];

export default function LocalePopup({ locale, onOpenStreetView, user, popupFields, onUpdateLocale, onDeleteLocale }) {
  if (!locale) return null;

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [changingStatus, setChangingStatus] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [editData, setEditData] = useState({});

  const fields = popupFields || DEFAULT_POPUP_FIELDS;
  const hasCoords = locale.coordinates || locale.geometry?.coordinates;
  const canEdit = !!user && !!onUpdateLocale;

  const handleQuickStatusChange = async (newStatus) => {
    if (!canEdit || newStatus === locale.stato) return;
    setChangingStatus(true);
    try {
      await onUpdateLocale(locale.id, { stato: newStatus });
    } finally {
      setChangingStatus(false);
    }
  };

  const startEditing = () => {
    // Include tutti i campi del locale, inclusi quelli da properties_raw
    const allFields = {
      stato: locale.stato || 'sfitto',
      canone: locale.canone || 0,
      conduttore: locale.conduttore || '',
      superficie: locale.superficie || 0,
      indirizzo: locale.indirizzo || '',
      // Aggiungi eventuali campi custom da properties_raw
      ...(locale.properties_raw || {})
    };
    setEditData(allFields);
    setEditing(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onUpdateLocale(locale.id, editData);
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Sei sicuro di voler eliminare questo locale?\n\n${locale.indirizzo || 'Locale senza indirizzo'}`)) {
      return;
    }
    setDeleting(true);
    try {
      await onDeleteLocale(locale.id);
    } finally {
      setDeleting(false);
    }
  };

  if (editing) {
    return (
      <div className="min-w-[280px]">
        <div className="text-sm font-semibold text-slate-800 mb-3 pb-2 border-b border-slate-200">
          {locale.indirizzo || 'Locale'}
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-xs text-slate-500 block mb-1">Stato</label>
            <select
              value={editData.stato}
              onChange={(e) => setEditData({ ...editData, stato: e.target.value })}
              className="w-full text-sm border border-gray-300 rounded-md px-2 py-1.5 bg-white text-gray-900"
            >
              <option value="sfitto">Sfitto</option>
              <option value="occupato">Occupato</option>
              <option value="altri">Altri</option>
            </select>
          </div>

          <div>
            <label className="text-xs text-slate-500 block mb-1">Canone</label>
            <input
              type="number"
              value={editData.canone}
              onChange={(e) => setEditData({ ...editData, canone: parseFloat(e.target.value) || 0 })}
              className="w-full text-sm border border-gray-300 rounded-md px-2 py-1.5 bg-white text-gray-900"
            />
          </div>

          <div>
            <label className="text-xs text-slate-500 block mb-1">Conduttore</label>
            <input
              type="text"
              value={editData.conduttore}
              onChange={(e) => setEditData({ ...editData, conduttore: e.target.value })}
              className="w-full text-sm border border-gray-300 rounded-md px-2 py-1.5 bg-white text-gray-900"
            />
          </div>

          <div>
            <label className="text-xs text-slate-500 block mb-1">Superficie (mq)</label>
            <input
              type="number"
              value={editData.superficie}
              onChange={(e) => setEditData({ ...editData, superficie: parseFloat(e.target.value) || 0 })}
              className="w-full text-sm border border-gray-300 rounded-md px-2 py-1.5 bg-white text-gray-900"
            />
          </div>

          {/* Campi aggiuntivi dal GeoJSON */}
          {Object.keys(editData).filter(key =>
            !['stato', 'canone', 'conduttore', 'superficie', 'indirizzo'].includes(key)
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

          <div className="flex gap-2 pt-1">
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
      </div>
    );
  }

  return (
    <div className="min-w-[260px]">
      {/* Action buttons */}
      <div className="flex gap-2 mb-3 flex-wrap">
        {hasCoords && onOpenStreetView && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenStreetView(locale);
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
        {user && onDeleteLocale && (
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

      {fields.includes('indirizzo') && (
        <div className="text-sm font-semibold text-slate-800 mb-3 pb-2 border-b border-slate-200">
          {locale.indirizzo || 'Locale'}
        </div>
      )}

      <div className="space-y-2">
        {fields.includes('superficie') && locale.superficie > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Superficie</span>
            <span className="text-slate-800 font-medium">{locale.superficie.toFixed(0)} mq</span>
          </div>
        )}

        {fields.includes('canone') && locale.canone > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Canone</span>
            <span className="text-slate-800 font-medium">&euro; {locale.canone.toLocaleString()}</span>
          </div>
        )}

        {fields.includes('conduttore') && locale.conduttore && (
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Conduttore</span>
            <span className="text-slate-800 font-medium">{locale.conduttore}</span>
          </div>
        )}
      </div>

      {fields.includes('stato') && (
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
      )}

      {/* Cambio rapido stato */}
      {canEdit && (
        <div className="mt-3 pt-3 border-t border-slate-200">
          <div className="text-xs text-slate-500 mb-2">Cambia stato:</div>
          <div className="flex gap-1.5">
            {[
              { value: 'sfitto', label: 'Sfitto', bg: 'bg-red-100 hover:bg-red-200 text-red-700', active: 'bg-red-600 text-white' },
              { value: 'occupato', label: 'Occupato', bg: 'bg-green-100 hover:bg-green-200 text-green-700', active: 'bg-green-600 text-white' },
              { value: 'altri', label: 'Altri', bg: 'bg-yellow-100 hover:bg-yellow-200 text-yellow-700', active: 'bg-yellow-600 text-white' },
            ].map(opt => (
              <button
                key={opt.value}
                onClick={() => handleQuickStatusChange(opt.value)}
                disabled={changingStatus}
                className={cn(
                  "flex-1 px-2 py-1.5 rounded-md text-xs font-medium transition-colors",
                  locale.stato === opt.value ? opt.active : opt.bg,
                  changingStatus && "opacity-50 cursor-not-allowed"
                )}
              >
                {changingStatus ? '...' : opt.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
