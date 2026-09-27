/**
 * AllocationSection — displays tonnage allocation across eligible pathways.
 * Connected to real /api/allocate endpoint (currently returning mock data).
 */
import { formatNumber, formatCurrency } from '../lib/formatters';

function AllocationCard({ alloc }) {
  const total = alloc.revenue + alloc.proc_cost + alloc.transport_cost;
  const revenueWidth = total > 0 ? (alloc.revenue / total) * 100 : 0;
  const costWidth = total > 0 ? ((alloc.proc_cost + alloc.transport_cost) / total) * 100 : 0;

  return (
    <div className="panel">
      <div className="flex items-center justify-between mb-2">
        <h3
          className="text-sm font-semibold"
          style={{ color: 'var(--color-text-primary)' }}
        >
          {alloc.pathway_name}
        </h3>
        <span
          className="readout text-sm"
          style={{ color: 'var(--color-accent-500)' }}
        >
          {formatNumber(alloc.allocated_tpm, 0)} t/mo
        </span>
      </div>

      {/* Stacked bar: revenue vs cost */}
      <div className="flex w-full h-2 mb-3" style={{ background: 'var(--color-surface-600)' }}>
        <div
          style={{
            width: `${revenueWidth}%`,
            background: 'var(--color-status-eligible)',
            transition: 'width 0.3s ease',
          }}
        />
        <div
          style={{
            width: `${costWidth}%`,
            background: 'var(--color-status-ineligible)',
            opacity: 0.6,
            transition: 'width 0.3s ease',
          }}
        />
      </div>

      <div
        className="grid grid-cols-3 gap-2 text-xs"
        style={{ fontFamily: 'var(--font-mono)' }}
      >
        <div>
          <div style={{ color: 'var(--color-text-muted)', fontSize: '0.625rem' }}>REVENUE</div>
          <div style={{ color: 'var(--color-status-eligible)' }}>
            {formatCurrency(alloc.revenue)}
          </div>
        </div>
        <div>
          <div style={{ color: 'var(--color-text-muted)', fontSize: '0.625rem' }}>COST</div>
          <div style={{ color: 'var(--color-status-ineligible)' }}>
            {formatCurrency(alloc.proc_cost + alloc.transport_cost)}
          </div>
        </div>
        <div>
          <div style={{ color: 'var(--color-text-muted)', fontSize: '0.625rem' }}>NET</div>
          <div
            style={{
              color:
                alloc.net_benefit >= 0
                  ? 'var(--color-accent-500)'
                  : 'var(--color-status-ineligible)',
            }}
          >
            {formatCurrency(alloc.net_benefit)}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AllocationSection({ allocations, loading }) {
  return (
    <section
      id="allocation"
      className="border-b"
      style={{ borderColor: 'var(--color-surface-600)' }}
    >
      <div className="section-container">
        <div className="flex items-center gap-2 mb-1">
          <h2 className="section-title" style={{ marginBottom: 0 }}>③ Allocation</h2>
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
          Optimal tonnage allocation across eligible pathways (optimizer pending).
        </p>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[0, 1, 2].map((i) => (
              <div key={i} className="panel loading-pulse" style={{ minHeight: '120px' }} />
            ))}
          </div>
        ) : allocations.length === 0 ? (
          <div className="panel-inset text-center py-8">
            <p style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.875rem' }}>
              No eligible pathways — adjust input parameters
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {allocations.map((a) => (
              <AllocationCard key={a.pathway_key} alloc={a} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
