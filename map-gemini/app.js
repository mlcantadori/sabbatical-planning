import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, ZoomControl } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { chapters } from './itineraryData';

export default function SabbaticalApp() {
  const [selectedChapter, setSelectedChapter] = useState(chapters[0]);

  // Map route coordinates for the polyline "Arc"
  const routePath = chapters.map(c => c.pos);

  return (
    <div className="flex h-screen w-full bg-gray-50 overflow-hidden">
      
      {/* SIDEBAR: CONTENT DECK */}
      <aside className="w-full md:w-96 h-full bg-white shadow-2xl flex flex-col z-[1000]">
        <div className="p-6 border-b border-gray-100">
          <h1 className="text-2xl font-black tracking-tighter text-gray-900 uppercase">Asia Sabbatical</h1>
          <p className="text-xs font-bold text-indigo-500 uppercase tracking-widest mt-1">2026—2027 Itinerary</p>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Main Visual */}
          <div className="h-56 w-full relative">
            <img 
              src={selectedChapter.img} 
              className="w-full h-full object-cover" 
              alt={selectedChapter.name} 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6">
              <span className="text-white text-xs font-bold uppercase bg-indigo-600 px-2 py-1 rounded">
                Chapter {selectedChapter.id}
              </span>
            </div>
          </div>

          {/* Details */}
          <div className="p-6 space-y-6">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 leading-tight">{selectedChapter.name}</h2>
              <p className="text-gray-500 font-medium italic mt-2">{selectedChapter.dates}</p>
            </div>

            <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
              <h4 className="text-xs font-bold text-indigo-600 uppercase mb-1">Theme</h4>
              <p className="text-gray-800 text-sm italic">{selectedChapter.theme}</p>
            </div>

            <div>
              <h4 className="text-xs font-bold text-gray-400 uppercase mb-3">Key Highlights</h4>
              <ul className="space-y-3">
                {selectedChapter.highlights.map((h, i) => (
                  <li key={i} className="flex items-center text-sm text-gray-700">
                    <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full mr-3"></span>
                    {h}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="p-6 bg-gray-50 border-t border-gray-100 text-[10px] text-gray-400 font-mono flex justify-between">
          <span>MALU + BEZINHO ARC</span>
          <span>9.3 MONTHS</span>
        </div>
      </aside>

      {/* MAIN: INTERACTIVE ARC MAP */}
      <main className="flex-1 h-full relative">
        <MapContainer 
          center={[30, 90]} 
          zoom={4} 
          zoomControl={false}
          className="h-full w-full"
        >
          <TileLayer 
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; OpenStreetMap'
          />
          
          <ZoomControl position="bottomright" />

          {/* The Travel Arc Path */}
          <Polyline 
            positions={routePath} 
            pathOptions={{ color: '#4f46e5', weight: 3, dashArray: '8, 12', opacity: 0.6 }} 
          />

          {/* Destination Markers */}
          {chapters.map((chapter) => (
            <Marker 
              key={chapter.id} 
              position={chapter.pos}
              eventHandlers={{
                click: () => setSelectedChapter(chapter),
              }}
            >
              <Popup>
                <div className="text-center p-1">
                  <strong className="block text-indigo-600">{chapter.name}</strong>
                  <span className="text-[10px] text-gray-400 italic">{chapter.dates}</span>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </main>
    </div>
  );
}