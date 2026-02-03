import React, { useEffect, useRef, useState, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import MapSidebar from './MapSidebar';
import MapLegend from './MapLegend';
import LocalePopup from './LocalePopup';

export default function MapView({ project, locali, onReset }) {
  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  const popupRef = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);
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

  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;

    // Load MapLibre dynamically
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/maplibre-gl@3.6.2/dist/maplibre-gl.js';
    script.onload = () => {
      const link = document.createElement('link');
      link.href = 'https://unpkg.com/maplibre-gl@3.6.2/dist/maplibre-gl.css';
      link.rel = 'stylesheet';
      document.head.appendChild(link);

      initMap();
    };
    document.head.appendChild(script);

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  const initMap = () => {
    const maplibregl = window.maplibregl;
    if (!maplibregl) return;

    const center = project?.center || [12.4964, 41.9028];
    const zoom = project?.zoom || 14;

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
      center: center,
      zoom: zoom,
      attributionControl: false
    });

    map.addControl(new maplibregl.NavigationControl(), 'top-right');
    map.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-left');

    map.on('load', () => {
      mapRef.current = map;
      setMapLoaded(true);
    });
  };

  useEffect(() => {
    if (!mapLoaded || !mapRef.current) return;

    const map = mapRef.current;
    const maplibregl = window.maplibregl;

    // Remove existing layers and sources
    if (map.getLayer('locali-fill')) map.removeLayer('locali-fill');
    if (map.getLayer('locali-outline')) map.removeLayer('locali-outline');
    if (map.getLayer('locali-points')) map.removeLayer('locali-points');
    if (map.getSource('locali')) map.removeSource('locali');

    // Create GeoJSON from filtered locali
    const geojson = {
      type: 'FeatureCollection',
      features: filteredLocali.map((l, index) => ({
        type: 'Feature',
        id: index,
        geometry: l.geometry || {
          type: 'Point',
          coordinates: l.coordinates || [0, 0]
        },
        properties: {
          ...l,
          index
        }
      }))
    };

    map.addSource('locali', {
      type: 'geojson',
      data: geojson
    });

    // Add fill layer for polygons
    map.addLayer({
      id: 'locali-fill',
      type: 'fill',
      source: 'locali',
      filter: ['any', 
        ['==', ['geometry-type'], 'Polygon'],
        ['==', ['geometry-type'], 'MultiPolygon']
      ],
      paint: {
        'fill-color': [
          'case',
          ['==', ['get', 'stato'], 'sfitto'],
          'rgba(248, 113, 113, 0.6)',
          ['==', ['get', 'stato'], 'occupato'],
          'rgba(74, 222, 128, 0.6)',
          'rgba(234, 179, 8, 0.6)'
        ],
        'fill-opacity': 0.7
      }
    });

    // Add outline layer
    map.addLayer({
      id: 'locali-outline',
      type: 'line',
      source: 'locali',
      filter: ['any', 
        ['==', ['geometry-type'], 'Polygon'],
        ['==', ['geometry-type'], 'MultiPolygon']
      ],
      paint: {
        'line-color': [
          'case',
          ['==', ['get', 'stato'], 'sfitto'],
          '#dc2626',
          ['==', ['get', 'stato'], 'occupato'],
          '#16a34a',
          '#ca8a04'
        ],
        'line-width': 2
      }
    });

    // Add points layer
    map.addLayer({
      id: 'locali-points',
      type: 'circle',
      source: 'locali',
      filter: ['==', ['geometry-type'], 'Point'],
      paint: {
        'circle-radius': 8,
        'circle-color': [
          'case',
          ['==', ['get', 'stato'], 'sfitto'],
          '#f87171',
          ['==', ['get', 'stato'], 'occupato'],
          '#4ade80',
          '#eab308'
        ],
        'circle-stroke-width': 2,
        'circle-stroke-color': '#ffffff'
      }
    });

    // Click handler
    const handleClick = (e) => {
      const features = map.queryRenderedFeatures(e.point, {
        layers: ['locali-fill', 'locali-points']
      });

      if (features.length > 0) {
        const feature = features[0];
        const locale = filteredLocali[feature.properties.index];
        
        if (popupRef.current) {
          popupRef.current.remove();
        }

        const popupNode = document.createElement('div');
        const root = createRoot(popupNode);
        root.render(<LocalePopup locale={locale} />);

        popupRef.current = new maplibregl.Popup({
          closeButton: true,
          closeOnClick: true,
          maxWidth: '300px'
        })
          .setLngLat(e.lngLat)
          .setDOMContent(popupNode)
          .addTo(map);
      }
    };

    map.on('click', 'locali-fill', handleClick);
    map.on('click', 'locali-points', handleClick);

    // Cursor change
    map.on('mouseenter', 'locali-fill', () => {
      map.getCanvas().style.cursor = 'pointer';
    });
    map.on('mouseleave', 'locali-fill', () => {
      map.getCanvas().style.cursor = '';
    });
    map.on('mouseenter', 'locali-points', () => {
      map.getCanvas().style.cursor = 'pointer';
    });
    map.on('mouseleave', 'locali-points', () => {
      map.getCanvas().style.cursor = '';
    });

  }, [mapLoaded, filteredLocali]);

  const handleExport = () => {
    const headers = ['Indirizzo', 'Superficie', 'Stato', 'Canone', 'Conduttore'];
    const rows = filteredLocali.map((l) => [
      l.indirizzo || '',
      l.superficie || '',
      l.stato || '',
      l.canone || '',
      l.conduttore || ''
    ]);
    
    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'locali_export.csv';
    a.click();
  };

  return (
    <div className="flex h-screen bg-slate-900">
      <MapSidebar
        project={project}
        stats={stats}
        filters={filters}
        onFilterChange={setFilters}
        onExport={handleExport}
        onReset={onReset}
      />
      
      <div className="flex-1 relative">
        <div ref={mapContainer} className="w-full h-full" />
        <MapLegend />
        
        {/* Header stats bar */}
        <div className="absolute top-4 left-4 right-4 bg-slate-800/90 backdrop-blur rounded-xl px-4 py-3 flex items-center justify-between z-10">
          <h2 className="text-white font-medium">Mappa Locali</h2>
          <div className="flex gap-4 text-sm text-slate-300">
            <span>Visualizzati: <strong className="text-white">{filteredLocali.length}</strong></span>
            <span>Sfitti: <strong className="text-red-400">{stats.sfitti}</strong></span>
            <span>Occupati: <strong className="text-green-400">{stats.occupati}</strong></span>
            {stats.altri > 0 && <span>Altri: <strong className="text-yellow-400">{stats.altri}</strong></span>}
          </div>
        </div>
      </div>
    </div>
  );
}