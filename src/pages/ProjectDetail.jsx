import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Loader2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import MapView from '../components/webgis/MapView';
import { useAuth } from '@/lib/AuthContext';

export default function ProjectDetail() {
  const { user } = useAuth();
  const urlParams = new URLSearchParams(window.location.search);
  const projectId = urlParams.get('id');

  const { data: project, isLoading: projectLoading } = useQuery({
    queryKey: ['project', projectId],
    queryFn: async () => {
      const projects = await base44.entities.Progetto.filter({ id: projectId });
      return projects[0];
    },
    enabled: !!projectId,
    staleTime: 0, // Considera sempre i dati stale per refetch immediato
    gcTime: 0 // Non cachare i dati dopo unmount
  });

  const { data: locali = [], isLoading: localiLoading } = useQuery({
    queryKey: ['locali', projectId],
    queryFn: () => base44.entities.Locale.filter({ project_id: projectId }),
    enabled: !!projectId
  });

  const { data: attivita = [], isLoading: attivitaLoading } = useQuery({
    queryKey: ['attivita', projectId],
    queryFn: async () => {
      try {
        return await base44.entities.AttivitaCommerciale.filter({ project_id: projectId });
      } catch (error) {
        // Se l'entità non esiste ancora, ritorna array vuoto
        console.warn('AttivitaCommerciale entity not found in Base44. Please create it first.');
        return [];
      }
    },
    enabled: !!projectId,
    staleTime: 0, // Forza refetch immediato quando modificate
    gcTime: 0 // Non cachare dopo unmount
  });

  if (projectLoading || localiLoading || attivitaLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4 text-gray-900">Progetto non trovato</h2>
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

  return <MapView project={project} locali={locali} attivita={attivita} user={user} />;
}