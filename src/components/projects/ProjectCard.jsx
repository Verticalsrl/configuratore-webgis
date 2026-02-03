import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Calendar, Trash2, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';
import { format } from 'date-fns';
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

export default function ProjectCard({ project, onDelete }) {
  return (
    <Card className="bg-slate-800 border-slate-700 hover:border-blue-500 transition-all">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg text-white">{project.nome}</CardTitle>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-slate-800 border-slate-700">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-white">Svuotare il progetto?</AlertDialogTitle>
                <AlertDialogDescription className="text-slate-400">
                  Questa azione eliminerà tutti i locali associati al progetto.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="bg-slate-700 text-white hover:bg-slate-600">
                  Annulla
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={onDelete}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Svuota
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
        {project.descrizione && (
          <p className="text-sm text-slate-400 mt-2">{project.descrizione}</p>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-2 text-sm">
            <div className="bg-slate-900/50 rounded-lg p-2 text-center">
              <div className="text-slate-400 text-xs">Totale</div>
              <div className="text-white font-semibold">{project.totale_locali || 0}</div>
            </div>
            <div className="bg-red-900/20 rounded-lg p-2 text-center">
              <div className="text-red-400 text-xs">Sfitti</div>
              <div className="text-white font-semibold">{project.totale_sfitti || 0}</div>
            </div>
            <div className="bg-green-900/20 rounded-lg p-2 text-center">
              <div className="text-green-400 text-xs">Occupati</div>
              <div className="text-white font-semibold">{project.totale_occupati || 0}</div>
            </div>
          </div>

          {project.totale_altri > 0 && (
            <div className="bg-yellow-900/20 rounded-lg p-2 text-center text-sm">
              <span className="text-yellow-400">Altri: </span>
              <span className="text-white font-semibold">{project.totale_altri}</span>
            </div>
          )}

          <div className="flex items-center text-xs text-slate-400 gap-2">
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
  );
}