import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Upload, Loader2, CheckCircle, AlertCircle, ChevronRight, ChevronLeft } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import FieldMapperAttivita from '@/components/webgis/FieldMapperAttivita';

const STEPS = {
  UPLOAD: 'upload',
  CONFIG: 'config',
  PREVIEW: 'preview',
  RESULT: 'result'
};

export default function ImportAttivitaModal({ open, onOpenChange, project, onSuccess }) {
  const [currentStep, setCurrentStep] = useState(STEPS.UPLOAD);
  const [file, setFile] = useState(null);
  const [geojson, setGeojson] = useState(null);
  const [availableFields, setAvailableFields] = useState([]);
  const [config, setConfig] = useState({});
  const [previewData, setPreviewData] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      processFile(selectedFile);
    }
  };

  const processFile = async (file) => {
    try {
      const text = await file.text();
      const data = JSON.parse(text);

      if (!data.features || !Array.isArray(data.features)) {
        throw new Error('GeoJSON non valido: manca l\'array features');
      }

      setGeojson(data);

      // Estrai i nomi dei campi dal primo feature
      if (data.features.length > 0) {
        const firstProps = data.features[0].properties || {};
        const fields = Object.keys(firstProps);
        setAvailableFields(fields);

        // Prova a mappare automaticamente i campi standard
        const autoConfig = {};
        fields.forEach(field => {
          const upperField = field.toUpperCase();
          if (upperField === 'ID') autoConfig.campo_id = field;
          if (upperField === 'STRADA' || upperField === 'VIA') autoConfig.campo_strada = field;
          if (upperField === 'CIVICO') autoConfig.campo_civico = field;
          if (upperField === 'FRAZIONE') autoConfig.campo_frazione = field;
          if (upperField === 'COMUNE') autoConfig.campo_comune = field;
          if (upperField === 'CAP') autoConfig.campo_cap = field;
          if (upperField === 'PROVINCIA' || upperField === 'PROV') autoConfig.campo_provincia = field;
          if (upperField === 'REGIONE') autoConfig.campo_regione = field;
          if (upperField === 'LATITUDINE' || upperField === 'LAT') autoConfig.campo_latitudine = field;
          if (upperField === 'LONGITUDINE' || upperField === 'LON' || upperField === 'LNG') autoConfig.campo_longitudine = field;
          if (upperField === 'CODICE_FISCALE' || upperField === 'CF') autoConfig.campo_codice_fiscale = field;
          if (upperField === 'PROV_SEDE_LEGALE') autoConfig.campo_prov_sede_legale = field;
          if (upperField === 'RAGIONE_SOCIALE') autoConfig.campo_ragione_sociale = field;
          if (upperField === 'PARTITA_IVA' || upperField === 'PIVA') autoConfig.campo_partita_iva = field;
          if (upperField === 'NATURA_GIURIDICA') autoConfig.campo_natura_giuridica = field;
          if (upperField === 'PMI') autoConfig.campo_pmi = field;
          if (upperField === 'MESTIERE') autoConfig.campo_mestiere = field;
          if (upperField === 'DESCRIZIONE_MESTIERE' || upperField === 'DESC_MESTIERE' || upperField === 'DES_MESTIERE') autoConfig.campo_descrizione_mestiere = field;
          if (upperField === 'ATECO2025' || upperField === 'ATECO') autoConfig.campo_ateco = field;
          if (upperField === 'DESCRIZIONE' || upperField === 'DESCRIZIONE_ATECO' || upperField === 'DESC_ATECO') autoConfig.campo_descrizione_ateco = field;
        });
        setConfig(autoConfig);
      }

      setCurrentStep(STEPS.CONFIG);
    } catch (error) {
      alert(`Errore nel caricamento del file: ${error.message}`);
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

  const handleConfigNext = () => {
    // Genera preview dei dati
    const preview = geojson.features.slice(0, 5).map((feature, index) => {
      const props = feature.properties || {};
      return transformFeatureToAttivita(feature, index, props);
    });
    setPreviewData(preview);
    setCurrentStep(STEPS.PREVIEW);
  };

  const transformFeatureToAttivita = (feature, index, props) => {
    const geometry = feature.geometry;
    let coordinates = null;

    // Usa latitudine/longitudine se mappati
    if (config.campo_latitudine && config.campo_longitudine &&
        config.campo_latitudine !== '_none' && config.campo_longitudine !== '_none') {
      const lat = parseFloat(props[config.campo_latitudine]);
      const lng = parseFloat(props[config.campo_longitudine]);
      if (!isNaN(lat) && !isNaN(lng)) {
        coordinates = [lng, lat];
      }
    }

    // Altrimenti calcola il centroide dalla geometria
    if (!coordinates) {
      coordinates = getCentroid(geometry);
    }

    const getValue = (configKey) => {
      if (!config[configKey] || config[configKey] === '_none') return '';
      return props[config[configKey]] || '';
    };

    return {
      project_id: project.id,
      // Dati anagrafici
      ragione_sociale: getValue('campo_ragione_sociale'),
      partita_iva: getValue('campo_partita_iva'),
      codice_fiscale: getValue('campo_codice_fiscale'),
      natura_giuridica: getValue('campo_natura_giuridica'),
      pmi: getValue('campo_pmi'),
      // Attività
      mestiere: getValue('campo_mestiere'),
      descrizione_mestiere: getValue('campo_descrizione_mestiere'),
      ateco2025: getValue('campo_ateco'),
      descrizione_ateco: getValue('campo_descrizione_ateco'),
      // Indirizzo
      strada: getValue('campo_strada'),
      civico: getValue('campo_civico'),
      frazione: getValue('campo_frazione'),
      comune: getValue('campo_comune'),
      cap: getValue('campo_cap'),
      provincia: getValue('campo_provincia'),
      regione: getValue('campo_regione'),
      prov_sede_legale: getValue('campo_prov_sede_legale'),
      // Coordinate
      latitudine: config.campo_latitudine && config.campo_latitudine !== '_none'
        ? parseFloat(props[config.campo_latitudine]) || null
        : null,
      longitudine: config.campo_longitudine && config.campo_longitudine !== '_none'
        ? parseFloat(props[config.campo_longitudine]) || null
        : null,
      coordinates,
      geometry,
      // Metadata
      properties_raw: props
    };
  };

  const handleImport = async () => {
    setIsProcessing(true);
    setCurrentStep(STEPS.RESULT);

    try {
      // Recupera attività esistenti per questo progetto
      const existingAttivita = await base44.entities.AttivitaCommerciale.filter({
        project_id: project.id
      });

      // Trasforma tutte le features
      const attivita = geojson.features.map((feature, index) => {
        const props = feature.properties || {};
        return transformFeatureToAttivita(feature, index, props);
      });

      // Elimina tutte le attività esistenti
      if (existingAttivita.length > 0) {
        await Promise.all(existingAttivita.map((a) => base44.entities.AttivitaCommerciale.delete(a.id)));
      }

      // Crea le nuove attività
      await base44.entities.AttivitaCommerciale.bulkCreate(attivita);

      // Salva la configurazione nel progetto (opzionale, per future re-importazioni)
      await base44.entities.Progetto.update(project.id, {
        config_attivita: config
      });

      setResult({
        success: true,
        message: `Importate ${attivita.length} attività commerciali con successo`,
        count: attivita.length
      });

      setTimeout(() => {
        onSuccess();
        onOpenChange(false);
        resetState();
      }, 2000);

    } catch (error) {
      const isEntityMissing = error.message?.includes('not found') || error.message?.includes('entity');
      setResult({
        success: false,
        message: isEntityMissing
          ? `L'entità AttivitaCommerciale non esiste nel database Base44. Per favore, crea prima l'entità seguendo le istruzioni in docs/schema-attivita-commerciali.md`
          : `Errore: ${error.message}`
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const resetState = () => {
    setCurrentStep(STEPS.UPLOAD);
    setFile(null);
    setGeojson(null);
    setAvailableFields([]);
    setConfig({});
    setPreviewData([]);
    setResult(null);
  };

  const renderUploadStep = () => (
    <div className="space-y-4">
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
        <input
          type="file"
          accept=".geojson,.json"
          onChange={handleFileChange}
          className="hidden"
          id="attivita-upload"
        />
        <label htmlFor="attivita-upload" className="cursor-pointer">
          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-sm text-gray-600 mb-1">
            {file ? file.name : 'Clicca per selezionare il file GeoJSON'}
          </p>
          <p className="text-xs text-gray-400">Formato: .geojson o .json</p>
        </label>
      </div>
    </div>
  );

  const renderConfigStep = () => (
    <div className="space-y-4">
      <div className="max-h-[500px] overflow-y-auto pr-2">
        <FieldMapperAttivita
          fields={availableFields}
          config={config}
          onChange={setConfig}
        />
      </div>
      <div className="flex justify-between pt-4 border-t">
        <Button
          variant="outline"
          onClick={() => setCurrentStep(STEPS.UPLOAD)}
          className="border-gray-300 hover:bg-gray-50"
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Indietro
        </Button>
        <Button
          onClick={handleConfigNext}
          className="bg-blue-600 hover:bg-blue-700"
        >
          Avanti
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );

  const renderPreviewStep = () => (
    <div className="space-y-4">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-700">
          <strong>Anteprima:</strong> Prime {previewData.length} attività su {geojson?.features.length || 0} totali
        </p>
      </div>

      <div className="max-h-[400px] overflow-y-auto">
        {previewData.map((attivita, idx) => (
          <div key={idx} className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="grid grid-cols-2 gap-2 text-sm">
              {attivita.ragione_sociale && (
                <div><strong>Ragione Sociale:</strong> {attivita.ragione_sociale}</div>
              )}
              {attivita.partita_iva && (
                <div><strong>P.IVA:</strong> {attivita.partita_iva}</div>
              )}
              {attivita.mestiere && (
                <div><strong>Mestiere:</strong> {attivita.mestiere}</div>
              )}
              {attivita.ateco2025 && (
                <div><strong>ATECO:</strong> {attivita.ateco2025}</div>
              )}
              {attivita.strada && (
                <div><strong>Indirizzo:</strong> {attivita.strada} {attivita.civico}</div>
              )}
              {attivita.comune && (
                <div><strong>Comune:</strong> {attivita.comune}</div>
              )}
              {attivita.coordinates && (
                <div className="col-span-2">
                  <strong>Coordinate:</strong> {attivita.coordinates[1].toFixed(6)}, {attivita.coordinates[0].toFixed(6)}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-between pt-4 border-t">
        <Button
          variant="outline"
          onClick={() => setCurrentStep(STEPS.CONFIG)}
          className="border-gray-300 hover:bg-gray-50"
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Indietro
        </Button>
        <Button
          onClick={handleImport}
          className="bg-green-600 hover:bg-green-700"
        >
          <CheckCircle className="w-4 h-4 mr-2" />
          Conferma Import
        </Button>
      </div>
    </div>
  );

  const renderResultStep = () => (
    <div className="space-y-4">
      {isProcessing ? (
        <div className="text-center py-8">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Importazione in corso...</p>
        </div>
      ) : result ? (
        <div className={`p-6 rounded-lg flex items-start gap-3 ${
          result.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
        }`}>
          {result.success ? (
            <CheckCircle className="w-6 h-6 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-6 h-6 flex-shrink-0" />
          )}
          <div>
            <p className="font-medium text-lg">{result.message}</p>
            {result.count && (
              <p className="text-sm mt-1 opacity-80">
                Totale attività: {result.count}
              </p>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );

  const getStepTitle = () => {
    switch (currentStep) {
      case STEPS.UPLOAD: return '1. Carica File';
      case STEPS.CONFIG: return '2. Configura Campi';
      case STEPS.PREVIEW: return '3. Anteprima';
      case STEPS.RESULT: return 'Risultato';
      default: return '';
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) resetState();
      onOpenChange(isOpen);
    }}>
      <DialogContent className="bg-white border-gray-200 text-gray-900 max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-gray-900">
            Importa Attività Commerciali - {getStepTitle()}
          </DialogTitle>
          <DialogDescription className="text-gray-500">
            Wizard guidato per l'importazione delle attività commerciali da file GeoJSON
          </DialogDescription>
        </DialogHeader>

        {currentStep === STEPS.UPLOAD && renderUploadStep()}
        {currentStep === STEPS.CONFIG && renderConfigStep()}
        {currentStep === STEPS.PREVIEW && renderPreviewStep()}
        {currentStep === STEPS.RESULT && renderResultStep()}
      </DialogContent>
    </Dialog>
  );
}
