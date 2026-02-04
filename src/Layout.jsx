import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from './utils';
import { Building2, Home } from 'lucide-react';

export default function Layout({ children, currentPageName }) {
  return (
    <div className="min-h-screen bg-white">
      <style>{`
        :root {
          --background: 0 0% 100%;
          --foreground: 222.2 84% 4.9%;
          --card: 0 0% 100%;
          --card-foreground: 222.2 84% 4.9%;
          --popover: 0 0% 100%;
          --popover-foreground: 222.2 84% 4.9%;
          --primary: 217.2 91.2% 59.8%;
          --primary-foreground: 210 40% 98%;
          --secondary: 210 40% 96.1%;
          --secondary-foreground: 222.2 47.4% 11.2%;
          --muted: 210 40% 96.1%;
          --muted-foreground: 215.4 16.3% 46.9%;
          --accent: 210 40% 96.1%;
          --accent-foreground: 222.2 47.4% 11.2%;
          --destructive: 0 84.2% 60.2%;
          --destructive-foreground: 210 40% 98%;
          --border: 214.3 31.8% 91.4%;
          --input: 214.3 31.8% 91.4%;
          --ring: 221.2 83.2% 53.3%;
        }
        
        body {
          background-color: white;
          color: #0f172a;
        }
        
        /* Leaflet overrides for light theme */
        .leaflet-popup-content-wrapper {
          background: white !important;
          border-radius: 12px !important;
          padding: 16px !important;
          box-shadow: 0 10px 40px rgba(0,0,0,0.2) !important;
        }

        .leaflet-popup-close-button {
          font-size: 18px;
          padding: 4px 8px;
          color: #0f172a;
        }

        .leaflet-bar {
          background: white !important;
          border: 1px solid #e2e8f0 !important;
          border-radius: 8px !important;
          overflow: hidden;
        }

        .leaflet-bar a {
          background: white !important;
          border: none !important;
          color: #0f172a !important;
        }

        .leaflet-bar a:hover {
          background: #f1f5f9 !important;
        }

        .custom-marker {
          background: none !important;
          border: none !important;
        }
      `}</style>
      
      {currentPageName !== 'ProjectDetail' && (
        <nav className="bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <Link to={createPageUrl('Projects')} className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold text-lg">
                <Building2 className="w-6 h-6" />
                <span>WebGIS</span>
              </Link>
              <div className="flex items-center gap-4">
                <Link 
                  to={createPageUrl('Projects')} 
                  className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-700 hover:text-gray-900"
                >
                  <Home className="w-4 h-4" />
                  <span>I Miei Progetti</span>
                </Link>
              </div>
            </div>
          </div>
        </nav>
      )}
      
      {children}
    </div>
  );
}