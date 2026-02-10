import React from 'react';
import { X, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { GOOGLE_MAPS_API_KEY } from '@/lib/google-config';

function getLocaleCoords(locale) {
  if (locale.coordinates) {
    return { lat: locale.coordinates[1], lng: locale.coordinates[0] };
  }
  if (locale.geometry?.type === 'Point' && locale.geometry.coordinates) {
    return { lat: locale.geometry.coordinates[1], lng: locale.geometry.coordinates[0] };
  }
  return null;
}

export default function StreetViewPanel({ locale, onClose }) {
  if (!locale) return null;

  const coords = getLocaleCoords(locale);
  if (!coords) return null;

  const embedUrl = GOOGLE_MAPS_API_KEY
    ? `https://www.google.com/maps/embed/v1/streetview?location=${coords.lat},${coords.lng}&key=${GOOGLE_MAPS_API_KEY}&fov=90`
    : null;

  const externalUrl = `https://www.google.com/maps?q=&layer=c&cbll=${coords.lat},${coords.lng}`;

  return (
    <div className="w-[420px] h-full bg-white border-l border-gray-200 flex flex-col z-10">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between bg-gray-50">
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold text-gray-900 truncate">
            {locale.indirizzo || 'Locale'}
          </h3>
          <div className="flex items-center gap-2 mt-0.5">
            <span
              className={cn(
                "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium",
                locale.stato === 'sfitto'
                  ? "bg-red-100 text-red-700"
                  : locale.stato === 'occupato'
                  ? "bg-green-100 text-green-700"
                  : "bg-yellow-100 text-yellow-700"
              )}
            >
              <span className={cn(
                "w-1.5 h-1.5 rounded-full",
                locale.stato === 'sfitto' ? "bg-red-500"
                  : locale.stato === 'occupato' ? "bg-green-500"
                  : "bg-yellow-500"
              )} />
              {locale.stato === 'sfitto' ? 'Sfitto' : locale.stato === 'occupato' ? 'Occupato' : 'Altri'}
            </span>
            {locale.superficie > 0 && (
              <span className="text-xs text-gray-500">{locale.superficie.toFixed(0)} mq</span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1 ml-2">
          <a
            href={externalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-500 hover:text-gray-700 transition-colors"
            title="Apri in Google Maps"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Street View iframe */}
      <div className="flex-1">
        {embedUrl ? (
          <iframe
            src={embedUrl}
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 p-6 text-center">
            <p className="text-sm mb-4">API Key Google non configurata per l'embed.</p>
            <a
              href={externalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors"
            >
              Apri Street View in Google Maps
            </a>
          </div>
        )}
      </div>

      {/* Footer info */}
      {(locale.canone > 0 || locale.conduttore) && (
        <div className="px-4 py-2 border-t border-gray-200 bg-gray-50 text-xs text-gray-600 flex gap-4">
          {locale.canone > 0 && (
            <span>Canone: <strong className="text-gray-900">&euro; {locale.canone.toLocaleString()}</strong></span>
          )}
          {locale.conduttore && (
            <span>Conduttore: <strong className="text-gray-900">{locale.conduttore}</strong></span>
          )}
        </div>
      )}
    </div>
  );
}
