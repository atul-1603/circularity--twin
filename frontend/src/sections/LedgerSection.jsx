/**
 * LedgerSection — auditable emissions formula table.
 * Connected to real /api/emissions endpoint (currently returning mock data).
 */
import { formatNumber, formatCo2 } from '../lib/formatters';

export default function LedgerSection({ emissions, loading }) {
  const entries = emissions?.entries || [];
  const totalAvoided = emissions?.total_avoided_tco2e || 0;
  const version = emissions?.methodology_version || '—';

  return (
    <section
      id="ledger"
      className="border-b"
      style={{ borderColor: 'var(--color-surface-600)' }}
    >
      <div className="section-container">
        <div className="flex items-center gap-2 mb-1">
          <h2 className="section-title" style={{ marginBottom: 0 }}>④ Emissions Ledger</h2>
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
          Auditable per-pathway avoided emissions with full formula transparency.
          Methodology version: <span className="readout">{version}</span>
        </p>

        {loading ? (
          <div className="panel loading-pulse" style={{ minHeight: '200px' }} />
        ) : entries.length === 0 ? (
          <div className="panel-inset text-center py-8">
            <p style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.875rem' }}>
              No emissions data — no eligible pathways
            </p>
          </div>
        ) : (
          <div className="panel overflow-x-auto">
            <table className="w-full text-xs" style={{ fontFamily: 'var(--font-mono)' }}>
              <thead>
                <tr
                  style={{
                    borderBottom: '1px solid var(--color-surface-500)',
                    color: 'var(--color-text-muted)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    fontSize: '0.625rem',
                  }}
                >
                  <th className="text-left py-2 pr-4">Pathway</th>
                  <th className="text-right py-2 px-3">Qty (t/mo)</th>
                  <th className="text-right py-2 px-3">Displaced</th>
                  <th className="text-right py-2 px-3">Process</th>
                  <th className="text-right py-2 px-3">Transport</th>
                  <th className="text-right py-2 px-3" style={{ color: 'var(--color-status-eligible)' }}>
                    Net Avoided
                  </th>
                  <th className="text-left py-2 pl-4">Formula</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((e) => (
                  <tr
                    key={e.pathway_key}
                    style={{ borderBottom: '1px solid var(--color-surface-600)' }}
                  >
                    <td className="py-2 pr-4" style={{ color: 'var(--color-text-primary)' }}>
                      {e.pathway_name}
                    </td>
                    <td className="text-right py-2 px-3 readout">
                      {formatNumber(e.allocated_tpm, 0)}
                    </td>
                    <td className="text-right py-2 px-3 readout" style={{ color: 'var(--color-status-eligible)' }}>
                      {formatCo2(e.displacement_credit_tco2e)}
                    </td>
                    <td className="text-right py-2 px-3 readout" style={{ color: 'var(--color-status-ineligible)' }}>
                      −{formatCo2(e.process_emissions_tco2e)}
                    </td>
                    <td className="text-right py-2 px-3 readout" style={{ color: 'var(--color-status-ineligible)' }}>
                      −{formatCo2(e.transport_emissions_tco2e)}
                    </td>
                    <td className="text-right py-2 px-3 readout font-bold" style={{ color: 'var(--color-status-eligible)' }}>
                      {formatCo2(e.net_avoided_tco2e)}
                    </td>
                    <td
                      className="py-2 pl-4 text-xs"
                      style={{
                        color: 'var(--color-text-muted)',
                        fontSize: '0.5625rem',
                        maxWidth: '200px',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                      title={e.formula}
                    >
                      {e.formula}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{ borderTop: '2px solid var(--color-accent-500)' }}>
                  <td
                    colSpan="5"
                    className="py-3 text-right font-bold text-xs uppercase"
                    style={{ color: 'var(--color-accent-500)', letterSpacing: '0.05em' }}
                  >
                    Total Avoided
                  </td>
                  <td
                    className="py-3 text-right readout font-bold"
                    style={{ color: 'var(--color-accent-500)', fontSize: '0.875rem' }}
                  >
                    {formatCo2(totalAvoided)}
                  </td>
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
