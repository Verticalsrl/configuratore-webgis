import React from 'react';

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-slate-900">
      <style>{`
        :root {
          --background: 222.2 84% 4.9%;
          --foreground: 210 40% 98%;
          --card: 222.2 84% 4.9%;
          --card-foreground: 210 40% 98%;
          --popover: 222.2 84% 4.9%;
          --popover-foreground: 210 40% 98%;
          --primary: 217.2 91.2% 59.8%;
          --primary-foreground: 222.2 47.4% 11.2%;
          --secondary: 217.2 32.6% 17.5%;
          --secondary-foreground: 210 40% 98%;
          --muted: 217.2 32.6% 17.5%;
          --muted-foreground: 215 20.2% 65.1%;
          --accent: 217.2 32.6% 17.5%;
          --accent-foreground: 210 40% 98%;
          --destructive: 0 62.8% 30.6%;
          --destructive-foreground: 210 40% 98%;
          --border: 217.2 32.6% 17.5%;
          --input: 217.2 32.6% 17.5%;
          --ring: 224.3 76.3% 48%;
        }
        
        body {
          background-color: #0f172a;
          color: white;
        }
        
        /* MapLibre overrides for dark theme */
        .maplibregl-popup-content {
          background: white !important;
          border-radius: 12px !important;
          padding: 16px !important;
          box-shadow: 0 10px 40px rgba(0,0,0,0.3) !important;
        }
        
        .maplibregl-popup-close-button {
          font-size: 18px;
          padding: 4px 8px;
        }
        
        .maplibregl-ctrl-group {
          background: #1e293b !important;
          border: none !important;
          border-radius: 8px !important;
          overflow: hidden;
        }
        
        .maplibregl-ctrl-group button {
          background: #1e293b !important;
          border: none !important;
        }
        
        .maplibregl-ctrl-group button:hover {
          background: #334155 !important;
        }
        
        .maplibregl-ctrl-group button .maplibregl-ctrl-icon {
          filter: invert(1);
        }
      `}</style>
      {children}
    </div>
  );
}