import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader2, ArrowLeft, Download, Upload, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import ImportGeoJSONModal from '../components/projects/ImportGeoJSONModal';
import { useAuth } from '@/lib/AuthContext';

export default function ProjectSettings() {
  const { user, isAuthenticated, navigateToLogin } = useAuth();
  const [showImportModal, setShowImportModal] = useState(false);
  const queryClient = useQueryClient();
  const urlParams = new URLSearchParams(window.location.search);
  const projectId = urlParams.get('id');

  const { data: project, isLoading: projectLoading } = useQuery({
    queryKey: ['project', projectId],
    queryFn: async () => {
      const projects = await base44.entities.Progetto.filter({ id: projectId });
      return projects[0];
    },
    enabled: !!projectId
  });

  const { data: locali = [], isLoading: localiLoading } = useQuery({
    queryKey: ['locali', projectId],
    queryFn: () => base44.entities.Locale.filter({ project_id: projectId }),
    enabled: !!projectId
  });

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
  };

  const handleClearProject = async () => {
    if (!confirm('Sei sicuro di voler svuotare tutti i locali di questo progetto?')) return;
    
    await Promise.all(locali.map((l) => base44.entities.Locale.delete(l.id)));
    queryClient.invalidateQueries({ queryKey: ['locali', projectId] });
  };

  const handleImportSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['locali', projectId] });
    setShowImportModal(false);
  };

  if (!isAuthenticated) {
    navigateToLogin();
    return null;
  }

  if (projectLoading || localiLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Progetto non trovato</h2>
          <Link to={createPageUrl('Projects')}>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Torna ai Progetti
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link to={createPageUrl('ProjectDetail') + '?id=' + projectId}>
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Torna alla Mappa
            </Button>
          </Link>
          <h1 className="text-3xl font-bold mb-2">Impostazioni Progetto</h1>
          <p className="text-slate-400">{project.nome}</p>
        </div>

        <div className="space-y-6">
          {/* Export/Import Section */}
          <div className="bg-slate-800 rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-4">Gestione Dati</h2>
            <div className="space-y-3">
              <Button
                onClick={handleExport}
                variant="outline"
                className="w-full bg-slate-700 border-slate-600 hover:bg-slate-600 text-white justify-start"
              >
                <Download className="w-5 h-5 mr-3" />
                Esporta GeoJSON
              </Button>
              <Button
                onClick={() => setShowImportModal(true)}
                variant="outline"
                className="w-full bg-slate-700 border-slate-600 hover:bg-slate-600 text-white justify-start"
              >
                <Upload className="w-5 h-5 mr-3" />
                Importa GeoJSON
              </Button>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="bg-slate-800 rounded-xl p-6 border border-red-900/50">
            <h2 className="text-xl font-semibold mb-2 text-red-400">Zona Pericolosa</h2>
            <p className="text-slate-400 text-sm mb-4">
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
        </div>

        <ImportGeoJSONModal
          open={showImportModal}
          onOpenChange={setShowImportModal}
          project={project}
          onSuccess={handleImportSuccess}
        />
      </div>
    </div>
  );
}