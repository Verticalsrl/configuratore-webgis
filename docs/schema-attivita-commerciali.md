# Schema AttivitaCommerciale

## Entità Base44: AttivitaCommerciale

Schema per l'import e gestione delle attività commerciali in formato GeoJSON.

### Campi Principali

| Campo | Tipo | Descrizione | Obbligatorio |
|-------|------|-------------|--------------|
| `id` | String | ID univoco generato automaticamente | Sì (auto) |
| `project_id` | String | FK al Progetto di appartenenza | Sì |
| `created_date` | Timestamp | Data di creazione | Sì (auto) |

### Campi Anagrafica Attività

| Campo | Tipo | Descrizione | Obbligatorio |
|-------|------|-------------|--------------|
| `ragione_sociale` | String | Ragione sociale dell'attività | No |
| `partita_iva` | String | Partita IVA | No |
| `codice_fiscale` | String | Codice fiscale | No |
| `natura_giuridica` | String | Natura giuridica (SRL, SPA, etc.) | No |
| `pmi` | String | Indicatore PMI (Piccola/Media Impresa) | No |

### Campi Attività Economica

| Campo | Tipo | Descrizione | Obbligatorio |
|-------|------|-------------|--------------|
| `mestiere` | String | Tipologia di mestiere/attività | No |
| `descrizione_mestiere` | String | Descrizione dettagliata del mestiere | No |
| `ateco2025` | String | Codice ATECO 2025 | No |
| `descrizione_ateco` | String | Descrizione del codice ATECO | No |

### Campi Indirizzo

| Campo | Tipo | Descrizione | Obbligatorio |
|-------|------|-------------|--------------|
| `strada` | String | Nome della via | No |
| `civico` | String | Numero civico | No |
| `frazione` | String | Frazione | No |
| `comune` | String | Comune | No |
| `cap` | String | Codice Avviamento Postale | No |
| `provincia` | String | Provincia | No |
| `regione` | String | Regione | No |
| `prov_sede_legale` | String | Provincia della sede legale | No |

### Campi Geografici

| Campo | Tipo | Descrizione | Obbligatorio |
|-------|------|-------------|--------------|
| `latitudine` | Number | Latitudine WGS84 | No |
| `longitudine` | Number | Longitudine WGS84 | No |
| `coordinates` | Array[Number] | [longitude, latitude] per mappa | Sì |
| `geometry` | Object | Geometria GeoJSON completa | No |

### Campi Metadata

| Campo | Tipo | Descrizione | Obbligatorio |
|-------|------|-------------|--------------|
| `properties_raw` | Object | Tutte le proprietà originali del GeoJSON | No |

## Configurazione Mapping

L'entità supporta configurazione flessibile dei campi tramite il wizard di import:

```javascript
{
  campo_id: string,              // Campo GeoJSON per ID
  campo_strada: string,          // Campo GeoJSON per strada
  campo_civico: string,          // Campo GeoJSON per civico
  campo_frazione: string,        // Campo GeoJSON per frazione
  campo_comune: string,          // Campo GeoJSON per comune
  campo_cap: string,             // Campo GeoJSON per CAP
  campo_provincia: string,       // Campo GeoJSON per provincia
  campo_regione: string,         // Campo GeoJSON per regione
  campo_latitudine: string,      // Campo GeoJSON per latitudine
  campo_longitudine: string,     // Campo GeoJSON per longitudine
  campo_codice_fiscale: string,  // Campo GeoJSON per CF
  campo_prov_sede_legale: string,// Campo GeoJSON per provincia sede
  campo_ragione_sociale: string, // Campo GeoJSON per ragione sociale
  campo_partita_iva: string,     // Campo GeoJSON per P.IVA
  campo_natura_giuridica: string,// Campo GeoJSON per natura giuridica
  campo_pmi: string,             // Campo GeoJSON per PMI
  campo_mestiere: string,        // Campo GeoJSON per mestiere
  campo_descrizione_mestiere: string, // Campo GeoJSON per descrizione mestiere
  campo_ateco: string,           // Campo GeoJSON per codice ATECO
  campo_descrizione_ateco: string // Campo GeoJSON per descrizione ATECO
}
```

## Note di Implementazione

1. **Coordinate**: Se presenti `latitudine` e `longitudine` nel GeoJSON, vengono usate per creare il campo `coordinates` [lng, lat]
2. **Geometry**: Se il GeoJSON contiene geometrie (Point, Polygon, etc.), vengono salvate nel campo `geometry`
3. **Centroid**: Per geometrie non-Point, viene calcolato il centroide per il campo `coordinates`
4. **Properties Raw**: Tutte le proprietà originali vengono preservate in `properties_raw` per future elaborazioni

## Esempio GeoJSON di Input

```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [12.4964, 41.9028]
      },
      "properties": {
        "ID": "1",
        "STRADA": "Via Roma",
        "CIVICO": "10",
        "COMUNE": "Roma",
        "CAP": "00100",
        "PROVINCIA": "RM",
        "REGIONE": "Lazio",
        "LATITUDINE": 41.9028,
        "LONGITUDINE": 12.4964,
        "RAGIONE_SOCIALE": "Bar Centrale S.r.l.",
        "PARTITA_IVA": "12345678901",
        "CODICE_FISCALE": "RSSMRA80A01H501U",
        "NATURA_GIURIDICA": "SRL",
        "MESTIERE": "Bar",
        "ATECO2025": "56.30.00"
      }
    }
  ]
}
```

## Configurazione Entità Base44

Per creare l'entità nel pannello Base44:

1. Accedere al pannello amministrativo Base44
2. Creare nuova entità "AttivitaCommerciale"
3. Aggiungere i campi secondo lo schema sopra
4. Configurare le relazioni:
   - `project_id` → FK verso `Progetto`
