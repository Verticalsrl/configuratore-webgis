import React, { useRef, useState, useMemo, useCallback } from 'react';
import { MapContainer, TileLayer, GeoJSON, Marker, Popup, useMap, LayersControl } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import MapSidebar from './MapSidebar';
import MapLegend from './MapLegend';
import LocalePopup from './LocalePopup';
import AttivitaPopup from './AttivitaPopup';
import StreetViewPanel from './StreetViewPanel';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';

// Fix for default marker icons in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom marker icons
const createCustomIcon = (color) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="background-color: ${color}; width: 16px; height: 16px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });
};

const sfittoIcon = createCustomIcon('#f87171');
const occupatoIcon = createCustomIcon('#4ade80');
const altriIcon = createCustomIcon('#eab308');
const attivitaIcon = createCustomIcon('#3b82f6'); // Blue icon for attività

function MapUpdater({ locali }) {
  const map = useMap();

  React.useEffect(() => {
    if (locali.length === 0) return;

    const points = [];
    locali.forEach(l => {
      if (l.geometry?.type === 'Point' && l.coordinates) {
        points.push([l.coordinates[1], l.coordinates[0]]);
      } else if (l.geometry?.type === 'Polygon' && l.geometry.coordinates?.[0]) {
        l.geometry.coordinates[0].forEach(coord => {
          points.push([coord[1], coord[0]]);
        });
      } else if (l.geometry?.type === 'MultiPolygon' && l.geometry.coordinates) {
        l.geometry.coordinates.forEach(polygon => {
          polygon[0].forEach(coord => {
            points.push([coord[1], coord[0]]);
          });
        });
      }
    });

    if (points.length > 0) {
      const bounds = L.latLngBounds(points);
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [locali, map]);

  return null;
}

function getLocaleCenter(locale) {
  if (locale.coordinates) {
    return [locale.coordinates[1], locale.coordinates[0]];
  }
  if (locale.geometry?.type === 'Point' && locale.geometry.coordinates) {
    return [locale.geometry.coordinates[1], locale.geometry.coordinates[0]];
  }
  if (locale.geometry?.type === 'Polygon' && locale.geometry.coordinates?.[0]) {
    const coords = locale.geometry.coordinates[0];
    let sumLat = 0, sumLng = 0;
    coords.forEach(c => { sumLat += c[1]; sumLng += c[0]; });
    return [sumLat / coords.length, sumLng / coords.length];
  }
  if (locale.geometry?.type === 'MultiPolygon' && locale.geometry.coordinates?.[0]?.[0]) {
    const coords = locale.geometry.coordinates[0][0];
    let sumLat = 0, sumLng = 0;
    coords.forEach(c => { sumLat += c[1]; sumLng += c[0]; });
    return [sumLat / coords.length, sumLng / coords.length];
  }
  return null;
}

function BoundsTracker({ onBoundsChange }) {
  const map = useMap();

  React.useEffect(() => {
    const updateBounds = () => {
      onBoundsChange(map.getBounds());
    };
    map.on('moveend', updateBounds);
    map.on('zoomend', updateBounds);
    // Fire initial bounds
    setTimeout(updateBounds, 200);
    return () => {
      map.off('moveend', updateBounds);
      map.off('zoomend', updateBounds);
    };
  }, [map, onBoundsChange]);

  return null;
}

export default function MapView({ project, locali, attivita = [], user }) {
  const [selectedLocale, setSelectedLocale] = useState(null);
  const [mapBounds, setMapBounds] = useState(null);
  const queryClient = useQueryClient();

  const handleBoundsChange = useCallback((bounds) => {
    setMapBounds(bounds);
  }, []);

  const [filters, setFilters] = useState({
    showSfitti: true,
    showOccupati: true,
    showAltri: true,
    showAttivita: true,
    metieriSelezionati: [], // Array di mestieri selezionati, vuoto = tutti
    search: '',
    minSuperficie: '',
    maxSuperficie: '',
    foglioSearch: '',
    particellaSearch: ''
  });

  const popupFields = project?.config?.popup_fields || ['indirizzo', 'superficie', 'canone', 'conduttore', 'stato'];
  const popupFieldsAttivita = project?.config?.popup_fields_attivita || [
    'ragione_sociale', 'mestiere', 'ateco2025', 'indirizzo',
    'comune', 'partita_iva', 'codice_fiscale'
  ];

  const handleUpdateLocale = useCallback(async (localeId, data) => {
    await base44.entities.Locale.update(localeId, data);
    queryClient.invalidateQueries({ queryKey: ['locali', project?.id] });
  }, [project?.id, queryClient]);

  const handleUpdateAttivita = useCallback(async (attivitaId, data) => {
    try {
      await base44.entities.AttivitaCommerciale.update(attivitaId, data);
      // Invalida e forza refetch immediato
      await queryClient.invalidateQueries({ queryKey: ['attivita', project?.id] });
      await queryClient.refetchQueries({ queryKey: ['attivita', project?.id] });
    } catch (error) {
      console.error('Errore aggiornamento attività:', error);
      alert(`Errore nel salvataggio: ${error.message}`);
      throw error; // Rilancia per gestione in AttivitaPopup
    }
  }, [project?.id, queryClient]);

  const handleDeleteLocale = useCallback(async (localeId) => {
    try {
      await base44.entities.Locale.delete(localeId);
      setSelectedLocale(null); // Chiudi il popup
      queryClient.invalidateQueries({ queryKey: ['locali', project?.id] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      alert('Locale eliminato con successo');
    } catch (error) {
      console.error('Errore eliminazione locale:', error);
      alert(`Errore nell'eliminazione: ${error.message}`);
      throw error;
    }
  }, [project?.id, queryClient]);

  const handleDeleteAttivita = useCallback(async (attivitaId) => {
    try {
      await base44.entities.AttivitaCommerciale.delete(attivitaId);
      // Il popup si chiude automaticamente quando il marker viene rimosso
      await queryClient.invalidateQueries({ queryKey: ['attivita', project?.id] });
      await queryClient.refetchQueries({ queryKey: ['attivita', project?.id] });
      alert('Attività eliminata con successo');
    } catch (error) {
      console.error('Errore eliminazione attività:', error);
      alert(`Errore nell'eliminazione: ${error.message}`);
      throw error;
    }
  }, [project?.id, queryClient]);

  // Calcola lista mestieri unici dalle attività
  // Usa descrizione_mestiere se disponibile, altrimenti mestiere
  const metieriDisponibili = useMemo(() => {
    const metieriMap = new Map(); // mestiere -> descrizione
    attivita.forEach(att => {
      const metiereKey = att.mestiere?.trim();
      if (metiereKey && metiereKey !== '') {
        // Usa descrizione se disponibile, altrimenti usa il mestiere stesso
        const descrizione = att.descrizione_mestiere?.trim();
        const label = descrizione && descrizione !== '' ? descrizione : metiereKey;
        if (!metieriMap.has(metiereKey)) {
          metieriMap.set(metiereKey, label);
        }
      }
    });
    // Ritorna array di oggetti {key, label} ordinato per label
    const result = Array.from(metieriMap.entries())
      .map(([key, label]) => ({ key, label }))
      .sort((a, b) => a.label.localeCompare(b.label));

    // Debug: mostra primi 3 mestieri
    if (result.length > 0) {
      console.log('🔍 Mestieri disponibili (primi 3):', result.slice(0, 3));
      const primaAttivita = attivita.find(a => a.mestiere);
      if (primaAttivita) {
        console.log('🔍 Campi prima attività:', {
          mestiere: primaAttivita.mestiere,
          descrizione_mestiere: primaAttivita.descrizione_mestiere
        });
      }
    }

    return result;
  }, [attivita]);

  // Filtra attività per mestiere
  const filteredAttivita = useMemo(() => {
    if (!filters.showAttivita) return [];
    if (filters.metieriSelezionati.length === 0) return attivita;
    return attivita.filter(att =>
      filters.metieriSelezionati.includes(att.mestiere)
    );
  }, [attivita, filters.showAttivita, filters.metieriSelezionati]);

  const filteredLocali = useMemo(() => {
    return locali.filter((l) => {
      if (!filters.showSfitti && l.stato === 'sfitto') return false;
      if (!filters.showOccupati && l.stato === 'occupato') return false;
      if (!filters.showAltri && l.stato === 'altri') return false;
      if (filters.search && !l.indirizzo?.toLowerCase().includes(filters.search.toLowerCase())) return false;
      if (filters.minSuperficie && l.superficie < parseFloat(filters.minSuperficie)) return false;
      if (filters.maxSuperficie && l.superficie > parseFloat(filters.maxSuperficie)) return false;
      if (filters.foglioSearch && filters.foglioSearch.trim() !== '' && String(l.properties_raw?.foglio || '').toLowerCase() !== filters.foglioSearch.toLowerCase().trim()) return false;
      if (filters.particellaSearch && filters.particellaSearch.trim() !== '' && String(l.properties_raw?.particella || '').toLowerCase() !== filters.particellaSearch.toLowerCase().trim()) return false;
      return true;
    });
  }, [locali, filters]);

  const visibleLocali = useMemo(() => {
    if (!mapBounds) return filteredLocali;
    return filteredLocali.filter((l) => {
      const center = getLocaleCenter(l);
      if (!center) return false;
      return mapBounds.contains(center);
    });
  }, [filteredLocali, mapBounds]);

  const stats = useMemo(() => {
    return {
      totale: visibleLocali.length,
      sfitti: visibleLocali.filter((l) => l.stato === 'sfitto').length,
      occupati: visibleLocali.filter((l) => l.stato === 'occupato').length,
      altri: visibleLocali.filter((l) => l.stato === 'altri').length,
      totaleAttivita: attivita.length,
      attivitaFiltrate: filteredAttivita.length
    };
  }, [visibleLocali, attivita.length, filteredAttivita.length]);

  const getFeatureStyle = (locale) => {
    const colors = {
      sfitto: { fill: 'rgba(248, 113, 113, 0.6)', stroke: '#dc2626' },
      occupato: { fill: 'rgba(74, 222, 128, 0.6)', stroke: '#16a34a' },
      altri: { fill: 'rgba(234, 179, 8, 0.6)', stroke: '#ca8a04' }
    };
    const color = colors[locale.stato] || colors.altri;
    return {
      fillColor: color.fill,
      color: color.stroke,
      weight: 2,
      fillOpacity: 0.7
    };
  };

  const getMarkerIcon = (locale) => {
    if (locale.stato === 'sfitto') return sfittoIcon;
    if (locale.stato === 'occupato') return occupatoIcon;
    return altriIcon;
  };

  const center = project?.center ? [project.center[1], project.center[0]] : [41.9028, 12.4964];
  const zoom = project?.zoom || 14;

  return (
    <div className="flex h-screen bg-white">
      <MapSidebar
        project={project}
        stats={stats}
        filters={filters}
        onFilterChange={setFilters}
        user={user}
        metieriDisponibili={metieriDisponibili}
      />

      <div className="flex-1 relative flex">
        <div className={selectedLocale ? 'flex-1' : 'w-full'} style={{ minWidth: 0 }}>
          <MapContainer
            center={center}
            zoom={zoom}
            style={{ width: '100%', height: '100%' }}
            className="z-0"
          >
            <LayersControl position="topright">
              <LayersControl.BaseLayer name="OpenStreetMap">
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
              </LayersControl.BaseLayer>
              <LayersControl.BaseLayer name="Google Strade" checked>
                <TileLayer
                  attribution='&copy; Google'
                  url="https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
                  maxZoom={22}
                />
              </LayersControl.BaseLayer>
              <LayersControl.BaseLayer name="Google Satellite">
                <TileLayer
                  attribution='&copy; Google'
                  url="https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}"
                  maxZoom={22}
                />
              </LayersControl.BaseLayer>
              <LayersControl.BaseLayer name="Google Ibrida">
                <TileLayer
                  attribution='&copy; Google'
                  url="https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}"
                  maxZoom={22}
                />
              </LayersControl.BaseLayer>
            </LayersControl>

            {filteredLocali.map((locale, index) => {
              if (!locale.geometry) return null;

              if (locale.geometry.type === 'Point') {
                const coords = locale.coordinates || [0, 0];
                return (
                  <Marker
                    key={index}
                    position={[coords[1], coords[0]]}
                    icon={getMarkerIcon(locale)}
                  >
                    <Popup>
                      <LocalePopup
                        locale={locale}
                        onOpenStreetView={setSelectedLocale}
                        user={user}
                        popupFields={popupFields}
                        onUpdateLocale={user ? handleUpdateLocale : undefined}
                        onDeleteLocale={user ? handleDeleteLocale : undefined}
                      />
                    </Popup>
                  </Marker>
                );
              }

              if (locale.geometry.type === 'Polygon' || locale.geometry.type === 'MultiPolygon') {
                return (
                  <GeoJSON
                    key={index}
                    data={locale.geometry}
                    style={() => getFeatureStyle(locale)}
                  >
                    <Popup>
                      <LocalePopup
                        locale={locale}
                        onOpenStreetView={setSelectedLocale}
                        user={user}
                        popupFields={popupFields}
                        onUpdateLocale={user ? handleUpdateLocale : undefined}
                        onDeleteLocale={user ? handleDeleteLocale : undefined}
                      />
                    </Popup>
                  </GeoJSON>
                );
              }

              return null;
            })}

            {/* Render Attività Commerciali */}
            {filteredAttivita.map((att, index) => {
              if (!att.coordinates) return null;

              const coords = att.coordinates;
              return (
                <Marker
                  key={`attivita-${index}`}
                  position={[coords[1], coords[0]]}
                  icon={attivitaIcon}
                >
                  <Popup>
                    <AttivitaPopup
                      attivita={att}
                      onOpenStreetView={setSelectedLocale}
                      user={user}
                      popupFields={popupFieldsAttivita}
                      onUpdateAttivita={user ? handleUpdateAttivita : undefined}
                      onDeleteAttivita={user ? handleDeleteAttivita : undefined}
                    />
                  </Popup>
                </Marker>
              );
            })}

            <MapUpdater locali={filteredLocali} />
            <BoundsTracker onBoundsChange={handleBoundsChange} />
          </MapContainer>

          <MapLegend />
        </div>

        {selectedLocale && (
          <StreetViewPanel
            locale={selectedLocale}
            onClose={() => setSelectedLocale(null)}
          />
        )}
      </div>
    </div>
  );
}
