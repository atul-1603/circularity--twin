/**
 * AboutSection — methodology summary and links to docs.
 */
export default function AboutSection() {
  return (
    <section id="about">
      <div className="section-container">
        <h2 className="section-title">⑥ About & Methodology</h2>
        <p className="section-subtitle">
          How Circularity Twin evaluates waste streams and calculates avoided emissions.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Matching Methodology */}
          <div className="panel">
            <h3
              className="text-sm font-semibold mb-3"
              style={{ color: 'var(--color-accent-500)' }}
            >
              Pathway Matching
            </h3>
            <div className="space-y-2" style={{ color: 'var(--color-text-secondary)', fontSize: '0.8125rem', lineHeight: '1.6' }}>
              <p>
                Each waste stream is evaluated against industry-standard thresholds
                for reuse pathways:
              </p>
              <ul className="list-none space-y-1" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>
                <li>
                  <span style={{ color: 'var(--color-status-eligible)' }}>■</span>{' '}
                  <strong>Cement:</strong> ASTM C618 — SiO₂+Al₂O₃+Fe₂O₃ &gt; 70%, CaO &lt; 15%
                </li>
                <li>
                  <span style={{ color: 'var(--color-status-eligible)' }}>■</span>{' '}
                  <strong>Road sub-base:</strong> IRC SP-58 — moisture &lt; 20%
                </li>
                <li>
                  <span style={{ color: 'var(--color-status-eligible)' }}>■</span>{' '}
                  <strong>Brick/block:</strong> IS 12894 — SiO₂+Al₂O₃ &gt; 55%
                </li>
              </ul>
              <p>
                Fit scores are deterministic (no randomness) and reproducible.
                See scoring formulas in{' '}
                <code style={{ color: 'var(--color-accent-400)', fontSize: '0.6875rem' }}>
                  backend/app/services/matching.py
                </code>
              </p>
            </div>
          </div>

          {/* Emissions Methodology */}
          <div className="panel">
            <h3
              className="text-sm font-semibold mb-3"
              style={{ color: 'var(--color-accent-500)' }}
            >
              Emissions Calculation
            </h3>
            <div className="space-y-2" style={{ color: 'var(--color-text-secondary)', fontSize: '0.8125rem', lineHeight: '1.6' }}>
              <p>Avoided emissions formula:</p>
              <div
                className="panel-inset text-xs"
                style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-accent-400)' }}
              >
                avoided = displacement_credit × qty<br />
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;− process_emissions × qty<br />
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;− transport × distance × qty
              </div>
              <p>
                Displacement credits sourced from IPCC AR6 WG III and ecoinvent 3.9.
                All factors documented in{' '}
                <code style={{ color: 'var(--color-accent-400)', fontSize: '0.6875rem' }}>
                  docs/emissions-methodology.md
                </code>
              </p>
            </div>
          </div>

          {/* Data Sources */}
          <div className="panel">
            <h3
              className="text-sm font-semibold mb-3"
              style={{ color: 'var(--color-accent-500)' }}
            >
              Data Sources
            </h3>
            <ul
              className="space-y-1 text-xs"
              style={{
                fontFamily: 'var(--font-mono)',
                color: 'var(--color-text-secondary)',
                listStyle: 'none',
                padding: 0,
              }}
            >
              <li>• ASTM C618 — Standard Specification for Coal Fly Ash</li>
              <li>• IS 3812:2013 — Pulverized Fuel Ash Specification</li>
              <li>• IRC SP-58:2001 — Use of Fly Ash in Road Embankments</li>
              <li>• IS 12894:2002 — Fly Ash-Lime-Gypsum Bricks</li>
              <li>• IPCC AR6 WG III Ch. 11 — Industry Emissions</li>
              <li>• CPCB India — Fly Ash Utilization Reports</li>
            </ul>
          </div>

          {/* Architecture Status */}
          <div className="panel">
            <h3
              className="text-sm font-semibold mb-3"
              style={{ color: 'var(--color-accent-500)' }}
            >
              Implementation Status
            </h3>
            <div
              className="space-y-1 text-xs"
              style={{ fontFamily: 'var(--font-mono)' }}
            >
              {[
                { name: 'Input', status: 'real', color: 'var(--color-status-eligible)' },
                { name: 'Matching Engine', status: 'real', color: 'var(--color-status-eligible)' },
                { name: 'Allocation Optimizer', status: 'mock', color: 'var(--color-status-marginal)' },
                { name: 'Emissions Ledger', status: 'mock', color: 'var(--color-status-marginal)' },
                { name: 'Comparison', status: 'mock', color: 'var(--color-status-marginal)' },
              ].map(({ name, status, color }) => (
                <div key={name} className="flex items-center justify-between py-1" style={{ borderBottom: '1px solid var(--color-surface-600)' }}>
                  <span style={{ color: 'var(--color-text-secondary)' }}>{name}</span>
                  <span style={{ color }}>{status.toUpperCase()}</span>
                </div>
              ))}
            </div>
            <p
              className="mt-3 text-xs"
              style={{ color: 'var(--color-text-muted)' }}
            >
              See{' '}
              <code style={{ color: 'var(--color-accent-400)', fontSize: '0.6875rem' }}>
                docs/architecture.md
              </code>{' '}
              for full details.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
