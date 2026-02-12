import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Trash2, Eye, Settings, Building2, Store, ChevronDown, ChevronUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';
import { format } from 'date-fns';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import ProjectSettingsDialog from './ProjectSettingsDialog';

export default function ProjectCard({ project, onDelete, user }) {
  const [showSettings, setShowSettings] = useState(false);
  const [showAttivita, setShowAttivita] = useState(false);

  const { data: locali = [] } = useQuery({
    queryKey: ['locali', project.id],
    queryFn: () => base44.entities.Locale.filter({ project_id: project.id }),
    staleTime: 60000,
  });

  const { data: attivita = [] } = useQuery({
    queryKey: ['attivita', project.id],
    queryFn: async () => {
      try {
        return await base44.entities.AttivitaCommerciale.filter({ project_id: project.id });
      } catch {
        return [];
      }
    },
    staleTime: 60000,
  });

  const stats = useMemo(() => ({
    totale: locali.length,
    sfitti: locali.filter(l => l.stato === 'sfitto').length,
    occupati: locali.filter(l => l.stato === 'occupato').length,
    altri: locali.filter(l => l.stato === 'altri').length,
  }), [locali]);

  // Raggruppa attività per mestiere
  const attivitaPerMestiere = useMemo(() => {
    const grouped = {};
    attivita.forEach(att => {
      const mestiere = att.descrizione_mestiere?.trim()
        || att.properties_raw?.DESC_MESTIERE?.trim()
        || att.properties_raw?.DES_MESTIERE?.trim()
        || att.mestiere?.trim()
        || 'Altro';
      if (!grouped[mestiere]) grouped[mestiere] = [];
      grouped[mestiere].push(att);
    });
    return Object.entries(grouped).sort((a, b) => a[0].localeCompare(b[0]));
  }, [attivita]);

  const handleDelete = () => {
    onDelete();
  };

  return (
    <>
      <Card className="bg-white border-gray-200 hover:border-blue-500 transition-all shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <CardTitle className="text-lg text-gray-900">{project.nome}</CardTitle>
            {user && (
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-gray-500 hover:text-blue-600 hover:bg-blue-50"
                  onClick={() => setShowSettings(true)}
                >
                  <Settings className="w-4 h-4" />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-500 hover:text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="bg-white border-gray-200">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-gray-900">Eliminare il progetto?</AlertDialogTitle>
                      <AlertDialogDescription className="text-gray-600">
                        Questa azione eliminerà definitivamente il progetto e tutti i locali associati.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="bg-gray-100 text-gray-900 hover:bg-gray-200 border-gray-300">
                        Annulla
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDelete}
                        className="bg-red-600 hover:bg-red-700 text-white"
                      >
                        Elimina
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            )}
          </div>
          {project.descrizione && (
            <p className="text-sm text-gray-600 mt-2">{project.descrizione}</p>
          )}
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-2 text-sm">
              <div className="bg-gray-50 rounded-lg p-2 text-center border border-gray-200">
                <div className="text-gray-600 text-xs">Totale</div>
                <div className="text-gray-900 font-semibold">{stats.totale}</div>
              </div>
              <div className="bg-red-50 rounded-lg p-2 text-center border border-red-200">
                <div className="text-red-600 text-xs">Sfitti</div>
                <div className="text-gray-900 font-semibold">{stats.sfitti}</div>
              </div>
              <div className="bg-green-50 rounded-lg p-2 text-center border border-green-200">
                <div className="text-green-600 text-xs">Occupati</div>
                <div className="text-gray-900 font-semibold">{stats.occupati}</div>
              </div>
            </div>

            {stats.altri > 0 && (
              <div className="bg-yellow-50 rounded-lg p-2 text-center text-sm border border-yellow-200">
                <span className="text-yellow-600">Altri: </span>
                <span className="text-gray-900 font-semibold">{stats.altri}</span>
              </div>
            )}

            {/* Attività Commerciali */}
            {attivita.length > 0 && (
              <div className="border border-blue-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => setShowAttivita(!showAttivita)}
                  className="w-full flex items-center justify-between bg-blue-50 px-3 py-2 text-sm hover:bg-blue-100 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Store className="w-4 h-4 text-blue-600" />
                    <span className="font-medium text-blue-800">
                      Attività Commerciali ({attivita.length})
                    </span>
                  </div>
                  {showAttivita
                    ? <ChevronUp className="w-4 h-4 text-blue-600" />
                    : <ChevronDown className="w-4 h-4 text-blue-600" />
                  }
                </button>
                {showAttivita && (
                  <div className="max-h-60 overflow-y-auto">
                    {attivitaPerMestiere.map(([mestiere, lista]) => (
                      <div key={mestiere}>
                        <div className="px-3 py-1.5 bg-gray-50 text-xs font-semibold text-gray-600 uppercase tracking-wide border-t border-gray-200">
                          {mestiere} ({lista.length})
                        </div>
                        {lista.map(att => (
                          <div key={att.id} className="px-3 py-2 border-t border-gray-100 text-sm flex items-start gap-2">
                            <span className="w-2 h-2 rounded-full bg-blue-400 mt-1.5 flex-shrink-0" />
                            <div className="min-w-0">
                              <div className="text-gray-900 font-medium truncate">
                                {att.ragione_sociale || 'N/D'}
                              </div>
                              {(att.strada || att.comune) && (
                                <div className="text-gray-500 text-xs truncate">
                                  {[att.strada, att.civico].filter(Boolean).join(' ')}
                                  {att.strada && att.comune ? ' - ' : ''}
                                  {att.comune}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center text-xs text-gray-500 gap-2">
              <Calendar className="w-3 h-3" />
              {format(new Date(project.created_date), 'dd/MM/yyyy')}
            </div>

            <Link to={createPageUrl('ProjectDetail') + '?id=' + project.id}>
              <Button className="w-full bg-blue-600 hover:bg-blue-700">
                <Eye className="w-4 h-4 mr-2" />
                Visualizza Mappa
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {user && (
        <ProjectSettingsDialog
          open={showSettings}
          onOpenChange={setShowSettings}
          project={project}
        />
      )}
    </>
  );
}
