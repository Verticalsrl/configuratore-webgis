# Specifiche Tecniche — Configuratore WebGIS

## 1. Panoramica

Il **Configuratore WebGIS** è una piattaforma web per la gestione e visualizzazione geospaziale di **locali commerciali** e **attività commerciali** su mappa interattiva. È progettata per professionisti immobiliari, consulenti e amministratori di patrimoni commerciali italiani.

---

## 2. Stack Tecnologico

| Componente | Tecnologia |
|---|---|
| Frontend | React 18, React Router v6, Vite |
| Stile | Tailwind CSS, Radix UI (shadcn/ui) |
| Mappa | Leaflet + React-Leaflet (OpenStreetMap / Google Maps) |
| Gestione dati | TanStack React Query, React Hook Form |
| Backend | Base44 SDK (headless CMS cloud) |
| Autenticazione | Base44 Auth (context React) |
| Icone | Lucide React |
| Validazione | Zod |

---

## 3. Entità di Dominio

### 3.1 Progetto (`Progetto`)

Rappresenta un portafoglio immobiliare contenente locali e attività.

| Campo | Tipo | Descrizione |
|---|---|---|
| `id` | string | Identificativo univoco |
| `nome` | string | Nome del progetto |
| `descrizione` | string | Descrizione testuale |
| `config` | object | Configurazione mappatura campi (vedi §3.4) |
| `created_date` | date | Data di creazione |
| `centro` | [lat, lng] | Centro iniziale della mappa |
| `zoom` | number | Livello di zoom iniziale |
| `totale_locali` | number | Conteggio totale locali |
| `totale_sfitti` | number | Conteggio locali sfitti |
| `totale_occupati` | number | Conteggio locali occupati |
| `totale_altri` | number | Conteggio altri locali |

### 3.2 Locale (`Locale`)

Un immobile commerciale geolocalizzato.

| Campo | Tipo | Descrizione |
|---|---|---|
| `id` | string | Identificativo univoco |
| `project_id` | string | FK al progetto |
| `indirizzo` | string | Indirizzo completo |
| `superficie` | number | Superficie in m² |
| `canone` | number | Canone di locazione (€) |
| `conduttore` | string | Nome del conduttore |
| `stato` | enum | `sfitto` / `occupato` / `altri` |
| `geometry` | GeoJSON | Geometria (Point, Polygon, MultiPolygon) |
| `coordinates` | [lng, lat] | Coordinate centroide |
| `properties_raw` | object | Proprietà originali dal GeoJSON sorgente |

### 3.3 Attività Commerciale (`AttivitaCommerciale`)

Un'attività economica associata a una posizione geografica.

| Campo | Tipo | Descrizione |
|---|---|---|
| `id` | string | Identificativo univoco |
| `project_id` | string | FK al progetto |
| `ragione_sociale` | string | Ragione sociale |
| `partita_iva` | string | Partita IVA |
| `codice_fiscale` | string | Codice fiscale |
| `natura_giuridica` | string | Forma giuridica |
| `pmi` | boolean | Piccola/Media Impresa |
| `mestiere` | string | Tipo di mestiere/attività |
| `descrizione_mestiere` | string | Descrizione del mestiere |
| `ateco2025` | string | Codice ATECO 2025 |
| `descrizione_ateco` | string | Descrizione codice ATECO |
| `strada` | string | Via/strada |
| `civico` | string | Numero civico |
| `frazione` | string | Frazione |
| `comune` | string | Comune |
| `cap` | string | CAP |
| `provincia` | string | Provincia |
| `regione` | string | Regione |
| `prov_sede_legale` | string | Provincia sede legale |
| `latitudine` | number | Latitudine |
| `longitudine` | number | Longitudine |
| `coordinates` | [lng, lat] | Coordinate |
| `geometry` | GeoJSON | Geometria |
| `properties_raw` | object | Proprietà originali dal GeoJSON sorgente |

### 3.4 Configurazione Progetto (`config`)

Definisce la mappatura tra campi GeoJSON sorgente e campi applicativi.

```json
{
  "campo_superficie": "SUP_MQ",
  "campo_stato": "STATO",
  "campo_indirizzo": "INDIRIZZO",
  "campo_canone": "CANONE",
  "campo_conduttore": "CONDUTTORE",
  "valore_sfitto": "SFITTO",
  "valore_occupato": "OCCUPATO",
  "valore_altri": "ALTRI",
  "popup_fields": "indirizzo,superficie,canone,conduttore",
  "popup_fields_attivita": "ragione_sociale,mestiere,ateco2025"
}
```

---

## 4. Autenticazione e Autorizzazione

### 4.1 Autenticazione

- Gestita tramite **Base44 SDK Auth**
- Provider React (`AuthContext`) wrappa l'intera applicazione
- L'utente autenticato espone: `full_name`, `email`, `role`
- Tre stati di errore gestiti: `auth_required`, `user_not_registered`, errore generico

### 4.2 Ruoli

| Ruolo | Permessi |
|---|---|
| **Admin** | CRUD completo su progetti, locali e attività. Import/export. Configurazione. Trascinamento marker su mappa. |
| **Utente** | Sola lettura. Visualizzazione mappa, filtri, Street View. |

### 4.3 Controllo Accessi (feature protette)

| Azione | Admin | Utente |
|---|---|---|
| Visualizzare mappa e dati | ✅ | ✅ |
| Filtrare e cercare | ✅ | ✅ |
| Aprire Street View | ✅ | ✅ |
| Creare progetto | ✅ | ❌ |
| Eliminare progetto | ✅ | ❌ |
| Modificare locale/attività | ✅ | ❌ |
| Eliminare locale/attività | ✅ | ❌ |
| Importare/esportare GeoJSON | ✅ | ❌ |
| Configurare popup | ✅ | ❌ |
| Trascinare marker attività | ✅ | ❌ |

---

## 5. Funzionalità

### 5.1 Gestione Progetti

- **Lista progetti**: Vista a card con statistiche (totali, sfitti, occupati, altri)
- **Creazione progetto**: Wizard guidato in 3 step
  1. Upload file GeoJSON (drag & drop)
  2. Mappatura campi GeoJSON → campi applicativi
  3. Anteprima statistiche e conferma
- **Impostazioni progetto**: Dialog con 3 tab
  - Generale (rinomina)
  - Gestione dati (import/export/pulizia)
  - Configurazione popup (toggle campi visibili)
- **Eliminazione progetto**: Con dialog di conferma, cancellazione a cascata dei locali

### 5.2 Mappa Interattiva

#### Base Layer
- OpenStreetMap
- Google Street Map
- Google Satellite
- Google Hybrid

#### Marker
- **Locali**: Icone colorate per stato
  - 🔴 Rosso = Sfitto
  - 🟢 Verde = Occupato
  - 🟡 Giallo = Altro
- **Attività Commerciali**: Icone dedicate
- Supporto geometrie: Point, Polygon, MultiPolygon (con calcolo centroide automatico)
- Marker attività trascinabili (solo admin)

#### Popup Locale
- Modalità visualizzazione/modifica (toggle)
- Campi: stato, canone, conduttore, superficie, indirizzo
- Pulsanti cambio stato rapido (Sfitto/Occupato/Altri)
- Pulsante Street View
- Pulsante elimina (solo admin, con conferma)

#### Popup Attività
- Vista completa: ragione sociale, mestiere, ATECO, indirizzo, P.IVA, C.F., ecc.
- Modalità modifica con tutti i campi inclusi properties_raw personalizzati
- Integrazione Street View
- Eliminazione con conferma

### 5.3 Filtri e Ricerca (Sidebar)

| Filtro | Tipo | Descrizione |
|---|---|---|
| Stato | Checkbox | Sfitti, Occupati, Altri, Attività Commerciali |
| Ricerca indirizzo | Testo | Ricerca libera per indirizzo |
| Superficie | Range | Min/Max in m² |
| Foglio catastale | Testo | Numero foglio |
| Particella catastale | Testo | Numero particella |
| Mestieri | Multi-select | Filtra attività per tipo di mestiere |

### 5.4 Statistiche in Tempo Reale

- Calcolate **solo sugli elementi visibili** nel viewport corrente della mappa
- Aggiornamento automatico al pan/zoom
- Metriche:
  - Totale locali visibili
  - Sfitti (conteggio)
  - Occupati (conteggio)
  - Altri (conteggio)
  - Tasso di sfitto (%)
  - Attività visibili (filtrate/totale)

### 5.5 Google Street View

- Pannello laterale destro con iframe Street View incorporato
- Mostra informazioni locale/attività (indirizzo, stato, superficie, canone, conduttore)
- Link esterno a Google Maps come fallback
- Caricamento basato su coordinate

### 5.6 Import/Export Dati

#### Import Locali (GeoJSON)
- Upload drag & drop
- Sostituzione completa dei locali esistenti nel progetto
- Riutilizza configurazione mappatura del progetto
- Operazione bulk: delete + insert

#### Import Attività Commerciali (GeoJSON)
- Wizard a 4 step:
  1. Upload GeoJSON
  2. Mappatura campi (auto-detection dei campi standard)
  3. Anteprima primi 5 record
  4. Conferma (sostituisce tutte le attività esistenti)

#### Export
- Locali → file `.geojson` con tutte le proprietà
- Attività → file `.geojson` con tutti i campi

---

## 6. Architettura Applicativa

### 6.1 Struttura Pagine

| Pagina | Route | Descrizione |
|---|---|---|
| Home | `/` | Redirect a Progetti |
| Progetti | `/Projects` | Lista progetti con card |
| Dettaglio Progetto | `/ProjectDetail?id=X` | Mappa interattiva con sidebar |
| Impostazioni Progetto | `/ProjectSettings?id=X` | Configurazione e gestione dati |

### 6.2 Albero Componenti

```
App
├── AuthProvider
├── QueryClientProvider
├── Router
│   ├── Layout
│   │   ├── Navigation Bar (logo, link, user menu)
│   │   └── Pages
│   │       ├── Projects
│   │       │   ├── ProjectCard (stats, azioni)
│   │       │   ├── SetupWizard (upload → config → preview)
│   │       │   └── ProjectSettingsDialog
│   │       │       ├── ImportGeoJSONModal
│   │       │       └── ImportAttivitaModal
│   │       └── ProjectDetail
│   │           └── MapView
│   │               ├── MapContainer (Leaflet)
│   │               ├── MapSidebar (filtri)
│   │               ├── MapLegend
│   │               ├── Marker Locali → LocalePopup
│   │               ├── Marker Attività → AttivitaPopup
│   │               └── StreetViewPanel
│   └── PageNotFound (404)
└── Toaster (notifiche)
```

### 6.3 Struttura File

```
/src
├── /api
│   └── base44Client.js              # Inizializzazione SDK Base44
├── /components
│   ├── /ui                           # Componenti base Radix/shadcn (50+)
│   ├── /webgis
│   │   ├── MapView.jsx               # Componente mappa principale
│   │   ├── MapSidebar.jsx            # Sidebar filtri
│   │   ├── LocalePopup.jsx           # Popup dettaglio/modifica locale
│   │   ├── AttivitaPopup.jsx         # Popup dettaglio/modifica attività
│   │   ├── StreetViewPanel.jsx       # Pannello Street View
│   │   ├── SetupWizard.jsx           # Wizard creazione progetto (3 step)
│   │   ├── FieldMapper.jsx           # Mappatura campi locali
│   │   ├── FieldMapperAttivita.jsx   # Mappatura campi attività
│   │   ├── UploadZone.jsx            # Upload drag & drop
│   │   ├── PreviewStats.jsx          # Anteprima statistiche
│   │   ├── MapLegend.jsx             # Legenda colori
│   │   └── StepIndicator.jsx         # Indicatore step wizard
│   └── /projects
│       ├── ProjectCard.jsx           # Card progetto nella lista
│       ├── ProjectSettingsDialog.jsx # Dialog impostazioni
│       ├── ImportGeoJSONModal.jsx    # Modal import locali
│       └── ImportAttivitaModal.jsx   # Wizard import attività
├── /lib
│   ├── AuthContext.jsx               # Provider autenticazione
│   ├── app-params.js                 # Caricamento configurazione
│   ├── google-config.js              # Config API Google Maps
│   ├── query-client.js               # Setup React Query
│   ├── utils.js                      # Utilità generiche
│   └── NavigationTracker.jsx         # Tracking navigazione
├── /pages
│   ├── Home.jsx                      # Redirect a Projects
│   ├── Projects.jsx                  # Lista progetti
│   ├── ProjectDetail.jsx             # Vista mappa
│   └── ProjectSettings.jsx          # Impostazioni (deprecato, usa dialog)
├── App.jsx                           # Componente root
├── Layout.jsx                        # Layout globale con navbar
├── main.jsx                          # Entry point React
├── pages.config.js                   # Configurazione route
└── index.css                         # Stili globali
```

---

## 7. Flussi Operativi

### 7.1 Creazione Progetto

```
Utente Admin
    │
    ▼
[Clicca "Nuovo Progetto"]
    │
    ▼
[Step 1: Upload GeoJSON] ─── drag & drop file
    │                         rilevamento automatico campi
    ▼
[Step 2: Configurazione] ─── mappatura campi (superficie, stato, indirizzo, ecc.)
    │                         definizione valori stato (SFITTO/OCCUPATO/ALTRI)
    ▼
[Step 3: Anteprima] ──────── statistiche (totale, sfitti, occupati, altri)
    │
    ▼
[Conferma] ────────────────── Crea Progetto + bulk insert Locali su Base44
```

### 7.2 Visualizzazione e Filtro su Mappa

```
Utente
    │
    ▼
[Apre progetto] → carica locali + attività via React Query
    │
    ▼
[Mappa si popola] → marker colorati per stato
    │
    ├── [Usa filtri sidebar] → aggiornamento marker e statistiche in tempo reale
    ├── [Pan/Zoom mappa] → ricalcolo statistiche nel viewport
    └── [Clicca marker] → popup con dettagli + opzione Street View
```

### 7.3 Modifica Dati (Admin)

```
Admin
    │
    ▼
[Clicca marker] → popup
    │
    ▼
[Clicca "Modifica"] → form inline
    │
    ▼
[Modifica campi] → salva
    │
    ▼
[Update Base44] → invalidazione query → aggiornamento mappa automatico
```

### 7.4 Import Attività Commerciali

```
Admin
    │
    ▼
[Impostazioni progetto → Tab Dati → "Importa Attività"]
    │
    ▼
[Step 1: Upload GeoJSON]
    │
    ▼
[Step 2: Mappatura campi] ─── auto-detection + personalizzazione dropdown
    │
    ▼
[Step 3: Anteprima] ──────── primi 5 record
    │
    ▼
[Step 4: Conferma] ───────── delete vecchie attività + bulk insert nuove
```

---

## 8. Gestione Dati

### 8.1 Backend (Base44)

- **Base44 SDK** fornisce API REST cloud per CRUD su tutte le entità
- Le operazioni bulk (insert/delete) sono supportate nativamente
- Nessun database locale: tutti i dati risiedono nel cloud Base44

### 8.2 Caching (React Query)

- Cache client-side con TanStack React Query
- Chiavi di query: `['locali', projectId]`, `['attivita', projectId]`, `['progetti']`
- Invalidazione immediata dopo mutazioni (`staleTime: 0`, `gcTime: 0`)
- Refetch automatico per garantire coerenza

### 8.3 Supporto GeoJSON

- **Geometrie supportate**: Point, Polygon, MultiPolygon
- **Calcolo centroide automatico** per geometrie non-Point
- **Preservazione proprietà originali** in `properties_raw`
- **Mappatura flessibile**: i nomi dei campi GeoJSON sorgente vengono mappati ai campi applicativi tramite configurazione

---

## 9. Variabili d'Ambiente

| Variabile | Descrizione | Obbligatoria |
|---|---|---|
| `VITE_BASE44_APP_ID` | ID applicazione Base44 | Sì |
| `VITE_BASE44_APP_BASE_URL` | URL backend Base44 | Sì |
| `VITE_GOOGLE_MAPS_API_KEY` | Chiave API Google Maps (per Street View) | No |
| `VITE_BASE44_FUNCTIONS_VERSION` | Versione API Base44 | No |

---

## 10. Requisiti Non Funzionali

| Requisito | Dettaglio |
|---|---|
| **Lingua** | Interfaccia interamente in italiano |
| **Responsive** | Layout adattivo (mappa full-screen su dettaglio progetto) |
| **Performance** | Statistiche calcolate solo nel viewport visibile per ottimizzare rendering |
| **Sicurezza** | Autenticazione obbligatoria, controllo ruoli admin/utente |
| **Formato date** | DD/MM/YYYY |
| **Valuta** | EUR con formattazione locale italiana |
| **Browser** | Compatibile con browser moderni (Chrome, Firefox, Edge, Safari) |

---

## 11. Dipendenze Principali

```json
{
  "react": "^18.x",
  "react-dom": "^18.x",
  "react-router-dom": "^6.x",
  "leaflet": "^1.x",
  "react-leaflet": "^4.x",
  "@tanstack/react-query": "^5.x",
  "react-hook-form": "^7.x",
  "zod": "^3.x",
  "@radix-ui/*": "varie",
  "tailwindcss": "^3.x",
  "lucide-react": "^0.x",
  "lodash": "^4.x",
  "date-fns": "^3.x",
  "vite": "^5.x"
}
```

---

*Documento generato automaticamente dall'analisi del codice sorgente del progetto Configuratore WebGIS.*
