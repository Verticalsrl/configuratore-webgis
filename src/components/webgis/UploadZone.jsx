import React, { useState, useRef } from 'react';
import { Upload, FileJson, X, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function UploadZone({ onFileLoaded, loadedFile, onRemove }) {
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragIn = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragOut = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      processFile(files[0]);
    }
  };

  const handleFileSelect = (e) => {
    const files = e.target.files;
    if (files && files[0]) {
      processFile(files[0]);
    }
  };

  const processFile = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target.result;
        const geojson = JSON.parse(content);
        
        if (!geojson.features || !Array.isArray(geojson.features)) {
          throw new Error('File GeoJSON non valido');
        }
        
        onFileLoaded({
          name: file.name,
          size: file.size,
          data: geojson,
          featureCount: geojson.features.length,
          fields: geojson.features[0]?.properties ? Object.keys(geojson.features[0].properties) : []
        });
      } catch (err) {
        alert('Errore nel parsing del file: ' + err.message);
      }
    };
    reader.readAsText(file);
  };

  const formatSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div>
      <div
        onClick={() => !loadedFile && inputRef.current?.click()}
        onDragEnter={handleDragIn}
        onDragLeave={handleDragOut}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={cn(
          "border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all duration-300",
          isDragOver && "border-blue-500 bg-blue-500/10",
          loadedFile && "border-green-500 bg-green-500/10 cursor-default",
          !isDragOver && !loadedFile && "border-slate-600 hover:border-blue-500 hover:bg-blue-500/5"
        )}
      >
        {loadedFile ? (
          <CheckCircle className="w-12 h-12 mx-auto mb-3 text-green-500" />
        ) : (
          <Upload className="w-12 h-12 mx-auto mb-3 text-slate-500" />
        )}
        <h3 className="text-lg font-medium mb-1">
          {loadedFile ? 'File caricato con successo!' : 'Trascina qui il tuo file GeoJSON'}
        </h3>
        <span className="text-sm text-slate-500">
          {loadedFile ? `${loadedFile.featureCount} elementi trovati` : 'oppure clicca per selezionare'}
        </span>
        <input
          ref={inputRef}
          type="file"
          accept=".geojson,.json"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {loadedFile && (
        <div className="mt-4 bg-slate-700/50 rounded-lg p-4 flex items-center gap-3">
          <FileJson className="w-5 h-5 text-green-500 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium truncate">{loadedFile.name}</div>
            <div className="text-xs text-slate-400">{formatSize(loadedFile.size)}</div>
          </div>
          <button
            onClick={onRemove}
            className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}