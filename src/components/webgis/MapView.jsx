import React, { useRef, useState, useMemo } from 'react';
import { MapContainer, TileLayer, GeoJSON, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import MapSidebar from './MapSidebar';
import MapLegend from './MapLegend';
import LocalePopup from './LocalePopup';

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

function MapUpdater({ locali }) {
  const map = useMap();
  
  React.useEffect(() => {
    if (locali.length > 0) {
      const bounds = L.latLngBounds(
        locali.map(l => {
          if (l.geometry?.type === 'Point') {
            return [l.coordinates[1], l.coordinates[0]];
          } else if (l.geometry?.type === 'Polygon') {
            return l.geometry.coordinates[0].map(coord => [coord[1], coord[0]]);
          }
          return [l.coordinates[1], l.coordinates[0]];
        }).flat()
      );
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [locali, map]);

  return null;
}

export default function MapView({ project, locali, user }) {
  const [filters, setFilters] = useState({
    showSfitti: true,
    showOccupati: true,
    showAltri: true,
    search: '',
    minSuperficie: '',
    maxSuperficie: ''
  });

  const filteredLocali = useMemo(() => {
    return locali.filter((l) => {
      if (!filters.showSfitti && l.stato === 'sfitto') return false;
      if (!filters.showOccupati && l.stato === 'occupato') return false;
      if (!filters.showAltri && l.stato === 'altri') return false;
      if (filters.search && !l.indirizzo?.toLowerCase().includes(filters.search.toLowerCase())) return false;
      if (filters.minSuperficie && l.superficie < parseFloat(filters.minSuperficie)) return false;
      if (filters.maxSuperficie && l.superficie > parseFloat(filters.maxSuperficie)) return false;
      return true;
    });
  }, [locali, filters]);

  const stats = useMemo(() => {
    return {
      totale: filteredLocali.length,
      sfitti: filteredLocali.filter((l) => l.stato === 'sfitto').length,
      occupati: filteredLocali.filter((l) => l.stato === 'occupato').length,
      altri: filteredLocali.filter((l) => l.stato === 'altri').length
    };
  }, [filteredLocali]);

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
      />
      
      <div className="flex-1 relative">
        <MapContainer
          center={center}
          zoom={zoom}
          style={{ width: '100%', height: '100%' }}
          className="z-0"
        >
          <TileLayer
            attribution='&copy; <a href="https://carto.com/">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />
          
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
                    <LocalePopup locale={locale} />
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
                    <LocalePopup locale={locale} />
                  </Popup>
                </GeoJSON>
              );
            }

            return null;
          })}

          <MapUpdater locali={filteredLocali} />
        </MapContainer>

        <MapLegend />
        
        {/* Header stats bar */}
        <div className="absolute top-4 left-4 right-4 bg-white/95 backdrop-blur rounded-xl px-4 py-3 flex items-center justify-between z-[1000] shadow-lg border border-gray-200">
          <h2 className="text-gray-900 font-medium">Mappa Locali</h2>
          <div className="flex gap-4 text-sm text-gray-700">
            <span>Visualizzati: <strong className="text-gray-900">{filteredLocali.length}</strong></span>
            <span>Sfitti: <strong className="text-red-600">{stats.sfitti}</strong></span>
            <span>Occupati: <strong className="text-green-600">{stats.occupati}</strong></span>
            {stats.altri > 0 && <span>Altri: <strong className="text-yellow-600">{stats.altri}</strong></span>}
          </div>
        </div>
      </div>
    </div>
  );
}