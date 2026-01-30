import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import SetupWizard from '@/components/webgis/SetupWizard';
import MapView from '@/components/webgis/MapView';
import { Loader2 } from 'lucide-react';

export default function Home() {
  const [view, setView] = useState('loading'); // loading, setup, map
  const [project, setProject] = useState(null);
  const [locali, setLocali] = useState([]);

  useEffect(() => {
    loadExistingProject();
  }, []);

  const loadExistingProject = async () => {
    try {
      const projects = await base44.entities.Progetto.list('-created_date', 1);
      
      if (projects && projects.length > 0) {
        const lastProject = projects[0];
        const projectLocali = await base44.entities.Locale.filter(
          { project_id: lastProject.id },
          '-created_date'
        );
        
        setProject(lastProject);
        setLocali(projectLocali);
        setView('map');
      } else {
        setView('setup');
      }
    } catch (error) {
      console.error('Error loading project:', error);
      setView('setup');
    }
  };

  const handleWizardComplete = async (projectData, localiData) => {
    try {
      // Create project
      const newProject = await base44.entities.Progetto.create({
        nome: projectData.nome,
        config: projectData.config,
        center: projectData.center,
        zoom: projectData.zoom,
        totale_locali: projectData.totale,
        totale_sfitti: projectData.sfitti,
        totale_occupati: projectData.occupati
      });

      // Create locali in batches
      const batchSize = 50;
      const batches = [];
      for (let i = 0; i < localiData.length; i += batchSize) {
        batches.push(localiData.slice(i, i + batchSize));
      }

      const createdLocali = [];
      for (const batch of batches) {
        const batchWithProjectId = batch.map((l) => ({
          ...l,
          project_id: newProject.id
        }));
        const created = await base44.entities.Locale.bulkCreate(batchWithProjectId);
        createdLocali.push(...created);
      }

      setProject(newProject);
      setLocali(createdLocali);
      setView('map');
    } catch (error) {
      console.error('Error creating project:', error);
      alert('Errore durante il salvataggio: ' + error.message);
    }
  };

  const handleReset = async () => {
    const confirmed = window.confirm('Vuoi davvero creare un nuovo progetto? I dati attuali non verranno eliminati.');
    if (confirmed) {
      setProject(null);
      setLocali([]);
      setView('setup');
    }
  };

  if (view === 'loading') {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Caricamento...</p>
        </div>
      </div>
    );
  }

  if (view === 'setup') {
    return <SetupWizard onComplete={handleWizardComplete} />;
  }

  return (
    <MapView 
      project={project} 
      locali={locali} 
      onReset={handleReset}
    />
  );
}