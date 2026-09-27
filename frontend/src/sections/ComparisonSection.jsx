/**
 * ComparisonSection — reuse vs. disposal headline stats.
 * Connected to real /api/comparison endpoint (currently returning mock data).
 */
import { formatCurrency, formatCo2 } from '../lib/formatters';

function StatCard({ label, value, subtext, positive }) {
  return (
    <div className="panel text-center">
      <div
        className="text-xs uppercase tracking-wider mb-2"
        style={{
          fontFamily: 'var(--font-mono)',
          color: 'var(--color-text-muted)',
          letterSpacing: '0.1em',
        }}
      >
        {label}
      </div>
      <div
        className="readout text-2xl font-bold mb-1"
        style={{
          color: positive
            ? 'var(--color-status-eligible)'
            : positive === false
            ? 'var(--color-status-ineligible)'
            : 'var(--color-accent-500)',
        }}
      >
        {value}
      </div>
      {subtext && (
        <div
          className="text-xs"
          style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}
        >
          {subtext}
        </div>
      )}
    </div>
  );
}

export default function ComparisonSection({ comparison, loading }) {
  const disposal = comparison?.disposal;
  const reuse = comparison?.reuse;
  const savings = comparison?.savings;

  return (
    <section
      id="comparison"
      className="border-b"
      style={{ borderColor: 'var(--color-surface-600)' }}
    >
      <div className="section-container">
        <div className="flex items-center gap-2 mb-1">
          <h2 className="section-title" style={{ marginBottom: 0 }}>⑤ Reuse vs. Disposal</h2>
          <span
            className="text-xs px-2 py-0.5"
            style={{
              fontFamily: 'var(--font-mono)',
              background: 'rgba(234, 179, 8, 0.15)',
              color: 'var(--color-status-marginal)',
              border: '1px solid rgba(234, 179, 8, 0.3)',
            }}
          >
            MOCK DATA
          </span>
        </div>
        <p className="section-subtitle">
          Side-by-side comparison of circular reuse against landfill disposal.
        </p>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[0, 1].map((i) => (
              <div key={i} className="panel loading-pulse" style={{ minHeight: '180px' }} />
            ))}
          </div>
        ) : !comparison ? (
          <div className="panel-inset text-center py-8">
            <p style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.875rem' }}>
              No comparison data available
            </p>
          </div>
        ) : (
          <>
            {/* Two-column: Disposal vs. Reuse */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {/* Disposal */}
              <div
                className="panel"
                style={{ borderTop: '3px solid var(--color-status-ineligible)' }}
              >
                <h3
                  className="text-xs font-bold uppercase tracking-wider mb-4"
                  style={{
                    fontFamily: 'var(--font-mono)',
                    color: 'var(--color-status-ineligible)',
                  }}
                >
                  Landfill Disposal (Baseline)
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="text-xs" style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.625rem' }}>
                      DISPOSAL COST
                    </div>
                    <div className="readout text-lg" style={{ color: 'var(--color-status-ineligible)' }}>
                      {formatCurrency(disposal?.cost)}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs" style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.625rem' }}>
                      EMISSIONS
                    </div>
                    <div className="readout text-lg" style={{ color: 'var(--color-status-ineligible)' }}>
                      {formatCo2(disposal?.emissions_tco2e)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Reuse */}
              <div
                className="panel"
                style={{ borderTop: '3px solid var(--color-status-eligible)' }}
              >
                <h3
                  className="text-xs font-bold uppercase tracking-wider mb-4"
                  style={{
                    fontFamily: 'var(--font-mono)',
                    color: 'var(--color-status-eligible)',
                  }}
                >
                  Circular Reuse
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <div className="text-xs" style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.625rem' }}>
                      REVENUE
                    </div>
                    <div className="readout text-lg" style={{ color: 'var(--color-status-eligible)' }}>
                      {formatCurrency(reuse?.revenue)}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs" style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.625rem' }}>
                      COST
                    </div>
                    <div className="readout text-lg" style={{ color: 'var(--color-text-secondary)' }}>
                      {formatCurrency(reuse?.cost)}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs" style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.625rem' }}>
                      CO₂ AVOIDED
                    </div>
                    <div className="readout text-lg" style={{ color: 'var(--color-status-eligible)' }}>
                      {formatCo2(reuse?.emissions_avoided_tco2e)}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Net Savings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <StatCard
                label="Net Cost Savings"
                value={formatCurrency(savings?.cost_delta)}
                subtext="Revenue − costs vs. disposal"
                positive={savings?.cost_delta > 0}
              />
              <StatCard
                label="Net Emissions Impact"
                value={formatCo2(savings?.emissions_delta_tco2e)}
                subtext="Avoided + displaced baseline"
                positive={savings?.emissions_delta_tco2e > 0}
              />
            </div>
          </>
        )}
      </div>
    </section>
  );
}
