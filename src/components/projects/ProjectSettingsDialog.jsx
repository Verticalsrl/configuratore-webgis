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

export default function ProjectSettingsDialog({ open, onOpenChange, project }) {
  const [showImportModal, setShowImportModal] = useState(false);
  const [showImportAttivitaModal, setShowImportAttivitaModal] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState('');
  const [saving, setSaving] = useState(false);
  const queryClient = useQueryClient();

  const { data: locali = [] } = useQuery({
    queryKey: ['locali', project?.id],
    queryFn: () => base44.entities.Locale.filter({ project_id: project.id }),
    enabled: !!project?.id && open
  });

  const popupFields = project?.config?.popup_fields || DEFAULT_POPUP_FIELDS;

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

  const handleTogglePopupField = async (field) => {
    const currentFields = [...popupFields];
    const idx = currentFields.indexOf(field);
    if (idx >= 0) {
      currentFields.splice(idx, 1);
    } else {
      currentFields.push(field);
    }

    const newConfig = { ...(project.config || {}), popup_fields: currentFields };
    await base44.entities.Progetto.update(project.id, { config: newConfig });
    queryClient.invalidateQueries({ queryKey: ['projects'] });
    queryClient.invalidateQueries({ queryKey: ['project', project.id] });
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
                  onClick={() => setShowImportAttivitaModal(true)}
                  variant="outline"
                  className="w-full border-gray-300 hover:bg-gray-50 text-gray-900 justify-start"
                >
                  <Building2 className="w-5 h-5 mr-3" />
                  Importa Attività Commerciali
                </Button>
              </div>

              <div className="pt-4 mt-4 border-t border-gray-200">
                <p className="text-xs text-gray-500 mb-3">
                  Queste azioni sono irreversibili. Procedi con cautela.
                </p>
                <Button
                  onClick={handleClearProject}
                  variant="destructive"
                  className="w-full justify-start"
                >
                  <Trash2 className="w-5 h-5 mr-3" />
                  Svuota Progetto
                </Button>
              </div>
            </TabsContent>

            {/* Popup Config Tab */}
            <TabsContent value="popup" className="space-y-4 mt-4">
              <p className="text-sm text-gray-500">
                Seleziona i campi da mostrare nel popup sulla mappa.
              </p>
              <div className="space-y-3">
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
