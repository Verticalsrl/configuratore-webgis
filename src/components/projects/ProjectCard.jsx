import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Trash2, Eye, Settings, Building2 } from 'lucide-react';
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

  const { data: locali = [] } = useQuery({
    queryKey: ['locali', project.id],
    queryFn: () => base44.entities.Locale.filter({ project_id: project.id }),
    staleTime: 60000,
  });

  const stats = useMemo(() => ({
    totale: locali.length,
    sfitti: locali.filter(l => l.stato === 'sfitto').length,
    occupati: locali.filter(l => l.stato === 'occupato').length,
    altri: locali.filter(l => l.stato === 'altri').length,
  }), [locali]);

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
