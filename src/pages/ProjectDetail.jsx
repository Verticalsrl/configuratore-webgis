import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Loader2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import MapView from '../components/webgis/MapView';

export default function ProjectDetail() {
  const [user, setUser] = useState(null);
  const urlParams = new URLSearchParams(window.location.search);
  const projectId = urlParams.get('id');

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (error) {
        base44.auth.redirectToLogin();
      }
    };
    fetchUser();
  }, []);

  const { data: project, isLoading: projectLoading } = useQuery({
    queryKey: ['project', projectId],
    queryFn: async () => {
      const projects = await base44.entities.Progetto.filter({ id: projectId });
      return projects[0];
    },
    enabled: !!user && !!projectId
  });

  const { data: locali = [], isLoading: localiLoading } = useQuery({
    queryKey: ['locali', projectId],
    queryFn: () => base44.entities.Locale.filter({ project_id: projectId }),
    enabled: !!projectId
  });

  if (!user || projectLoading || localiLoading) {
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

  return <MapView project={project} locali={locali} />;
}