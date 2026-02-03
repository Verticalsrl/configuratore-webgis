import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowRight, ArrowLeft, Rocket, Loader2, X } from 'lucide-react';
import StepIndicator from './StepIndicator';
import UploadZone from './UploadZone';
import FieldMapper from './FieldMapper';
import PreviewStats from './PreviewStats';

const STEPS = [
  { id: 'upload', label: 'Carica Dati' },
  { id: 'config', label: 'Configura Campi' },
  { id: 'preview', label: 'Anteprima' }
];

export default function SetupWizard({ onComplete, onCancel }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [loadedFile, setLoadedFile] = useState(null);
  const [projectName, setProjectName] = useState('');
  const [config, setConfig] = useState({
    campo_superficie: '',
    campo_stato: '',
    campo_indirizzo: '',
    campo_canone: '',
    campo_conduttore: '',
    valore_sfitto: 'SFITTO',
    valore_occupato: 'OCCUPATO',
    valore_altri: 'ALTRI'
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [logs, setLogs] = useState([]);

  const addLog = (message, type = 'info') => {
    setLogs((prev) => [...prev, { message, type, time: new Date() }]);
  };

  const calculateStats = () => {
    if (!loadedFile?.data?.features) return { totale: 0, sfitti: 0, occupati: 0, altri: 0 };
    
    const features = loadedFile.data.features;
    let sfitti = 0;
    let occupati = 0;
    let altri = 0;
    
    features.forEach((f) => {
      const props = f.properties || {};
      const statoValue = config.campo_stato && config.campo_stato !== '_none' 
        ? String(props[config.campo_stato] || '').toUpperCase().trim()
        : '';
      
      const valSfitto = (config.valore_sfitto || '').toUpperCase().trim();
      const valOccupato = (config.valore_occupato || '').toUpperCase().trim();
      const valAltri = (config.valore_altri || '').toUpperCase().trim();
      
      if (statoValue === valSfitto) {
        sfitti++;
      } else if (statoValue === valOccupato) {
        occupati++;
      } else if (statoValue === valAltri) {
        altri++;
      } else if (config.campo_stato && config.campo_stato !== '_none') {
        sfitti++;
      }
    });
    
    return {
      totale: features.length,
      sfitti,
      occupati,
      altri
    };
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

  const handleComplete = async () => {
    setIsProcessing(true);
    setLogs([]);
    
    try {
      addLog('Inizio elaborazione dati...', 'info');
      
      const features = loadedFile.data.features;
      const stats = calculateStats();
      
      // Calculate map center
      let allCoords = [];
      features.forEach((f) => {
        const centroid = getCentroid(f.geometry);
        if (centroid) allCoords.push(centroid);
      });
      
      const center = allCoords.length > 0
        ? [
            allCoords.reduce((s, c) => s + c[0], 0) / allCoords.length,
            allCoords.reduce((s, c) => s + c[1], 0) / allCoords.length
          ]
        : [12.4964, 41.9028]; // Default Rome
      
      addLog(`Centro mappa calcolato: [${center[0].toFixed(4)}, ${center[1].toFixed(4)}]`, 'success');
      
      // Process locali
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
          properties_raw: props
        };
      });
      
      addLog(`${locali.length} locali elaborati`, 'success');
      
      const projectData = {
        nome: projectName || 'Nuovo Progetto',
        config,
        center,
        zoom: 14,
        ...stats
      };
      
      addLog('Configurazione completata!', 'success');
      
      setTimeout(() => {
        onComplete(projectData, locali);
      }, 500);
      
    } catch (error) {
      addLog(`Errore: ${error.message}`, 'error');
      setIsProcessing(false);
    }
  };

  const canProceed = () => {
    if (currentStep === 1) return !!loadedFile;
    if (currentStep === 2) return config.campo_stato && config.campo_stato !== '_none';
    return true;
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10 relative">
          {onCancel && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onCancel}
              className="absolute left-0 top-0 text-slate-400 hover:text-white"
            >
              <X className="w-6 h-6" />
            </Button>
          )}
          <h1 className="text-3xl md:text-4xl font-bold mb-3 bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
            Configuratore WebGIS
          </h1>
          <p className="text-slate-400">Visualizza e gestisci i tuoi locali commerciali</p>
        </div>

        <StepIndicator steps={STEPS} currentStep={currentStep} />

        {/* Step 1: Upload */}
        {currentStep === 1 && (
          <div className="bg-slate-800 rounded-2xl p-6 md:p-8">
            <h2 className="text-xl font-semibold mb-2">Carica i tuoi dati</h2>
            <p className="text-slate-400 text-sm mb-6">
              Carica un file GeoJSON contenente i dati dei locali commerciali
            </p>
            
            <div className="mb-6">
              <Label className="text-slate-400 text-sm">Nome Progetto</Label>
              <Input
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="es. Portfolio Commerciale Roma"
                className="mt-2 bg-slate-900 border-slate-600 text-white"
              />
            </div>
            
            <UploadZone
              onFileLoaded={setLoadedFile}
              loadedFile={loadedFile}
              onRemove={() => setLoadedFile(null)}
            />
            
            {loadedFile && (
              <div className="mt-4 p-4 bg-slate-700/30 rounded-lg">
                <p className="text-sm text-slate-300">
                  <strong>Campi trovati:</strong> {loadedFile.fields.join(', ')}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Step 2: Config */}
        {currentStep === 2 && (
          <div className="bg-slate-800 rounded-2xl p-6 md:p-8">
            <h2 className="text-xl font-semibold mb-2">Configura i campi</h2>
            <p className="text-slate-400 text-sm mb-6">
              Mappa i campi del tuo file ai dati dei locali
            </p>
            
            <FieldMapper
              fields={loadedFile?.fields || []}
              config={config}
              onChange={setConfig}
            />
          </div>
        )}

        {/* Step 3: Preview */}
        {currentStep === 3 && (
          <div className="bg-slate-800 rounded-2xl p-6 md:p-8">
            <h2 className="text-xl font-semibold mb-2">Anteprima e conferma</h2>
            <p className="text-slate-400 text-sm mb-6">
              Verifica i dati prima di procedere
            </p>
            
            <PreviewStats stats={calculateStats()} />
            
            {logs.length > 0 && (
              <div className="mt-6 bg-slate-900 rounded-lg p-4 max-h-48 overflow-y-auto font-mono text-sm">
                {logs.map((log, i) => (
                  <div
                    key={i}
                    className={`mb-1 ${
                      log.type === 'success' ? 'text-green-400' :
                      log.type === 'error' ? 'text-red-400' : 'text-blue-400'
                    }`}
                  >
                    {log.message}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between gap-4 mt-6">
          <Button
            variant="outline"
            onClick={() => setCurrentStep((s) => s - 1)}
            disabled={currentStep === 1}
            className="bg-slate-700 border-slate-600 hover:bg-slate-600"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Indietro
          </Button>
          
          {currentStep < 3 ? (
            <Button
              onClick={() => setCurrentStep((s) => s + 1)}
              disabled={!canProceed()}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Avanti
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleComplete}
              disabled={isProcessing}
              className="bg-green-600 hover:bg-green-700"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Elaborazione...
                </>
              ) : (
                <>
                  <Rocket className="w-4 h-4 mr-2" />
                  Avvia Visualizzatore
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}