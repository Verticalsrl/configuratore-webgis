import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Upload, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function ImportGeoJSONModal({ open, onOpenChange, project, onSuccess }) {
  const [file, setFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setResult(null);
    }
  };

  const getCentroid = (geometry) => {
    if (!geometry) return null;
    
    if (geometry.type === 'Point') {
      return geometry.coordinates;
    }
    
    if (geometry.type === 'Polygon') {
      const coords = geometry.coordinates[0];
      let sumLng = 0, sumLat = 0;
      coords.forEach(([lng, lat]) => {
        sumLng += lng;
        sumLat += lat;
      });
      return [sumLng / coords.length, sumLat / coords.length];
    }
    
    if (geometry.type === 'MultiPolygon') {
      const firstPolygon = geometry.coordinates[0][0];
      let sumLng = 0, sumLat = 0;
      firstPolygon.forEach(([lng, lat]) => {
        sumLng += lng;
        sumLat += lat;
      });
      return [sumLng / firstPolygon.length, sumLat / firstPolygon.length];
    }
    
    return null;
  };

  const handleImport = async () => {
    if (!file) return;

    setIsProcessing(true);
    setResult(null);

    try {
      const text = await file.text();
      const geojson = JSON.parse(text);

      if (!geojson.features || !Array.isArray(geojson.features)) {
        throw new Error('GeoJSON non valido');
      }

      const config = project.config || {};
      const features = geojson.features;

      // Recupera locali esistenti
      const existingLocali = await base44.entities.Locale.filter({ project_id: project.id });
      
      const locali = features.map((f, index) => {
        const props = f.properties || {};
        const centroid = getCentroid(f.geometry);
        
        const statoValue = config.campo_stato && config.campo_stato !== '_none'
          ? String(props[config.campo_stato] || '').toUpperCase().trim()
          : '';
        
        const valSfitto = (config.valore_sfitto || '').toUpperCase().trim();
        const valOccupato = (config.valore_occupato || '').toUpperCase().trim();
        const valAltri = (config.valore_altri || '').toUpperCase().trim();
        
        let stato = 'sfitto';
        if (statoValue === valOccupato) {
          stato = 'occupato';
        } else if (statoValue === valAltri) {
          stato = 'altri';
        }
        
        return {
          indirizzo: config.campo_indirizzo && config.campo_indirizzo !== '_none' 
            ? props[config.campo_indirizzo] || `Locale ${index + 1}`
            : `Locale ${index + 1}`,
          superficie: config.campo_superficie && config.campo_superficie !== '_none'
            ? parseFloat(props[config.campo_superficie]) || 0
            : 0,
          stato,
          canone: config.campo_canone && config.campo_canone !== '_none'
            ? parseFloat(props[config.campo_canone]) || 0
            : 0,
          conduttore: config.campo_conduttore && config.campo_conduttore !== '_none'
            ? props[config.campo_conduttore] || ''
            : '',
          coordinates: centroid,
          geometry: f.geometry,
          properties_raw: props,
          project_id: project.id
        };
      });

      // Elimina tutti i locali esistenti
      await Promise.all(existingLocali.map((l) => base44.entities.Locale.delete(l.id)));

      // Crea i nuovi locali
      await base44.entities.Locale.bulkCreate(locali);

      // Aggiorna le statistiche del progetto
      const stats = {
        totale_locali: locali.length,
        totale_sfitti: locali.filter((l) => l.stato === 'sfitto').length,
        totale_occupati: locali.filter((l) => l.stato === 'occupato').length,
        totale_altri: locali.filter((l) => l.stato === 'altri').length
      };

      await base44.entities.Progetto.update(project.id, stats);

      setResult({
        success: true,
        message: `Importati ${locali.length} locali con successo`,
        stats
      });

      setTimeout(() => {
        onSuccess();
        onOpenChange(false);
      }, 2000);

    } catch (error) {
      setResult({
        success: false,
        message: `Errore: ${error.message}`
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-800 border-slate-700 text-white">
        <DialogHeader>
          <DialogTitle>Importa GeoJSON</DialogTitle>
          <DialogDescription className="text-slate-400">
            Carica un nuovo file GeoJSON per aggiornare tutti i locali del progetto.
            I locali esistenti verranno sostituiti.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="border-2 border-dashed border-slate-600 rounded-lg p-6 text-center">
            <input
              type="file"
              accept=".geojson,.json"
              onChange={handleFileChange}
              className="hidden"
              id="geojson-upload"
            />
            <label htmlFor="geojson-upload" className="cursor-pointer">
              <Upload className="w-12 h-12 text-slate-400 mx-auto mb-3" />
              <p className="text-sm text-slate-300 mb-1">
                {file ? file.name : 'Clicca per selezionare il file GeoJSON'}
              </p>
              <p className="text-xs text-slate-500">Formato: .geojson o .json</p>
            </label>
          </div>

          {result && (
            <div className={`p-4 rounded-lg flex items-start gap-3 ${
              result.success ? 'bg-green-900/20 text-green-400' : 'bg-red-900/20 text-red-400'
            }`}>
              {result.success ? (
                <CheckCircle className="w-5 h-5 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
              )}
              <div className="text-sm">
                <p className="font-medium">{result.message}</p>
                {result.stats && (
                  <p className="text-xs mt-1 opacity-80">
                    Sfitti: {result.stats.totale_sfitti} | 
                    Occupati: {result.stats.totale_occupati} | 
                    Altri: {result.stats.totale_altri}
                  </p>
                )}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isProcessing}
              className="bg-slate-700 border-slate-600 hover:bg-slate-600"
            >
              Annulla
            </Button>
            <Button
              onClick={handleImport}
              disabled={!file || isProcessing}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Importazione...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Importa
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}