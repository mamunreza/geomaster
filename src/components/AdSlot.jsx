/**
 * AdSlot — reserved space for Google AdSense ads.
 *
 * Layout-shift prevention follows:
 * https://developers.google.com/publisher-tag/guides/minimize-layout-shift
 *
 * The outer div has explicit min-height so the browser reserves the space
 * BEFORE the ad script loads, preventing Cumulative Layout Shift (CLS).
 *
 * To activate AdSense:
 *  1. Replace the inner comment block with an <ins class="adsbygoogle" ...> tag.
 *  2. Add the AdSense script to index.html.
 *  3. Remove the placeholder UI (background, label, dashed border).
 *
 * Recommended ad formats per slot:
 *   leaderboard  — 728×90 desktop / responsive on mobile
 *   rectangle    — 336×280 (large rectangle, high CTR in content)
 */

const SLOT_STYLES = {
  leaderboard: { minHeight: 90, maxWidth: 728 },
  rectangle:   { minHeight: 280, maxWidth: 336 },
};

export default function AdSlot({ format = 'leaderboard', className = '', style = {} }) {
  const dims = SLOT_STYLES[format] ?? SLOT_STYLES.leaderboard;

  return (
    /* Outer wrapper — explicit height prevents CLS */
    <div
      aria-label="Advertisement"
      style={{
        display: 'block',
        width: '100%',
        minHeight: dims.minHeight,
        /* placeholder styling — remove when AdSense goes live */
        background: 'linear-gradient(135deg, #faf5ff 0%, #f0f9ff 100%)',
        border: '1px dashed #d8b4fe',
        borderRadius: 8,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        ...style,
      }}
      className={className}
    >
      {/*
        ── AdSense integration point ──────────────────────────────────────
        Replace this comment block with:

        <ins
          className="adsbygoogle"
          style={{ display: 'block', width: '100%', height: dims.minHeight }}
          data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
          data-ad-slot="XXXXXXXXXX"
          data-ad-format={format === 'leaderboard' ? 'horizontal' : 'rectangle'}
          data-full-width-responsive="true"
        />

        and add the init script once per page (in index.html or App.jsx):
          (adsbygoogle = window.adsbygoogle || []).push({});
        ─────────────────────────────────────────────────────────────────
      */}
      <span style={{ color: '#c4b5fd', fontSize: '0.7rem', letterSpacing: '0.08em', textTransform: 'uppercase', userSelect: 'none' }}>
        {/* Advertisement */}
      </span>
    </div>
  );
}
