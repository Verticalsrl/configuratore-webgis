import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from './utils';
import { Building2, FolderOpen, LogIn, LogOut, User, ChevronDown, Map } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';

export default function Layout({ children, currentPageName }) {
  const { user, isAuthenticated, logout, navigateToLogin } = useAuth();
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const urlParams = new URLSearchParams(window.location.search);
  const projectId = urlParams.get('id');

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
          <div className="max-w-7xl mx-auto px-6 py-3">
            <div className="flex items-center justify-between">
              {/* Logo */}
              <Link to={createPageUrl('Projects')} className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold text-lg">
                <Building2 className="w-6 h-6" />
                <span>WebGIS</span>
              </Link>

              {/* Navigation */}
              <div className="flex items-center gap-2">
                <Link to={createPageUrl('Projects')}>
                  <Button
                    variant={currentPageName === 'Projects' || currentPageName === 'Home' ? 'secondary' : 'ghost'}
                    size="sm"
                    className="text-gray-700 hover:text-gray-900"
                  >
                    <FolderOpen className="w-4 h-4 mr-2" />
                    I Miei Progetti
                  </Button>
                </Link>

                {currentPageName === 'ProjectSettings' && projectId && (
                  <Link to={createPageUrl('ProjectDetail') + '?id=' + projectId}>
                    <Button variant="ghost" size="sm" className="text-gray-700 hover:text-gray-900">
                      <Map className="w-4 h-4 mr-2" />
                      Mappa
                    </Button>
                  </Link>
                )}

                {/* Separator */}
                <div className="w-px h-6 bg-gray-200 mx-1" />

                {/* User Menu */}
                {isAuthenticated && user ? (
                  <div className="relative">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-gray-700 hover:text-gray-900"
                      onClick={() => setUserMenuOpen(!userMenuOpen)}
                    >
                      <User className="w-4 h-4 mr-2" />
                      <span className="max-w-[120px] truncate">{user.full_name || user.email || 'Account'}</span>
                      <ChevronDown className="w-3 h-3 ml-1" />
                    </Button>

                    {userMenuOpen && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                        <div className="absolute right-0 mt-1 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-50 py-1">
                          <div className="px-4 py-2 border-b border-gray-100">
                            <p className="text-sm font-medium text-gray-900">{user.full_name || 'Utente'}</p>
                            {user.email && <p className="text-xs text-gray-500 truncate">{user.email}</p>}
                          </div>

                          <Link
                            to={createPageUrl('Projects')}
                            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                            onClick={() => setUserMenuOpen(false)}
                          >
                            <FolderOpen className="w-4 h-4" />
                            I Miei Progetti
                          </Link>

                          <button
                            onClick={() => {
                              setUserMenuOpen(false);
                              logout();
                            }}
                            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                          >
                            <LogOut className="w-4 h-4" />
                            Esci
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  <Button
                    variant="default"
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                    onClick={navigateToLogin}
                  >
                    <LogIn className="w-4 h-4 mr-2" />
                    Accedi
                  </Button>
                )}
              </div>
            </div>
          </div>
        </nav>
      )}

      {children}
    </div>
  );
}
