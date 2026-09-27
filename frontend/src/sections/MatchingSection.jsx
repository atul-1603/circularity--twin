/**
 * MatchingSection — displays pathway eligibility results from the real /api/match.
 *
 * Features:
 * - One card per pathway with status badge, requirement text
 * - Meter bar for fit_score with confidence band as shaded range
 * - Loading skeleton while API is in flight
 * - Verbatim API error messages on failure
 */

const STATUS_COLORS = {
  eligible: {
    bg: 'rgba(34, 197, 94, 0.12)',
    border: 'rgba(34, 197, 94, 0.3)',
    fill: '#22C55E',
    text: 'var(--color-status-eligible)',
  },
  marginal: {
    bg: 'rgba(234, 179, 8, 0.12)',
    border: 'rgba(234, 179, 8, 0.3)',
    fill: '#EAB308',
    text: 'var(--color-status-marginal)',
  },
  ineligible: {
    bg: 'rgba(239, 68, 68, 0.08)',
    border: 'rgba(239, 68, 68, 0.2)',
    fill: '#EF4444',
    text: 'var(--color-status-ineligible)',
  },
};

function SkeletonCard() {
  return (
    <div className="panel loading-pulse" style={{ minHeight: '140px' }}>
      <div
        style={{
          width: '60%',
          height: '14px',
          background: 'var(--color-surface-600)',
          marginBottom: '8px',
        }}
      />
      <div
        style={{
          width: '90%',
          height: '10px',
          background: 'var(--color-surface-600)',
          marginBottom: '16px',
        }}
      />
      <div className="meter-track">
        <div
          className="meter-fill"
          style={{ width: '0%', background: 'var(--color-surface-500)' }}
        />
      </div>
    </div>
  );
}

function PathwayCard({ result }) {
  const { name, requirement_description, status, fit_score, confidence_band } =
    result;
  const colors = STATUS_COLORS[status] || STATUS_COLORS.ineligible;

  // Confidence band: shown as a shaded range around the fit_score on the meter
  const bandLeft = Math.max(0, fit_score - confidence_band);
  const bandRight = Math.min(100, fit_score + confidence_band);

  return (
    <div
      className="panel"
      style={{ borderLeft: `3px solid ${colors.fill}` }}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-3 mb-2">
        <div>
          <h3
            className="text-sm font-semibold mb-1"
            style={{ color: 'var(--color-text-primary)' }}
          >
            {name}
          </h3>
          <p
            className="text-xs leading-relaxed"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            {requirement_description}
          </p>
        </div>
        <span className={`badge badge-${status}`}>
          <span
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              background: colors.fill,
              display: 'inline-block',
            }}
          />
          {status}
        </span>
      </div>

      {/* Fit score meter with confidence band */}
      <div className="mt-3">
        <div className="flex items-center justify-between mb-1">
          <span
            className="text-xs"
            style={{
              fontFamily: 'var(--font-mono)',
              color: 'var(--color-text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            Fit Score
          </span>
          <span
            className="readout text-sm"
            style={{ color: colors.text }}
          >
            {fit_score.toFixed(1)}
          </span>
        </div>

        <div className="meter-track">
          {/* Confidence band (shaded range on the same meter) */}
          <div
            className="meter-confidence"
            style={{
              left: `${bandLeft}%`,
              width: `${bandRight - bandLeft}%`,
              background: colors.fill,
            }}
          />
          {/* Actual fill */}
          <div
            className="meter-fill"
            style={{
              width: `${fit_score}%`,
              background: colors.fill,
            }}
          />
        </div>

        {/* Scale markers */}
        <div
          className="flex justify-between mt-1"
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.5625rem',
            color: 'var(--color-text-muted)',
          }}
        >
          <span>0</span>
          <span>25</span>
          <span>50</span>
          <span>75</span>
          <span>100</span>
        </div>
      </div>

      {/* Confidence band note */}
      {confidence_band > 0 && (
        <div
          className="mt-2 text-xs"
          style={{
            fontFamily: 'var(--font-mono)',
            color: 'var(--color-text-muted)',
          }}
        >
          ±{confidence_band} confidence band
        </div>
      )}
    </div>
  );
}

export default function MatchingSection({ results, loading, error }) {
  return (
    <section
      id="matching"
      className="border-b"
      style={{ borderColor: 'var(--color-surface-600)' }}
    >
      <div className="section-container">
        <h2 className="section-title">② Pathway Matching</h2>
        <p className="section-subtitle">
          Real-time eligibility evaluation against circular-economy reuse pathways.
        </p>

        {/* Error state — shows API error verbatim */}
        {error && (
          <div className="error-banner mb-4">
            <span className="font-semibold">API Error:</span> {error}
          </div>
        )}

        {/* Cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {loading
            ? [0, 1, 2].map((i) => <SkeletonCard key={i} />)
            : results.map((r) => (
                <PathwayCard key={r.pathway_key} result={r} />
              ))}
        </div>
      </div>
    </section>
  );
}
