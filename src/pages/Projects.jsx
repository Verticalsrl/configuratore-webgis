import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Plus, Loader2, Building2 } from 'lucide-react';
import ProjectCard from '../components/projects/ProjectCard';
import SetupWizard from '../components/webgis/SetupWizard';

export default function Projects() {
  const [user, setUser] = useState(null);
  const [showWizard, setShowWizard] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (error) {
        setUser(null);
      }
    };
    fetchUser();
  }, []);

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: () => base44.entities.Progetto.list('-created_date')
  });

  const deleteProjectMutation = useMutation({
    mutationFn: async (projectId) => {
      const locali = await base44.entities.Locale.filter({ project_id: projectId });
      await Promise.all(locali.map((l) => base44.entities.Locale.delete(l.id)));
      await base44.entities.Progetto.delete(projectId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
    onError: (error) => {
      console.error('Errore durante l\'eliminazione del progetto:', error);
      alert('Errore durante l\'eliminazione del progetto. Riprova.');
    }
  });

  const handleWizardComplete = async (projectData, locali) => {
    const project = await base44.entities.Progetto.create(projectData);
    
    const localiWithProjectId = locali.map((l) => ({
      ...l,
      project_id: project.id
    }));

    await base44.entities.Locale.bulkCreate(localiWithProjectId);
    
    setShowWizard(false);
    queryClient.invalidateQueries({ queryKey: ['projects'] });
  };



  if (showWizard) {
    return (
      <SetupWizard
        onComplete={handleWizardComplete}
        onCancel={() => setShowWizard(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              I Miei Progetti
            </h1>
            <p className="text-gray-600">Gestisci i tuoi progetti WebGIS</p>
          </div>
          {user && (
            <Button
              onClick={() => setShowWizard(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-5 h-5 mr-2" />
              Nuovo Progetto
            </Button>
          )}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-20">
            <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2 text-gray-900">Nessun progetto</h3>
            <p className="text-gray-600 mb-6">Crea il tuo primo progetto per iniziare</p>
            {user && (
              <Button
                onClick={() => setShowWizard(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="w-5 h-5 mr-2" />
                Crea Progetto
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onDelete={() => deleteProjectMutation.mutate(project.id)}
                user={user}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}