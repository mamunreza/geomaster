import { useState, useRef, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import * as topojson from 'topojson-client';
import { countries } from '../data/countries.js';
import { countryDetails, formatPopulation, formatArea, formatDensity } from '../data/countryDetails.js';

const TOPO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json';

// ISO alpha-3 → TopoJSON numeric id (used for country highlight filter)
const ISO3_TO_NUM = {
  AFG:4,ALB:8,DZA:12,AGO:24,ARG:32,ARM:51,AUS:36,AUT:40,AZE:31,
  BHS:44,BHR:48,BGD:50,BLR:112,BEL:56,BLZ:84,BEN:204,BTN:64,BOL:68,
  BIH:70,BWA:72,BRA:76,BRN:96,BGR:100,BFA:854,BDI:108,CPV:132,KHM:116,
  CMR:120,CAN:124,CAF:140,TCD:148,CHL:152,CHN:156,COL:170,COM:174,COG:178,
  COD:180,CRI:188,CIV:384,HRV:191,CUB:192,CYP:196,CZE:203,DNK:208,DJI:262,
  DMA:212,DOM:214,ECU:218,EGY:818,SLV:222,GNQ:226,ERI:232,EST:233,SWZ:748,
  ETH:231,FJI:242,FIN:246,FRA:250,GAB:266,GMB:270,GEO:268,DEU:276,GHA:288,
  GRC:300,GRD:308,GTM:320,GIN:324,GNB:624,GUY:328,HTI:332,HND:340,HUN:348,
  ISL:352,IND:356,IDN:360,IRN:364,IRQ:368,IRL:372,ISR:376,ITA:380,JAM:388,
  JPN:392,JOR:400,KAZ:398,KEN:404,KIR:296,KWT:414,KGZ:417,LAO:418,LVA:428,
  LBN:422,LSO:426,LBR:430,LBY:434,LIE:438,LTU:440,LUX:442,MDG:450,MWI:454,
  MYS:458,MDV:462,MLI:466,MLT:470,MHL:584,MRT:478,MUS:480,MEX:484,FSM:583,
  MDA:498,MCO:492,MNG:496,MNE:499,MAR:504,MOZ:508,MMR:104,NAM:516,NRU:520,
  NPL:524,NLD:528,NZL:554,NIC:558,NER:562,NGA:566,PRK:408,MKD:807,NOR:578,
  OMN:512,PAK:586,PLW:585,PSE:275,PAN:591,PNG:598,PRY:600,PER:604,PHL:608,
  POL:616,PRT:620,QAT:634,ROU:642,RUS:643,RWA:646,KNA:659,LCA:662,VCT:670,
  WSM:882,STP:678,SAU:682,SEN:686,SRB:688,SYC:690,SLE:694,SGP:702,SVK:703,
  SVN:705,SLB:90,SOM:706,ZAF:710,SSD:728,ESP:724,LKA:144,SDN:729,SUR:740,
  SWE:752,CHE:756,SYR:760,TWN:158,TJK:762,TZA:834,THA:764,TLS:626,
  TGO:768,TON:776,TTO:780,TUN:788,TKM:795,TUV:798,UGA:800,UKR:804,ARE:784,
  GBR:826,USA:840,URY:858,UZB:860,VUT:548,VEN:862,VNM:704,YEM:887,ZMB:894,
  ZWE:716,XKX:999,SMR:674,VAT:336,AND:20,
};

// Build lookup: mapId (alpha-3) → country data
const MAPID_TO_COUNTRY = {};
for (const c of countries) MAPID_TO_COUNTRY[c.mapId] = c;

// Build lookup: numericId → country data (used to attach region/name to GeoJSON)
const NUM_TO_COUNTRY = {};
for (const [mapId, nid] of Object.entries(ISO3_TO_NUM)) {
  const c = MAPID_TO_COUNTRY[mapId];
  if (c) NUM_TO_COUNTRY[nid] = c;
}

// Soft region fill colors for the map background countries
const REGION_FILL_MAP = {
  africa:   '#fde68a',
  americas: '#bbf7d0',
  asia:     '#bfdbfe',
  europe:   '#ddd6fe',
  oceania:  '#fce7f3',
};

// Cities GeoJSON (Natural Earth 110m populated places — capitals + major world cities)
const CITIES_URL = 'https://cdn.jsdelivr.net/gh/nvkelso/natural-earth-vector@master/geojson/ne_110m_populated_places_simple.geojson';

let worldGeoCache = null;
let citiesCache   = null;

async function fetchWorldGeo() {
  if (worldGeoCache) return worldGeoCache;
  const resp = await fetch(TOPO_URL);
  const topo = await resp.json();
  const geo  = topojson.feature(topo, topo.objects.countries);
  geo.features = geo.features.map(f => {
    const nid = Number(f.id);
    const c   = NUM_TO_COUNTRY[nid];
    return { ...f, properties: { nid, region: c?.region ?? 'other', name: c?.name ?? '', mapId: c?.mapId ?? '' } };
  });
  worldGeoCache = geo;
  return geo;
}

async function fetchCities() {
  if (citiesCache) return citiesCache;
  const resp = await fetch(CITIES_URL);
  citiesCache = await resp.json();
  return citiesCache;
}

// Pre-build country centroid GeoJSON for name labels (uses hand-placed coords from countryDetails)
function buildCentroids() {
  return {
    type: 'FeatureCollection',
    features: countries.flatMap(c => {
      const d = countryDetails[c.id];
      return d ? [{ type: 'Feature', geometry: { type: 'Point', coordinates: d.coords }, properties: { name: c.name, mapId: c.mapId } }] : [];
    }),
  };
}

function REGION_LABEL(region, t) {
  const map = { africa: t('quiz.africa'), americas: t('quiz.americas'), asia: t('quiz.asia'), europe: t('quiz.europe'), oceania: t('quiz.oceania') };
  return map[region] ?? region;
}

const REGION_COLOR = {
  africa:   '#f59e0b',
  americas: '#10b981',
  asia:     '#3b82f6',
  europe:   '#8b5cf6',
  oceania:  '#ec4899',
};

function MiniMap({ mapId, coords, zoom }) {
  const containerRef = useRef(null);
  const mapRef       = useRef(null);
  const layersReady  = useRef(false);
  const nid    = ISO3_TO_NUM[mapId] ?? -1;
  const mlZoom = zoom + 0.5;

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    let destroyed = false;

    const map = new maplibregl.Map({
      container: el,
      style: {
        version: 8,
        glyphs: 'https://fonts.openmaptiles.org/{fontstack}/{range}.pbf',
        sources: {},
        layers: [{ id: 'bg', type: 'background', paint: { 'background-color': '#a8d8f0' } }],
      },
      center: coords,
      zoom: mlZoom,
      attributionControl: { compact: true },
      logoPosition: 'bottom-left',
    });

    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');
    mapRef.current = map;

    const centroids = buildCentroids();

    Promise.all([
      new Promise(res => map.once('load', res)),
      fetchWorldGeo(),
      fetchCities(),
    ]).then(([, geo, cities]) => {
      if (destroyed) return;

      // ── Country fills (region-based palette) ──────────────────────────────
      map.addSource('world', { type: 'geojson', data: geo });

      map.addLayer({
        id: 'land',
        type: 'fill',
        source: 'world',
        paint: {
          'fill-color': ['match', ['get', 'region'],
            'africa',   REGION_FILL_MAP.africa,
            'americas', REGION_FILL_MAP.americas,
            'asia',     REGION_FILL_MAP.asia,
            'europe',   REGION_FILL_MAP.europe,
            'oceania',  REGION_FILL_MAP.oceania,
            '#e2e8f0'],
          'fill-opacity': 0.9,
        },
      });

      // ── Target country highlight ──────────────────────────────────────────
      map.addLayer({
        id: 'highlight',
        type: 'fill',
        source: 'world',
        filter: ['==', ['get', 'nid'], nid],
        paint: { 'fill-color': '#a855f7', 'fill-opacity': 0.92 },
      });

      // ── Borders ───────────────────────────────────────────────────────────
      map.addLayer({
        id: 'borders',
        type: 'line',
        source: 'world',
        paint: { 'line-color': '#ffffff', 'line-width': 0.6 },
      });

      // ── Target country border (thicker, dark purple) ──────────────────────
      map.addLayer({
        id: 'highlight-border',
        type: 'line',
        source: 'world',
        filter: ['==', ['get', 'nid'], nid],
        paint: { 'line-color': '#6d28d9', 'line-width': 2.5, 'line-gap-width': 0 },
      });

      // ── Neighbour country name labels (bold, prominent) ──────────────────
      map.addSource('centroids', { type: 'geojson', data: centroids });

      map.addLayer({
        id: 'country-labels',
        type: 'symbol',
        source: 'centroids',
        filter: ['!=', ['get', 'mapId'], mapId],
        layout: {
          'text-field': ['get', 'name'],
          'text-font': ['Open Sans Bold'],
          'text-size': ['interpolate', ['linear'], ['zoom'], 1, 10, 5, 14],
          'text-max-width': 7,
          'text-letter-spacing': 0.03,
          'text-allow-overlap': false,
          'symbol-sort-key': 1,
        },
        paint: {
          'text-color': '#1e293b',
          'text-halo-color': 'rgba(255,255,255,0.92)',
          'text-halo-width': 2,
        },
      });

      // ── Selected country name label (largest, always on top) ─────────────
      map.addLayer({
        id: 'highlight-label',
        type: 'symbol',
        source: 'centroids',
        filter: ['==', ['get', 'mapId'], mapId],
        layout: {
          'text-field': ['get', 'name'],
          'text-font': ['Open Sans Bold'],
          'text-size': ['interpolate', ['linear'], ['zoom'], 1, 13, 6, 20],
          'text-max-width': 8,
          'text-allow-overlap': true,
          'symbol-sort-key': 0,
        },
        paint: {
          'text-color': '#ffffff',
          'text-halo-color': '#5b21b6',
          'text-halo-width': 2.5,
        },
      });

      // ── Cities ────────────────────────────────────────────────────────────
      map.addSource('cities', { type: 'geojson', data: cities });

      // Capital dots (golden, shown from low zoom)
      map.addLayer({
        id: 'capital-dots',
        type: 'circle',
        source: 'cities',
        minzoom: 1.5,
        filter: ['==', ['get', 'featurecla'], 'Admin-0 capital'],
        paint: {
          'circle-radius': ['interpolate', ['linear'], ['zoom'], 2, 3, 9, 6],
          'circle-color': '#fbbf24',
          'circle-stroke-color': '#78350f',
          'circle-stroke-width': 1.5,
        },
      });

      // Other major city dots (appear on zoom-in)
      map.addLayer({
        id: 'city-dots',
        type: 'circle',
        source: 'cities',
        minzoom: 4,
        filter: ['all',
          ['!=', ['get', 'featurecla'], 'Admin-0 capital'],
          ['>', ['get', 'pop_max'], 300000],
        ],
        paint: {
          'circle-radius': ['interpolate', ['linear'], ['zoom'], 4, 2, 9, 4],
          'circle-color': '#f1f5f9',
          'circle-stroke-color': '#475569',
          'circle-stroke-width': 1,
        },
      });

      // Capital labels (regular, smaller — subordinate to country names)
      map.addLayer({
        id: 'capital-labels',
        type: 'symbol',
        source: 'cities',
        minzoom: 2,
        filter: ['==', ['get', 'featurecla'], 'Admin-0 capital'],
        layout: {
          'text-field': ['get', 'name'],
          'text-font': ['Open Sans Regular'],
          'text-size': ['interpolate', ['linear'], ['zoom'], 2, 7, 9, 11],
          'text-anchor': 'left',
          'text-offset': [0.5, 0],
          'text-allow-overlap': false,
          'symbol-sort-key': 2,
        },
        paint: {
          'text-color': '#92400e',
          'text-halo-color': 'rgba(255,255,255,0.92)',
          'text-halo-width': 1.5,
        },
      });

      // Other city labels (appear on zoom-in)
      map.addLayer({
        id: 'city-labels',
        type: 'symbol',
        source: 'cities',
        minzoom: 5,
        filter: ['all',
          ['!=', ['get', 'featurecla'], 'Admin-0 capital'],
          ['>', ['get', 'pop_max'], 300000],
        ],
        layout: {
          'text-field': ['get', 'name'],
          'text-font': ['Open Sans Regular'],
          'text-size': ['interpolate', ['linear'], ['zoom'], 5, 9, 9, 13],
          'text-anchor': 'left',
          'text-offset': [0.4, 0],
          'text-allow-overlap': false,
        },
        paint: {
          'text-color': '#1e293b',
          'text-halo-color': 'rgba(255,255,255,0.9)',
          'text-halo-width': 1.5,
        },
      });

      layersReady.current = true;
    });

    return () => {
      destroyed = true;
      layersReady.current = false;
      mapRef.current = null;
      map.remove();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update highlight and fly to new country when selection changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !layersReady.current) return;
    map.flyTo({ center: coords, zoom: mlZoom, duration: 700 });
    map.setFilter('highlight',       ['==', ['get', 'nid'],   nid]);
    map.setFilter('highlight-border',['==', ['get', 'nid'],   nid]);
    map.setFilter('highlight-label', ['==', ['get', 'mapId'], mapId]);
    map.setFilter('country-labels',  ['!=', ['get', 'mapId'], mapId]);
  }, [mapId, coords, mlZoom, nid]);

  return (
    <div
      ref={containerRef}
      style={{ width: '100%', height: 280, borderRadius: 8, overflow: 'hidden' }}
    />
  );
}

function InfoCard({ title, icon, children, accent }) {
  return (
    <div style={{
      background: '#fff',
      borderRadius: 14,
      border: `1.5px solid ${accent}30`,
      padding: '1.25rem',
      boxShadow: `0 4px 20px ${accent}18`,
      display: 'flex',
      flexDirection: 'column',
      gap: '0.65rem',
      height: '100%',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: `2px solid ${accent}25`, paddingBottom: '0.6rem' }}>
        <span style={{ fontSize: '1.1rem' }}>{icon}</span>
        <span style={{ fontWeight: 800, fontSize: '0.85rem', color: accent, letterSpacing: '0.02em', textTransform: 'uppercase' }}>{title}</span>
      </div>
      {children}
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.875rem' }}>
      <span style={{ color: '#7c3aed', fontWeight: 600, flexShrink: 0 }}>{label}</span>
      <span style={{ color: '#3b0764', fontWeight: 700, textAlign: 'right' }}>{value}</span>
    </div>
  );
}

function CountryInfoPanel({ country, t, lang }) {
  const details = countryDetails[country.id];
  if (!details) return null;

  const translatedName = t(`countries.${country.id}`, { defaultValue: country.name });
  const translatedCapital = t(`capitals.${country.id}`, { defaultValue: country.capital });
  // Pick facts for the active language; fall back to English
  const facts = Array.isArray(details.known) ? details.known : (details.known[lang] ?? details.known.en);

  return (
    <div className="fade-in" style={{ padding: '1.25rem 0 0' }}>
      {/* Country header — single row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem', marginBottom: '1.25rem', padding: '0.6rem 1rem', background: 'rgba(255,255,255,0.6)', borderRadius: 14, backdropFilter: 'blur(8px)', boxShadow: '0 2px 12px rgba(168,85,247,0.12)' }}>
        <img
          src={`https://flagcdn.com/w80/${country.id}.png`}
          alt={country.name}
          style={{ height: 36, borderRadius: 5, boxShadow: '0 2px 8px rgba(0,0,0,0.18)', flexShrink: 0 }}
          onError={e => { e.target.style.display = 'none'; }}
        />
        <h2 style={{ fontSize: 'clamp(1.1rem, 2.5vw, 1.5rem)', fontWeight: 900, background: 'linear-gradient(135deg, #7c3aed, #a855f7, #38bdf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0, lineHeight: 1.2 }}>
          {translatedName}
        </h2>
        <span style={{ background: '#f3e8ff', color: '#7c3aed', padding: '0.2rem 0.7rem', borderRadius: 20, fontSize: '0.75rem', fontWeight: 700, flexShrink: 0 }}>
          {REGION_LABEL(country.region, t)}
        </span>
      </div>

      {/* 3-column grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
        {/* Col 1 — Basic Info */}
        <InfoCard title={t('countryInfo.basicInfo')} icon="🌐" accent="#a855f7">
          <Row label={t('countryInfo.capital')} value={translatedCapital} />
          <Row label={t('countryInfo.region')} value={REGION_LABEL(country.region, t)} />
          <Row label={t('countryInfo.currency')} value={details.currency} />
          <Row label={t('countryInfo.languages')} value={details.languages.join(', ')} />
          <Row label={t('countryInfo.area')} value={formatArea(details.area)} />
        </InfoCard>

        {/* Col 2 — Demographics + Mini Map */}
        <InfoCard title={t('countryInfo.demographics')} icon="👥" accent="#38bdf8">
          <Row label={t('countryInfo.population')} value={formatPopulation(details.pop)} />
          <Row label={t('countryInfo.density')} value={formatDensity(details.pop, details.area)} />
          <div style={{ marginTop: '0.5rem' }}>
            <MiniMap mapId={country.mapId} coords={details.coords} zoom={details.zoom} />
          </div>
        </InfoCard>

        {/* Col 3 — Known For */}
        <InfoCard title={t('countryInfo.knownFor')} icon="⭐" accent="#f59e0b">
          {facts.map((fact, i) => (
            <div key={i} style={{ display: 'flex', gap: '0.6rem', alignItems: 'flex-start' }}>
              <span style={{ color: '#f59e0b', fontWeight: 800, fontSize: '1rem', marginTop: '0.05rem', flexShrink: 0 }}>{i + 1}.</span>
              <span style={{ fontSize: '0.87rem', color: '#3b0764', lineHeight: 1.5 }}>{fact}</span>
            </div>
          ))}
        </InfoCard>
      </div>
    </div>
  );
}

export default function CountrySearch() {
  const { t, i18n } = useTranslation();
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(null);
  const [open, setOpen] = useState(false);
  const [closing, setClosing] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);
  const inputRef = useRef(null);
  const listRef = useRef(null);
  const closeTimerRef = useRef(null);
  const selectedRef = useRef(null);
  selectedRef.current = selected;

  const filtered = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return countries.filter(c => {
      const localName = t(`countries.${c.id}`, { defaultValue: c.name }).toLowerCase();
      return localName.startsWith(q) || c.name.toLowerCase().startsWith(q) ||
             localName.includes(q) || c.name.toLowerCase().includes(q);
    }).slice(0, 8);
  }, [query, t]);

  // Sync query text to new language when a country is already selected
  useEffect(() => {
    if (selectedRef.current) {
      const c = selectedRef.current;
      setQuery(t(`countries.${c.id}`, { defaultValue: c.name }));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i18n.language]);

  useEffect(() => {
    if (filtered.length > 0 && !selectedRef.current) {
      setClosing(false);
      setOpen(true);
    } else if (filtered.length === 0) {
      setOpen(false);
      setClosing(false);
    }
    setActiveIdx(-1);
  }, [filtered]);

  function closeDropdown() {
    setClosing(true);
    clearTimeout(closeTimerRef.current);
    closeTimerRef.current = setTimeout(() => {
      setOpen(false);
      setClosing(false);
    }, 280);
  }

  function selectCountry(c) {
    setSelected(c);
    setQuery(t(`countries.${c.id}`, { defaultValue: c.name }));
    closeDropdown();
    inputRef.current?.blur();
  }

  function handleKey(e) {
    if (!open) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIdx(i => Math.min(i + 1, filtered.length - 1)); }
    if (e.key === 'ArrowUp')   { e.preventDefault(); setActiveIdx(i => Math.max(i - 1, 0)); }
    if (e.key === 'Enter' && activeIdx >= 0) { e.preventDefault(); selectCountry(filtered[activeIdx]); }
    if (e.key === 'Escape') { closeDropdown(); }
  }

  function handleClear() {
    setQuery('');
    setSelected(null);
    setOpen(false);
    inputRef.current?.focus();
  }

  return (
    <div>
      {/* Search hero */}
      <section style={{
        background: 'linear-gradient(160deg, #fdf4ff 0%, #ede9fe 40%, #e0f2fe 100%)',
        padding: selected ? '2.5rem 1rem 2rem' : '3.5rem 1rem 3rem',
        position: 'relative',
        transition: 'padding 0.3s ease',
      }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle at 20% 30%, rgba(168,85,247,0.15) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(56,189,248,0.15) 0%, transparent 50%)' }} />
        <div className="container" style={{ position: 'relative', maxWidth: 720 }}>
          {!selected && (
            <>
              <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
                <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🌍</div>
                <h1 style={{ fontSize: 'clamp(1.5rem, 3.5vw, 2.4rem)', fontWeight: 900, background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 50%, #38bdf8 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '0.4rem' }}>
                  {t('countryInfo.searchTitle')}
                </h1>
                <p style={{ color: '#7c3aed', fontSize: '0.95rem', fontWeight: 600 }}>{t('countryInfo.searchSubtitle')}</p>
              </div>
            </>
          )}

          {/* Search input */}
          <div style={{ position: 'relative' }}>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <span style={{ position: 'absolute', left: '1rem', fontSize: '1.2rem', pointerEvents: 'none', zIndex: 1 }}>🔍</span>
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={e => { setQuery(e.target.value); if (selected) setSelected(null); }}
                onFocus={() => filtered.length > 0 && setOpen(true)}
                onKeyDown={handleKey}
                placeholder={t('countryInfo.searchPlaceholder')}
                aria-label={t('countryInfo.searchPlaceholder')}
                aria-autocomplete="list"
                aria-expanded={open}
                style={{
                  width: '100%',
                  padding: '0.95rem 3rem 0.95rem 3.2rem',
                  borderRadius: 50,
                  border: '2.5px solid #d8b4fe',
                  fontSize: '1rem',
                  fontFamily: 'inherit',
                  fontWeight: 600,
                  background: '#ffffff',
                  color: '#3b0764',
                  boxShadow: '0 4px 24px rgba(168,85,247,0.18)',
                  outline: 'none',
                  transition: 'border-color 0.2s, box-shadow 0.2s',
                }}
                onFocusCapture={e => { e.target.style.borderColor = '#a855f7'; e.target.style.boxShadow = '0 4px 32px rgba(168,85,247,0.3)'; }}
                onBlurCapture={e => { e.target.style.borderColor = '#d8b4fe'; e.target.style.boxShadow = '0 4px 24px rgba(168,85,247,0.18)'; }}
              />
              {query && (
                <button onClick={handleClear} aria-label="Clear" style={{ position: 'absolute', right: '1rem', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.1rem', color: '#a78bfa', padding: '0.25rem' }}>✕</button>
              )}
            </div>

            {/* Autocomplete dropdown */}
            {open && (
              <ul
                ref={listRef}
                role="listbox"
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 6px)',
                  left: 0,
                  right: 0,
                  background: '#fff',
                  borderRadius: 14,
                  border: '2px solid #e9d5ff',
                  boxShadow: '0 8px 32px rgba(168,85,247,0.22)',
                  zIndex: 200,
                  maxHeight: 320,
                  overflowY: 'auto',
                  padding: '0.4rem 0',
                  margin: 0,
                  listStyle: 'none',
                  animation: closing ? 'dropdownFadeOut 0.28s ease forwards' : 'dropdownFadeIn 0.18s ease',
                }}
              >
                {filtered.map((c, i) => (
                  <li
                    key={c.id}
                    role="option"
                    aria-selected={i === activeIdx}
                    onMouseDown={() => selectCountry(c)}
                    onMouseEnter={() => setActiveIdx(i)}
                    style={{
                      padding: '0.6rem 1rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      background: i === activeIdx ? '#f3e8ff' : 'transparent',
                      transition: 'background 0.15s',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 700, color: '#3b0764', fontSize: '0.9rem' }}>
                        {t(`countries.${c.id}`, { defaultValue: c.name })}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#7c3aed' }}>
                        {t(`capitals.${c.id}`, { defaultValue: c.capital })} · {REGION_LABEL(c.region, t)}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Country info panel (inside hero when selected) */}
          {selected && <CountryInfoPanel country={selected} t={t} lang={i18n.language} />}
        </div>
      </section>
    </div>
  );
}
