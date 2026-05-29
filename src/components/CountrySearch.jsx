import { useState, useRef, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ComposableMap, Geographies, Geography, ZoomableGroup } from 'react-simple-maps';
import { countries } from '../data/countries.js';
import { countryDetails, formatPopulation, formatArea, formatDensity } from '../data/countryDetails.js';

const GEO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';

// ISO alpha-3 → TopoJSON numeric id
const ISO3_TO_NUM = {
  AFG:'004',ALB:'008',DZA:'012',AGO:'024',ARG:'032',ARM:'051',AUS:'036',AUT:'040',AZE:'031',
  BHS:'044',BHR:'048',BGD:'050',BLR:'112',BEL:'056',BLZ:'084',BEN:'204',BTN:'064',BOL:'068',
  BIH:'070',BWA:'072',BRA:'076',BRN:'096',BGR:'100',BFA:'854',BDI:'108',CPV:'132',KHM:'116',
  CMR:'120',CAN:'124',CAF:'140',TCD:'148',CHL:'152',CHN:'156',COL:'170',COM:'174',COG:'178',
  COD:'180',CRI:'188',CIV:'384',HRV:'191',CUB:'192',CYP:'196',CZE:'203',DNK:'208',DJI:'262',
  DMA:'212',DOM:'214',ECU:'218',EGY:'818',SLV:'222',GNQ:'226',ERI:'232',EST:'233',SWZ:'748',
  ETH:'231',FJI:'242',FIN:'246',FRA:'250',GAB:'266',GMB:'270',GEO:'268',DEU:'276',GHA:'288',
  GRC:'300',GRD:'308',GTM:'320',GIN:'324',GNB:'624',GUY:'328',HTI:'332',HND:'340',HUN:'348',
  ISL:'352',IND:'356',IDN:'360',IRN:'364',IRQ:'368',IRL:'372',ISR:'376',ITA:'380',JAM:'388',
  JPN:'392',JOR:'400',KAZ:'398',KEN:'404',KIR:'296',KWT:'414',KGZ:'417',LAO:'418',LVA:'428',
  LBN:'422',LSO:'426',LBR:'430',LBY:'434',LIE:'438',LTU:'440',LUX:'442',MDG:'450',MWI:'454',
  MYS:'458',MDV:'462',MLI:'466',MLT:'470',MHL:'584',MRT:'478',MUS:'480',MEX:'484',FSM:'583',
  MDA:'498',MCO:'492',MNG:'496',MNE:'499',MAR:'504',MOZ:'508',MMR:'104',NAM:'516',NRU:'520',
  NPL:'524',NLD:'528',NZL:'554',NIC:'558',NER:'562',NGA:'566',PRK:'408',MKD:'807',NOR:'578',
  OMN:'512',PAK:'586',PLW:'585',PSE:'275',PAN:'591',PNG:'598',PRY:'600',PER:'604',PHL:'608',
  POL:'616',PRT:'620',QAT:'634',ROU:'642',RUS:'643',RWA:'646',KNA:'659',LCA:'662',VCT:'670',
  WSM:'882',STP:'678',SAU:'682',SEN:'686',SRB:'688',SYC:'690',SLE:'694',SGP:'702',SVK:'703',
  SVN:'705',SLB:'090',SOM:'706',ZAF:'710',SSD:'728',ESP:'724',LKA:'144',SDN:'729',SUR:'740',
  SWZ:'748',SWE:'752',CHE:'756',SYR:'760',TWN:'158',TJK:'762',TZA:'834',THA:'764',TLS:'626',
  TGO:'768',TON:'776',TTO:'780',TUN:'788',TKM:'795',TUV:'798',UGA:'800',UKR:'804',ARE:'784',
  GBR:'826',USA:'840',URY:'858',UZB:'860',VUT:'548',VEN:'862',VNM:'704',YEM:'887',ZMB:'894',
  ZWE:'716',XKX:'999',SMR:'674',VAT:'336',AND:'020',MCO:'492',LIE:'438',
};

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
  const numericId = ISO3_TO_NUM[mapId] ?? null;
  return (
    <div style={{ borderRadius: 8, overflow: 'hidden', background: '#e0f2fe', lineHeight: 0 }}>
      <ComposableMap
        projection="geoMercator"
        width={340}
        height={210}
        style={{ width: '100%', height: 'auto', display: 'block' }}
      >
        <ZoomableGroup center={coords} zoom={zoom} filterZoomEvent={() => false}>
          <Geographies geography={GEO_URL}>
            {({ geographies }) =>
              geographies.map((geo) => (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill={geo.id === numericId ? '#a855f7' : '#bfdbfe'}
                  stroke="#ffffff"
                  strokeWidth={0.4}
                  style={{ default: { outline: 'none' }, hover: { outline: 'none' }, pressed: { outline: 'none' } }}
                />
              ))
            }
          </Geographies>
        </ZoomableGroup>
      </ComposableMap>
    </div>
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
    <div className="fade-in" style={{ padding: '1.5rem 0 0' }}>
      {/* Country header */}
      <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
        <img
          src={`https://flagcdn.com/w80/${country.id}.png`}
          alt={country.name}
          style={{ height: 52, borderRadius: 6, boxShadow: '0 2px 12px rgba(0,0,0,0.18)', marginBottom: '0.6rem', display: 'inline-block' }}
          onError={e => { e.target.style.display = 'none'; }}
        />
        <h2 style={{ fontSize: 'clamp(1.3rem, 3vw, 2rem)', fontWeight: 900, background: 'linear-gradient(135deg, #7c3aed, #a855f7, #38bdf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '0.2rem' }}>
          {translatedName}
        </h2>
        <span style={{ background: '#f3e8ff', color: '#7c3aed', padding: '0.2rem 0.75rem', borderRadius: 20, fontSize: '0.78rem', fontWeight: 700 }}>
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
  const [activeIdx, setActiveIdx] = useState(-1);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  const filtered = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return countries.filter(c => {
      const localName = t(`countries.${c.id}`, { defaultValue: c.name }).toLowerCase();
      return localName.startsWith(q) || c.name.toLowerCase().startsWith(q) ||
             localName.includes(q) || c.name.toLowerCase().includes(q);
    }).slice(0, 8);
  }, [query, t]);

  useEffect(() => {
    setOpen(filtered.length > 0);
    setActiveIdx(-1);
  }, [filtered]);

  function selectCountry(c) {
    setSelected(c);
    setQuery(t(`countries.${c.id}`, { defaultValue: c.name }));
    setOpen(false);
    inputRef.current?.blur();
  }

  function handleKey(e) {
    if (!open) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIdx(i => Math.min(i + 1, filtered.length - 1)); }
    if (e.key === 'ArrowUp')   { e.preventDefault(); setActiveIdx(i => Math.max(i - 1, 0)); }
    if (e.key === 'Enter' && activeIdx >= 0) { e.preventDefault(); selectCountry(filtered[activeIdx]); }
    if (e.key === 'Escape') { setOpen(false); }
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
