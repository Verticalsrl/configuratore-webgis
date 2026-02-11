import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Download, Upload, Trash2, Loader2, Pencil, Check, X, Building2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import ImportGeoJSONModal from './ImportGeoJSONModal';
import ImportAttivitaModal from './ImportAttivitaModal';

const DEFAULT_POPUP_FIELDS = ['indirizzo', 'superficie', 'canone', 'conduttore', 'stato'];

const POPUP_FIELD_LABELS = {
  indirizzo: 'Indirizzo',
  superficie: 'Superficie',
  canone: 'Canone',
  conduttore: 'Conduttore',
  stato: 'Stato',
};

const DEFAULT_POPUP_FIELDS_ATTIVITA = [
  'ragione_sociale', 'mestiere', 'ateco2025', 'indirizzo',
  'comune', 'partita_iva', 'codice_fiscale'
];

const POPUP_FIELD_LABELS_ATTIVITA = {
  ragione_sociale: 'Ragione Sociale',
  mestiere: 'Mestiere',
  ateco2025: 'Codice ATECO',
  descrizione_mestiere: 'Descrizione Mestiere',
  descrizione_ateco: 'Descrizione ATECO',
  indirizzo: 'Indirizzo (Strada + Civico)',
  comune: 'Comune',
  cap: 'CAP',
  provincia: 'Provincia',
  regione: 'Regione',
  frazione: 'Frazione',
  prov_sede_legale: 'Provincia Sede Legale',
  partita_iva: 'Partita IVA',
  codice_fiscale: 'Codice Fiscale',
  natura_giuridica: 'Natura Giuridica',
  pmi: 'PMI',
  latitudine: 'Latitudine',
  longitudine: 'Longitudine'
};

export default function ProjectSettingsDialog({ open, onOpenChange, project }) {
  const [showImportModal, setShowImportModal] = useState(false);
  const [showImportAttivitaModal, setShowImportAttivitaModal] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState('');
  const [saving, setSaving] = useState(false);
  const queryClient = useQueryClient();

  // Stato locale per popup fields (solo UI, non auto-save)
  const [localPopupFields, setLocalPopupFields] = useState(null);
  const [localPopupFieldsAttivita, setLocalPopupFieldsAttivita] = useState(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const { data: locali = [] } = useQuery({
    queryKey: ['locali', project?.id],
    queryFn: () => base44.entities.Locale.filter({ project_id: project.id }),
    enabled: !!project?.id && open
  });

  const { data: attivita = [] } = useQuery({
    queryKey: ['attivita', project?.id],
    queryFn: async () => {
      try {
        return await base44.entities.AttivitaCommerciale.filter({ project_id: project.id });
      } catch (error) {
        return [];
      }
    },
    enabled: !!project?.id && open
  });

  // Usa stato locale se disponibile, altrimenti usa il valore del progetto
  const popupFields = localPopupFields !== null
    ? localPopupFields
    : (project?.config?.popup_fields || DEFAULT_POPUP_FIELDS);
  const popupFieldsAttivita = localPopupFieldsAttivita !== null
    ? localPopupFieldsAttivita
    : (project?.config?.popup_fields_attivita || DEFAULT_POPUP_FIELDS_ATTIVITA);

  // Reset stato locale quando cambia progetto o si apre il dialog
  React.useEffect(() => {
    if (open) {
      setLocalPopupFields(null);
      setLocalPopupFieldsAttivita(null);
      setHasUnsavedChanges(false);
    }
  }, [project?.id, open]);

  const handleExport = () => {
    const geojson = {
      type: 'FeatureCollection',
      features: locali.map((l) => ({
        type: 'Feature',
        geometry: l.geometry || {
          type: 'Point',
          coordinates: l.coordinates || [0, 0]
        },
        properties: {
          indirizzo: l.indirizzo,
          superficie: l.superficie,
          stato: l.stato,
          canone: l.canone,
          conduttore: l.conduttore,
          ...l.properties_raw
        }
      }))
    };

    const blob = new Blob([JSON.stringify(geojson, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project?.nome || 'progetto'}_export.geojson`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportAttivita = () => {
    const geojson = {
      type: 'FeatureCollection',
      features: attivita.map((a) => ({
        type: 'Feature',
        geometry: a.geometry || {
          type: 'Point',
          coordinates: a.coordinates || [0, 0]
        },
        properties: {
          ragione_sociale: a.ragione_sociale,
          partita_iva: a.partita_iva,
          codice_fiscale: a.codice_fiscale,
          mestiere: a.mestiere,
          descrizione_mestiere: a.descrizione_mestiere,
          ateco2025: a.ateco2025,
          descrizione_ateco: a.descrizione_ateco,
          strada: a.strada,
          civico: a.civico,
          comune: a.comune,
          cap: a.cap,
          provincia: a.provincia,
          regione: a.regione,
          frazione: a.frazione,
          ...a.properties_raw
        }
      }))
    };

    const blob = new Blob([JSON.stringify(geojson, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project?.nome || 'progetto'}_attivita_export.geojson`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClearProject = async () => {
    if (!confirm('Sei sicuro di voler svuotare tutti i locali di questo progetto?')) return;

    await Promise.all(locali.map((l) => base44.entities.Locale.delete(l.id)));
    await base44.entities.Progetto.update(project.id, {
      totale_locali: 0,
      totale_sfitti: 0,
      totale_occupati: 0,
      totale_altri: 0
    });
    queryClient.invalidateQueries({ queryKey: ['locali', project.id] });
    queryClient.invalidateQueries({ queryKey: ['projects'] });
  };

  const handleClearAttivita = async () => {
    if (!confirm('Sei sicuro di voler eliminare tutte le attività commerciali di questo progetto?')) return;

    try {
      await Promise.all(attivita.map((a) => base44.entities.AttivitaCommerciale.delete(a.id)));
      queryClient.invalidateQueries({ queryKey: ['attivita', project.id] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      alert('Attività commerciali eliminate con successo');
    } catch (error) {
      alert(`Errore nell'eliminazione: ${error.message}`);
    }
  };

  const handleImportSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['locali', project.id] });
    queryClient.invalidateQueries({ queryKey: ['projects'] });
    setShowImportModal(false);
  };

  const handleImportAttivitaSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['attivita', project.id] });
    queryClient.invalidateQueries({ queryKey: ['projects'] });
    setShowImportAttivitaModal(false);
  };

  const handleStartRename = () => {
    setNewName(project.nome);
    setEditingName(true);
  };

  const handleSaveRename = async () => {
    if (!newName.trim() || newName.trim() === project.nome) {
      setEditingName(false);
      return;
    }
    setSaving(true);
    try {
      await base44.entities.Progetto.update(project.id, { nome: newName.trim() });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['project', project.id] });
      setEditingName(false);
    } finally {
      setSaving(false);
    }
  };

  const handleTogglePopupField = (field) => {
    const baseFields = project?.config?.popup_fields || DEFAULT_POPUP_FIELDS;
    const currentFields = localPopupFields !== null ? [...localPopupFields] : [...baseFields];
    const idx = currentFields.indexOf(field);
    if (idx >= 0) {
      currentFields.splice(idx, 1);
    } else {
      currentFields.push(field);
    }

    setLocalPopupFields(currentFields);
    setHasUnsavedChanges(true);
  };

  const handleTogglePopupFieldAttivita = (field) => {
    const baseFields = project?.config?.popup_fields_attivita || DEFAULT_POPUP_FIELDS_ATTIVITA;
    const currentFields = localPopupFieldsAttivita !== null ? [...localPopupFieldsAttivita] : [...baseFields];
    const idx = currentFields.indexOf(field);
    if (idx >= 0) {
      currentFields.splice(idx, 1);
    } else {
      currentFields.push(field);
    }

    setLocalPopupFieldsAttivita(currentFields);
    setHasUnsavedChanges(true);
  };

  const handleSelectAllAttivita = () => {
    const allFields = Object.keys(POPUP_FIELD_LABELS_ATTIVITA);
    setLocalPopupFieldsAttivita(allFields);
    setHasUnsavedChanges(true);
  };

  const handleDeselectAllAttivita = () => {
    setLocalPopupFieldsAttivita([]);
    setHasUnsavedChanges(true);
  };

  const handleSavePopupConfig = async () => {
    setSaving(true);
    try {
      const fieldsLocali = localPopupFields !== null ? localPopupFields : (project?.config?.popup_fields || DEFAULT_POPUP_FIELDS);
      const fieldsAttivita = localPopupFieldsAttivita !== null ? localPopupFieldsAttivita : (project?.config?.popup_fields_attivita || DEFAULT_POPUP_FIELDS_ATTIVITA);

      const newConfig = {
        ...(project.config || {}),
        popup_fields: fieldsLocali,
        popup_fields_attivita: fieldsAttivita
      };

      await base44.entities.Progetto.update(project.id, { config: newConfig });

      // Aspetta che i refetch siano completati prima di resettare lo stato locale
      await queryClient.refetchQueries({ queryKey: ['projects'] });
      await queryClient.refetchQueries({ queryKey: ['project', project.id] });

      setHasUnsavedChanges(false);

      console.log('✅ Configurazione popup salvata', newConfig);
      alert('Configurazione salvata con successo!');
    } catch (error) {
      console.error('❌ Errore salvataggio:', error);
      alert(`Errore nel salvataggio: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleCancelPopupConfig = () => {
    setLocalPopupFields(null);
    setLocalPopupFieldsAttivita(null);
    setHasUnsavedChanges(false);
  };

  if (!project) return null;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="bg-white border-gray-200 text-gray-900 max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-gray-900">Impostazioni Progetto</DialogTitle>
            <DialogDescription className="text-gray-500">
              Gestisci il progetto e configura la visualizzazione
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="general" className="w-full">
            <TabsList className="w-full">
              <TabsTrigger value="general" className="flex-1">Generale</TabsTrigger>
              <TabsTrigger value="data" className="flex-1">Dati</TabsTrigger>
              <TabsTrigger value="popup" className="flex-1">Popup</TabsTrigger>
            </TabsList>

            {/* General Tab - Rename */}
            <TabsContent value="general" className="space-y-4 mt-4">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">Nome Progetto</label>
                {editingName ? (
                  <div className="flex gap-2">
                    <Input
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="flex-1 bg-white border-gray-300 text-gray-900"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveRename();
                        if (e.key === 'Escape') setEditingName(false);
                      }}
                      autoFocus
                    />
                    <Button size="icon" onClick={handleSaveRename} disabled={saving} className="bg-green-600 hover:bg-green-700">
                      {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                    </Button>
                    <Button size="icon" variant="outline" onClick={() => setEditingName(false)} className="border-gray-300">
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="text-gray-900 font-medium flex-1">{project.nome}</span>
                    <Button size="sm" variant="outline" onClick={handleStartRename} className="border-gray-300">
                      <Pencil className="w-3.5 h-3.5 mr-1.5" />
                      Rinomina
                    </Button>
                  </div>
                )}
              </div>
              {project.descrizione && (
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Descrizione</label>
                  <p className="text-sm text-gray-600">{project.descrizione}</p>
                </div>
              )}
            </TabsContent>

            {/* Data Tab - Import/Export/Clear */}
            <TabsContent value="data" className="space-y-3 mt-4">
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-900">Locali Commerciali</h4>
                <Button
                  onClick={handleExport}
                  variant="outline"
                  className="w-full border-gray-300 hover:bg-gray-50 text-gray-900 justify-start"
                >
                  <Download className="w-5 h-5 mr-3" />
                  Esporta GeoJSON
                </Button>
                <Button
                  onClick={() => setShowImportModal(true)}
                  variant="outline"
                  className="w-full border-gray-300 hover:bg-gray-50 text-gray-900 justify-start"
                >
                  <Upload className="w-5 h-5 mr-3" />
                  Importa GeoJSON
                </Button>
              </div>

              <div className="pt-4 border-t border-gray-200 space-y-2">
                <h4 className="text-sm font-medium text-gray-900">Attività Commerciali</h4>
                <Button
                  onClick={handleExportAttivita}
                  variant="outline"
                  className="w-full border-gray-300 hover:bg-gray-50 text-gray-900 justify-start"
                  disabled={attivita.length === 0}
                >
                  <Download className="w-5 h-5 mr-3" />
                  Esporta GeoJSON Attività
                </Button>
                <Button
                  onClick={() => setShowImportAttivitaModal(true)}
                  variant="outline"
                  className="w-full border-gray-300 hover:bg-gray-50 text-gray-900 justify-start"
                >
                  <Building2 className="w-5 h-5 mr-3" />
                  Importa Attività Commerciali
                </Button>
              </div>

              <div className="pt-4 mt-4 border-t border-gray-200 space-y-2">
                <p className="text-xs text-gray-500 mb-3">
                  Queste azioni sono irreversibili. Procedi con cautela.
                </p>
                <Button
                  onClick={handleClearProject}
                  variant="destructive"
                  className="w-full justify-start"
                  disabled={locali.length === 0}
                >
                  <Trash2 className="w-5 h-5 mr-3" />
                  Svuota Locali Commerciali
                </Button>
                <Button
                  onClick={handleClearAttivita}
                  variant="destructive"
                  className="w-full justify-start"
                  disabled={attivita.length === 0}
                >
                  <Trash2 className="w-5 h-5 mr-3" />
                  Svuota Attività Commerciali
                </Button>
              </div>
            </TabsContent>

            {/* Popup Config Tab */}
            <TabsContent value="popup" className="space-y-6 mt-4">
              {/* Locali Commerciali */}
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-2">Locali Commerciali</h4>
                <p className="text-sm text-gray-500 mb-3">
                  Seleziona i campi da mostrare nel popup dei locali sulla mappa.
                </p>
                <div className="space-y-2">
                  {Object.entries(POPUP_FIELD_LABELS).map(([field, label]) => (
                    <div key={field} className="flex items-center gap-3">
                      <Checkbox
                        id={`popup-field-${field}`}
                        checked={popupFields.includes(field)}
                        onCheckedChange={() => handleTogglePopupField(field)}
                      />
                      <label
                        htmlFor={`popup-field-${field}`}
                        className="text-sm text-gray-900 cursor-pointer"
                      >
                        {label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Attività Commerciali */}
              <div className="pt-4 border-t border-gray-200">
                <h4 className="text-sm font-semibold text-gray-900 mb-2">Attività Commerciali</h4>
                <p className="text-sm text-gray-500 mb-3">
                  Seleziona i campi da mostrare nel popup delle attività sulla mappa.
                </p>

                {/* Pulsanti rapidi */}
                <div className="flex gap-2 mb-3">
                  <Button
                    onClick={handleSelectAllAttivita}
                    size="sm"
                    variant="outline"
                    className="flex-1 border-green-300 text-green-700 hover:bg-green-50"
                  >
                    ✓ Seleziona tutti
                  </Button>
                  <Button
                    onClick={handleDeselectAllAttivita}
                    size="sm"
                    variant="outline"
                    className="flex-1 border-red-300 text-red-700 hover:bg-red-50"
                  >
                    ✗ Deseleziona tutti
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-2">
                  {Object.entries(POPUP_FIELD_LABELS_ATTIVITA).map(([field, label]) => (
                    <div key={field} className="flex items-center gap-2">
                      <Checkbox
                        id={`popup-attivita-field-${field}`}
                        checked={popupFieldsAttivita.includes(field)}
                        onCheckedChange={() => handleTogglePopupFieldAttivita(field)}
                      />
                      <label
                        htmlFor={`popup-attivita-field-${field}`}
                        className="text-sm text-gray-900 cursor-pointer"
                      >
                        {label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pulsanti Salva/Annulla */}
              <div className="pt-4 border-t border-gray-200 flex gap-2">
                <Button
                  onClick={handleSavePopupConfig}
                  disabled={!hasUnsavedChanges || saving}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Salvataggio...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Salva Configurazione
                    </>
                  )}
                </Button>
                <Button
                  onClick={handleCancelPopupConfig}
                  disabled={!hasUnsavedChanges || saving}
                  variant="outline"
                  className="border-gray-300 text-gray-700"
                >
                  <X className="w-4 h-4 mr-2" />
                  Annulla
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      <ImportGeoJSONModal
        open={showImportModal}
        onOpenChange={setShowImportModal}
        project={project}
        onSuccess={handleImportSuccess}
      />

      <ImportAttivitaModal
        open={showImportAttivitaModal}
        onOpenChange={setShowImportAttivitaModal}
        project={project}
        onSuccess={handleImportAttivitaSuccess}
      />
    </>
  );
}
