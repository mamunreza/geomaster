import { useState, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ComposableMap, Geographies, Geography, ZoomableGroup } from 'react-simple-maps';
import { generateQuizQuestions, getCountriesByRegion } from '../data/countries.js';
import { shuffle } from '../data/countries.js';
import QuizTimer from '../components/QuizTimer.jsx';
import ResultsScreen from '../components/ResultsScreen.jsx';
import QuizSettings from '../components/QuizSettings.jsx';

const GEO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';
const DEFAULT_SETTINGS = { difficulty: 'medium', region: 'all', count: 10, timeLimit: 20 };
const STATES = { IDLE: 'idle', PLAYING: 'playing', ANSWER: 'answer', FINISHED: 'finished' };

// Map ISO alpha-3 to numeric codes used by TopoJSON
const ISO3_TO_NUMERIC = {
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
  WSM:'882',SMR:'674',STP:'678',SAU:'682',SEN:'686',SRB:'688',SYC:'690',SLE:'694',SGP:'702',
  SVK:'703',SVN:'705',SLB:'090',SOM:'706',ZAF:'710',SSD:'728',ESP:'724',LKA:'144',SDN:'729',
  SUR:'740',SWE:'752',CHE:'756',SYR:'760',TWN:'158',TJK:'762',TZA:'834',THA:'764',TLS:'626',
  TGO:'768',TON:'776',TTO:'780',TUN:'788',TUR:'792',TKM:'795',TUV:'798',UGA:'800',UKR:'804',
  ARE:'784',GBR:'826',USA:'840',URY:'858',UZB:'860',VUT:'548',VEN:'862',VNM:'704',YEM:'887',
  ZMB:'894',ZWE:'716',
};

export default function MapQuiz() {
  const { t } = useTranslation();
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [gameState, setGameState] = useState(STATES.IDLE);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [results, setResults] = useState([]);
  const [clickedId, setClickedId] = useState(null);
  const [timeLeft, setTimeLeft] = useState(DEFAULT_SETTINGS.timeLimit);
  const timerRef = useState(null);

  const startTimer = useCallback((limit) => {
    if (timerRef[0]) clearInterval(timerRef[0]);
    setTimeLeft(limit);
    timerRef[0] = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) { clearInterval(timerRef[0]); handleTimeout(); return 0; }
        return t - 1;
      });
    }, 1000);
  }, []);

  const handleTimeout = () => {
    setResults((r) => [...r, { correct: false, timedOut: true }]);
    setGameState(STATES.ANSWER);
    setClickedId('__timeout__');
  };

  const startGame = () => {
    const qs = generateQuizQuestions(settings.region, settings.count, 'map');
    setQuestions(qs);
    setCurrentIndex(0);
    setResults([]);
    setClickedId(null);
    setGameState(STATES.PLAYING);
    startTimer(settings.timeLimit);
  };

  const handleCountryClick = (geo) => {
    if (gameState !== STATES.PLAYING) return;
    clearInterval(timerRef[0]);
    const clickedNumeric = geo.id;
    const correct = questions[currentIndex]?.correct;
    const correctNumeric = ISO3_TO_NUMERIC[correct?.mapId];
    const isCorrect = clickedNumeric === correctNumeric;
    setClickedId(clickedNumeric);
    setResults((r) => [...r, { correct: isCorrect, clickedId: clickedNumeric, correctId: correctNumeric }]);
    setGameState(STATES.ANSWER);
  };

  const next = () => {
    const nextIdx = currentIndex + 1;
    setClickedId(null);
    if (nextIdx >= questions.length) { setGameState(STATES.FINISHED); }
    else { setCurrentIndex(nextIdx); setGameState(STATES.PLAYING); startTimer(settings.timeLimit); }
  };

  const reset = () => { if (timerRef[0]) clearInterval(timerRef[0]); setGameState(STATES.IDLE); setQuestions([]); setResults([]); setCurrentIndex(0); setClickedId(null); };

  const correctCount = results.filter((r) => r.correct).length;
  const score = results.reduce((acc, r) => acc + (r.correct ? 150 : 0), 0);
  const accuracy = results.length ? Math.round((correctCount / results.length) * 100) : 0;

  const currentCountry = questions[currentIndex]?.correct;
  const correctNumericId = currentCountry ? ISO3_TO_NUMERIC[currentCountry.mapId] : null;
  const lastResult = results[results.length - 1];

  if (gameState === STATES.IDLE) {
    return (
      <div className="page">
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <div style={{ fontSize: '2.25rem', marginBottom: '0.4rem' }}>🗺️</div>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 800 }}>{t('games.mapQuiz.title')}</h1>
            <p style={{ color: 'var(--text-muted)', marginTop: '0.4rem' }}>{t('games.mapQuiz.description')}</p>
          </div>
          <QuizSettings settings={settings} onChange={setSettings} onStart={startGame} />
        </div>
      </div>
    );
  }

  if (gameState === STATES.FINISHED) {
    return (
      <div className="page">
        <div className="container">
          <ResultsScreen score={score} correct={correctCount} total={questions.length} accuracy={accuracy} gameType="Map Quiz" onPlayAgain={reset} />
        </div>
      </div>
    );
  }

  return (
    <div className="page" style={{ padding: '1rem' }}>
      <div className="container" style={{ maxWidth: '900px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
          <div style={{ fontWeight: 600, color: 'var(--text-muted)' }}>{t('quiz.question')} {currentIndex + 1} {t('quiz.of')} {questions.length}</div>
          <QuizTimer timeLeft={timeLeft} total={settings.timeLimit} />
          <div style={{ fontWeight: 700, color: 'var(--accent)' }}>⭐ {score}</div>
        </div>

        <div className="progress-bar" style={{ marginBottom: '1rem' }}>
          <div className="progress-fill" style={{ width: `${(currentIndex / questions.length) * 100}%` }} />
        </div>

        {/* Target */}
        {currentCountry && (
          <div style={{ textAlign: 'center', marginBottom: '0.6rem', padding: '0.55rem 0.75rem', background: 'var(--bg-card)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{t('quiz.findCountry')}</p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.55rem', marginTop: '0.3rem' }}>
              <span style={{ fontSize: '1.5rem' }}>{currentCountry.flag}</span>
              <span style={{ fontSize: '1.1rem', fontWeight: 800 }}>{currentCountry.name}</span>
            </div>
          </div>
        )}

        {/* Map */}
        <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius)', border: '1px solid var(--border)', overflow: 'hidden', cursor: gameState === STATES.PLAYING ? 'crosshair' : 'default' }}>
          <ComposableMap style={{ width: '100%', height: 'auto' }} projectionConfig={{ scale: 140 }}>
            <ZoomableGroup zoom={1} minZoom={1} maxZoom={6}>
              <Geographies geography={GEO_URL}>
                {({ geographies }) =>
                  geographies.map((geo) => {
                    const isCorrect = geo.id === correctNumericId;
                    const isClicked = geo.id === clickedId;
                    let fill = '#1e3a5f';
                    if (gameState === STATES.ANSWER) {
                      if (isCorrect) fill = '#10b981';
                      else if (isClicked) fill = '#ef4444';
                    }
                    return (
                      <Geography key={geo.rsmKey} geography={geo}
                        onClick={() => handleCountryClick(geo)}
                        style={{
                          default: { fill, stroke: '#334155', strokeWidth: 0.5, outline: 'none' },
                          hover: { fill: gameState === STATES.PLAYING ? '#4f46e5' : fill, stroke: '#6366f1', strokeWidth: 0.8, outline: 'none' },
                          pressed: { fill: '#3730a3', outline: 'none' },
                        }}
                      />
                    );
                  })
                }
              </Geographies>
            </ZoomableGroup>
          </ComposableMap>
        </div>

        {/* Feedback */}
        {gameState === STATES.ANSWER && (
          <div style={{ marginTop: '0.55rem', padding: '0.55rem 0.75rem', borderRadius: 'var(--radius-sm)', background: lastResult?.correct ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ color: lastResult?.correct ? 'var(--success)' : 'var(--danger)', fontWeight: 600 }}>
              {lastResult?.correct ? `✅ ${t('quiz.correct')}` : lastResult?.timedOut ? `⏰ Time's up! — ${currentCountry?.name}` : `❌ ${t('quiz.wrong')} — ${t('quiz.theAnswerIs')}: ${currentCountry?.name}`}
            </span>
            <button className="btn btn-primary btn-sm" onClick={next}>
              {currentIndex + 1 >= questions.length ? t('quiz.finish') : t('quiz.next')} →
            </button>
          </div>
        )}
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '0.5rem' }}>💡 Scroll to zoom • Drag to pan</p>
      </div>
    </div>
  );
}
