import React, { useState } from 'react';
import { cn } from '@/lib/utils';

const GOOGLE_API_KEY = 'INSERISCI_QUI_LA_TUA_API_KEY';

function getLocaleCoords(locale) {
  if (locale.coordinates) {
    return { lat: locale.coordinates[1], lng: locale.coordinates[0] };
  }
  if (locale.geometry?.type === 'Point' && locale.geometry.coordinates) {
    return { lat: locale.geometry.coordinates[1], lng: locale.geometry.coordinates[0] };
  }
  return null;
}

export default function LocalePopup({ locale }) {
  const [svError, setSvError] = useState(false);

  if (!locale) return null;

  const coords = getLocaleCoords(locale);
  const streetViewUrl = coords && GOOGLE_API_KEY !== 'INSERISCI_QUI_LA_TUA_API_KEY'
    ? `https://maps.googleapis.com/maps/api/streetview?size=320x180&location=${coords.lat},${coords.lng}&fov=90&heading=0&pitch=0&key=${GOOGLE_API_KEY}`
    : null;
  const streetViewLink = coords
    ? `https://www.google.com/maps?q=&layer=c&cbll=${coords.lat},${coords.lng}`
    : null;

  return (
    <div className="min-w-[280px]">
      {/* Street View Image */}
      {coords && streetViewUrl && !svError && (
        <a href={streetViewLink} target="_blank" rel="noopener noreferrer" className="block">
          <img
            src={streetViewUrl}
            alt="Street View"
            className="w-full h-[140px] object-cover rounded-lg mb-3 cursor-pointer hover:opacity-90 transition-opacity"
            onError={() => setSvError(true)}
          />
        </a>
      )}
      {coords && (streetViewUrl === null || svError) && (
        <a
          href={streetViewLink}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center w-full h-[80px] bg-slate-100 rounded-lg mb-3 text-sm text-blue-600 hover:bg-slate-200 transition-colors"
        >
          Apri Street View &rarr;
        </a>
      )}

      <div className="text-sm font-semibold text-slate-800 mb-3 pb-2 border-b border-slate-200">
        {locale.indirizzo || 'Locale'}
      </div>

      <div className="space-y-2">
        {locale.superficie > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Superficie</span>
            <span className="text-slate-800 font-medium">{locale.superficie.toFixed(0)} mq</span>
          </div>
        )}

        {locale.canone > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Canone</span>
            <span className="text-slate-800 font-medium">&euro; {locale.canone.toLocaleString()}</span>
          </div>
        )}

        {locale.conduttore && (
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Conduttore</span>
            <span className="text-slate-800 font-medium">{locale.conduttore}</span>
          </div>
        )}
      </div>

      <div className="mt-3">
        <span
          className={cn(
            "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold",
            locale.stato === 'sfitto'
              ? "bg-red-50 text-red-600"
              : locale.stato === 'occupato'
              ? "bg-green-50 text-green-600"
              : "bg-yellow-50 text-yellow-600"
          )}
        >
          <span className={cn(
            "w-2 h-2 rounded-full",
            locale.stato === 'sfitto'
              ? "bg-red-500"
              : locale.stato === 'occupato'
              ? "bg-green-500"
              : "bg-yellow-500"
          )} />
          {locale.stato === 'sfitto' ? 'Sfitto' : locale.stato === 'occupato' ? 'Occupato' : 'Altri'}
        </span>
      </div>
    </div>
  );
}