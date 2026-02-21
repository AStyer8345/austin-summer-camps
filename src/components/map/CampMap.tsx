'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { Camp, CATEGORY_CONFIG } from '@/types/database';
import { formatPriceRange, formatAgeRange } from '@/lib/utils';

interface CampMapProps {
  camps: Camp[];
  onSelectCamp?: (camp: Camp) => void;
}

// Austin center coordinates
const AUSTIN_CENTER: [number, number] = [-97.7431, 30.2672];
const DEFAULT_ZOOM = 10;

export default function CampMap({ camps, onSelectCamp }: CampMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [selectedCamp, setSelectedCamp] = useState<Camp | null>(null);
  const [mapboxToken, setMapboxToken] = useState<string | null>(null);

  useEffect(() => {
    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    if (token) setMapboxToken(token);
  }, []);

  const campsWithCoords = camps.filter(c => c.latitude && c.longitude);
  const campsWithoutCoords = camps.filter(c => !c.latitude || !c.longitude);

  const initMap = useCallback(async () => {
    if (!mapContainer.current || !mapboxToken || mapRef.current) return;

    const mapboxgl = (await import('mapbox-gl')).default;

    mapboxgl.accessToken = mapboxToken;

    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: AUSTIN_CENTER,
      zoom: DEFAULT_ZOOM,
    });

    map.addControl(new mapboxgl.NavigationControl(), 'top-right');

    map.on('load', () => {
      setMapLoaded(true);
      mapRef.current = map;
      addMarkers(map, mapboxgl);
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [mapboxToken]); // eslint-disable-line react-hooks/exhaustive-deps

  const addMarkers = useCallback(async (map: mapboxgl.Map, mapboxgl: typeof import('mapbox-gl').default) => {
    // Clear existing markers
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    for (const camp of campsWithCoords) {
      const config = CATEGORY_CONFIG[camp.category];

      // Create custom marker element
      const el = document.createElement('div');
      el.className = 'camp-map-marker';
      el.style.cssText = `
        width: 28px;
        height: 28px;
        border-radius: 50%;
        background: ${config.mapPin};
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        cursor: pointer;
        transition: transform 0.15s ease;
      `;
      el.addEventListener('mouseenter', () => {
        el.style.transform = 'scale(1.3)';
        el.style.zIndex = '10';
      });
      el.addEventListener('mouseleave', () => {
        el.style.transform = 'scale(1)';
        el.style.zIndex = '1';
      });

      // Create popup
      const popup = new mapboxgl.Popup({
        offset: 20,
        closeButton: true,
        closeOnClick: false,
        maxWidth: '280px',
      }).setHTML(`
        <div style="font-family: system-ui, -apple-system, sans-serif; padding: 4px;">
          <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 6px;">
            <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: ${config.mapPin};"></span>
            <span style="font-size: 11px; color: #666; font-weight: 500;">${config.label}</span>
          </div>
          <h3 style="font-size: 14px; font-weight: 700; margin: 0 0 4px; color: #111;">${camp.name}</h3>
          <p style="font-size: 12px; color: #555; margin: 0 0 4px;">${formatAgeRange(camp.ages_min, camp.ages_max)} &middot; ${formatPriceRange(camp.price_min, camp.price_max)}</p>
          ${camp.notes ? `<p style="font-size: 11px; color: #777; margin: 0 0 6px; line-height: 1.4;">${camp.notes.slice(0, 100)}${camp.notes.length > 100 ? '...' : ''}</p>` : ''}
          ${camp.website ? `<a href="${camp.website}" target="_blank" rel="noopener" style="font-size: 11px; color: #0284c7; text-decoration: none; font-weight: 500;">Visit Website &rarr;</a>` : ''}
        </div>
      `);

      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat([camp.longitude!, camp.latitude!])
        .setPopup(popup)
        .addTo(map);

      el.addEventListener('click', () => {
        setSelectedCamp(camp);
        onSelectCamp?.(camp);
      });

      markersRef.current.push(marker);
    }
  }, [campsWithCoords, onSelectCamp]);

  useEffect(() => {
    initMap();
  }, [initMap]);

  // Update markers when camps change
  useEffect(() => {
    if (mapRef.current && mapLoaded) {
      import('mapbox-gl').then((mapboxgl) => {
        addMarkers(mapRef.current!, mapboxgl.default);
      });
    }
  }, [camps, mapLoaded, addMarkers]);

  // No mapbox token - show placeholder with camp list
  if (!mapboxToken) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="p-6">
          <div className="text-center mb-6">
            <div className="w-12 h-12 bg-sky-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-sky-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Camp Locations</h3>
            <p className="text-sm text-gray-500">
              Add <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded">NEXT_PUBLIC_MAPBOX_TOKEN</code> to enable the interactive map
            </p>
          </div>

          {/* Region-grouped camp list as fallback */}
          <div className="space-y-4">
            {Object.entries(
              camps.reduce((acc, camp) => {
                const region = camp.region || 'austin_metro';
                if (!acc[region]) acc[region] = [];
                acc[region].push(camp);
                return acc;
              }, {} as Record<string, Camp[]>)
            )
              .sort((a, b) => b[1].length - a[1].length)
              .map(([region, regionCamps]) => (
                <div key={region}>
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    {region.replace(/_/g, ' ')} ({regionCamps.length})
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    {regionCamps.map((camp) => {
                      const config = CATEGORY_CONFIG[camp.category];
                      return (
                        <div
                          key={camp.id}
                          className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                          onClick={() => {
                            setSelectedCamp(camp);
                            onSelectCamp?.(camp);
                          }}
                        >
                          <span
                            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                            style={{ backgroundColor: config.mapPin }}
                          />
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{camp.name}</p>
                            <p className="text-xs text-gray-500">{camp.city} &middot; {formatPriceRange(camp.price_min, camp.price_max)}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      <div className="flex h-[600px]">
        {/* Map */}
        <div className="flex-1 relative">
          <div ref={mapContainer} className="absolute inset-0" />

          {/* Legend */}
          <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm rounded-xl shadow-lg p-3 z-10 max-w-[200px]">
            <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Categories</p>
            <div className="grid grid-cols-2 gap-x-3 gap-y-1">
              {Object.entries(CATEGORY_CONFIG).map(([key, config]) => {
                const count = campsWithCoords.filter(c => c.category === key).length;
                if (count === 0) return null;
                return (
                  <div key={key} className="flex items-center gap-1.5">
                    <span
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: config.mapPin }}
                    />
                    <span className="text-[10px] text-gray-600">{config.label} ({count})</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Camp count */}
          <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm rounded-lg shadow px-3 py-1.5 z-10">
            <p className="text-xs font-medium text-gray-700">
              {campsWithCoords.length} camps on map
              {campsWithoutCoords.length > 0 && (
                <span className="text-gray-400"> &middot; {campsWithoutCoords.length} listed below</span>
              )}
            </p>
          </div>
        </div>

        {/* Sidebar - selected camp or list */}
        <div className="w-72 border-l border-gray-100 overflow-y-auto hidden lg:block">
          {selectedCamp ? (
            <div className="p-4">
              <button
                onClick={() => setSelectedCamp(null)}
                className="text-xs text-sky-600 hover:text-sky-700 mb-3 font-medium"
              >
                &larr; Back to list
              </button>
              <div className="space-y-3">
                <span className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium ${CATEGORY_CONFIG[selectedCamp.category].bgColor} ${CATEGORY_CONFIG[selectedCamp.category].color}`}>
                  {CATEGORY_CONFIG[selectedCamp.category].label}
                </span>
                <h3 className="text-base font-bold text-gray-900">{selectedCamp.name}</h3>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>{formatAgeRange(selectedCamp.ages_min, selectedCamp.ages_max)}</p>
                  <p className="font-semibold">{formatPriceRange(selectedCamp.price_min, selectedCamp.price_max)}</p>
                  <p>{selectedCamp.city}, TX</p>
                </div>
                {selectedCamp.notes && (
                  <p className="text-xs text-gray-500 leading-relaxed">{selectedCamp.notes}</p>
                )}
                {selectedCamp.website && (
                  <a
                    href={selectedCamp.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block text-sm font-medium text-sky-600 hover:text-sky-700"
                  >
                    Visit Website &rarr;
                  </a>
                )}
              </div>
            </div>
          ) : (
            <div className="p-3">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                All Camps ({camps.length})
              </p>
              <div className="space-y-0.5">
                {camps.map((camp) => {
                  const config = CATEGORY_CONFIG[camp.category];
                  return (
                    <button
                      key={camp.id}
                      onClick={() => {
                        setSelectedCamp(camp);
                        onSelectCamp?.(camp);
                        // If camp has coords, fly to it
                        if (camp.latitude && camp.longitude && mapRef.current) {
                          mapRef.current.flyTo({
                            center: [camp.longitude, camp.latitude],
                            zoom: 13,
                            duration: 1000,
                          });
                        }
                      }}
                      className="w-full text-left flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <span
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ backgroundColor: config.mapPin }}
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-gray-900 truncate">{camp.name}</p>
                        <p className="text-[10px] text-gray-400">{camp.city}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Camps without coords - shown below map */}
      {campsWithoutCoords.length > 0 && mapboxToken && (
        <div className="border-t border-gray-100 p-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
            Additional Camps (location pending)
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {campsWithoutCoords.slice(0, 12).map((camp) => {
              const config = CATEGORY_CONFIG[camp.category];
              return (
                <div
                  key={camp.id}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => {
                    setSelectedCamp(camp);
                    onSelectCamp?.(camp);
                  }}
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: config.mapPin }}
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{camp.name}</p>
                    <p className="text-xs text-gray-500">
                      {camp.city} &middot; {formatPriceRange(camp.price_min, camp.price_max)}
                    </p>
                  </div>
                </div>
              );
            })}
            {campsWithoutCoords.length > 12 && (
              <p className="text-xs text-gray-400 col-span-full text-center pt-1">
                + {campsWithoutCoords.length - 12} more camps
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
