import { useNavigate } from 'react-router-dom';
import { useWaste } from '../lib/WasteContext';
import { formatNumber, formatCurrency, formatTpm } from '../lib/formatters';

function AllocationCard({ alloc, totalQuantity }) {
  const pct = totalQuantity > 0 ? (alloc.allocated_tpm / totalQuantity) * 100 : 0;
  const totalCost = alloc.proc_cost + alloc.transport_cost;

  return (
    <div className="panel border-t-4 border-t-teal-700 flex flex-col justify-between">
      <div>
        <div className="flex items-start justify-between gap-2 mb-2">
          <div>
            <h3 className="text-base font-bold text-slate-900 leading-tight">
              {alloc.pathway_name}
            </h3>
            <span
              className="text-xs font-mono"
              style={{ color: 'var(--color-text-muted)' }}
            >
              Key: {alloc.pathway_key}
            </span>
          </div>
          <span className="badge badge-eligible">Eligible</span>
        </div>

        {/* Tonnage summary */}
        <div className="my-4 p-3 rounded-lg bg-slate-50 border border-slate-200">
          <div className="flex justify-between items-baseline mb-1">
            <span className="text-xs font-semibold text-slate-600">Allocated Quota</span>
            <span className="readout text-lg text-teal-800">
              {formatTpm(alloc.allocated_tpm)}
            </span>
          </div>
          <div className="meter-track h-2 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-teal-600 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, Math.max(0, pct))}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-slate-500 font-mono mt-1">
            <span>Share of stream</span>
            <span className="font-semibold text-slate-700">{pct.toFixed(1)}%</span>
          </div>
        </div>

        {/* Financial Breakdown Table */}
        <div className="space-y-2 mb-4 font-mono text-xs">
          <div className="flex justify-between py-1 border-b border-slate-100">
            <span className="text-slate-600">Offtake Revenue:</span>
            <span className="font-semibold text-emerald-700">
              +{formatCurrency(alloc.revenue)}
            </span>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-100">
            <span className="text-slate-600">Processing Cost:</span>
            <span className="text-rose-600">
              −{formatCurrency(alloc.proc_cost)}
            </span>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-100">
            <span className="text-slate-600">Transport Logistics:</span>
            <span className="text-rose-600">
              −{formatCurrency(alloc.transport_cost)}
            </span>
          </div>
          <div className="flex justify-between py-1.5 pt-2 border-t border-slate-200 font-bold">
            <span className="text-slate-800">Net Monthly Benefit:</span>
            <span
              className={alloc.net_benefit >= 0 ? 'text-teal-700' : 'text-rose-600'}
            >
              {formatCurrency(alloc.net_benefit)}
            </span>
          </div>
        </div>
      </div>

      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-mono">
        <span>Unit Net Margin:</span>
        <span className="font-semibold text-slate-800">
          {alloc.allocated_tpm > 0
            ? `₹${formatNumber(alloc.net_benefit / alloc.allocated_tpm, 1)}/t`
            : '—'}
        </span>
      </div>
    </div>
  );
}

export default function AllocationPage() {
  const { allocations, wasteStream, loading } = useWaste();
  const navigate = useNavigate();

  const totalAllocated = allocations.reduce((sum, a) => sum + (a.allocated_tpm || 0), 0);
  const totalRevenue = allocations.reduce((sum, a) => sum + (a.revenue || 0), 0);
  const totalCost = allocations.reduce(
    (sum, a) => sum + ((a.proc_cost || 0) + (a.transport_cost || 0)),
    0
  );
  const totalNetBenefit = allocations.reduce((sum, a) => sum + (a.net_benefit || 0), 0);

  return (
    <div className="page-container">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="page-title text-2xl font-bold text-slate-900">
              Tonnage Allocation Optimization
            </h1>
            <span className="mock-badge">PILOT OPTIMIZER</span>
          </div>
          <p className="page-subtitle mb-0 text-slate-600">
            Automated linear allocation model distributing available waste tonnage to maximize circular revenue and minimize haulage costs.
          </p>
        </div>

        {/* Action Button */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/comparison')}
            className="btn-primary"
          >
            Compare Scenarios →
          </button>
        </div>
      </div>

      {/* Aggregate KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="panel bg-white p-4">
          <div className="text-xs uppercase font-mono tracking-wider text-slate-500 mb-1">
            Total Material Handled
          </div>
          <div className="readout text-2xl font-bold text-slate-900">
            {formatNumber(totalAllocated, 0)} <span className="text-sm font-normal text-slate-500">t/mo</span>
          </div>
          <div className="text-xs text-slate-500 mt-1">
            of {formatNumber(wasteStream.quantity_tpm, 0)} t/mo generated
          </div>
        </div>

        <div className="panel bg-white p-4">
          <div className="text-xs uppercase font-mono tracking-wider text-slate-500 mb-1">
            Gross Offtake Value
          </div>
          <div className="readout text-2xl font-bold text-emerald-700">
            {formatCurrency(totalRevenue)}
          </div>
          <div className="text-xs text-slate-500 mt-1 font-mono">
            Direct circular sales
          </div>
        </div>

        <div className="panel bg-white p-4">
          <div className="text-xs uppercase font-mono tracking-wider text-slate-500 mb-1">
            Operational & Haulage Cost
          </div>
          <div className="readout text-2xl font-bold text-rose-600">
            {formatCurrency(totalCost)}
          </div>
          <div className="text-xs text-slate-500 mt-1 font-mono">
            Processing + logistics
          </div>
        </div>

        <div className="panel bg-white p-4">
          <div className="text-xs uppercase font-mono tracking-wider text-slate-500 mb-1">
            Net Circular Margin
          </div>
          <div className="readout text-2xl font-bold text-teal-700">
            {formatCurrency(totalNetBenefit)}
          </div>
          <div className="text-xs text-slate-500 mt-1 font-mono">
            Monthly net economic balance
          </div>
        </div>
      </div>

      {/* Overall Stream Distribution Bar */}
      <div className="panel mb-6">
        <h3 className="text-sm font-semibold text-slate-800 mb-2">
          Stream Distribution Portfolio
        </h3>
        <div className="w-full h-4 bg-slate-200 rounded-full flex overflow-hidden mb-3">
          {allocations.map((a, i) => {
            const colors = ['#0F766E', '#0D9488', '#14B8A6', '#0284C7', '#3B82F6'];
            const pct = totalAllocated > 0 ? (a.allocated_tpm / totalAllocated) * 100 : 0;
            return (
              <div
                key={a.pathway_key}
                style={{
                  width: `${pct}%`,
                  backgroundColor: colors[i % colors.length],
                }}
                title={`${a.pathway_name}: ${formatNumber(a.allocated_tpm, 0)} t/mo (${pct.toFixed(1)}%)`}
              />
            );
          })}
        </div>
        <div className="flex flex-wrap gap-4 text-xs font-mono text-slate-600">
          {allocations.map((a, i) => {
            const colors = ['#0F766E', '#0D9488', '#14B8A6', '#0284C7', '#3B82F6'];
            const pct = totalAllocated > 0 ? (a.allocated_tpm / totalAllocated) * 100 : 0;
            return (
              <div key={a.pathway_key} className="flex items-center gap-1.5">
                <span
                  className="w-3 h-3 rounded-sm inline-block"
                  style={{ backgroundColor: colors[i % colors.length] }}
                />
                <span>
                  {a.pathway_name}: <strong>{pct.toFixed(0)}%</strong> ({formatNumber(a.allocated_tpm, 0)} t/mo)
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Pathway Allocation Cards Grid */}
      <div className="mb-8">
        <h2 className="text-lg font-bold text-slate-900 mb-4">
          Allocated Circular Pathways
        </h2>

        {loading.rest ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[0, 1, 2].map((i) => (
              <div key={i} className="panel loading-pulse" style={{ minHeight: '220px' }} />
            ))}
          </div>
        ) : allocations.length === 0 ? (
          <div className="panel text-center py-12">
            <p className="text-slate-500 font-mono text-sm mb-4">
              No pathways are currently eligible under the specified waste characteristics.
            </p>
            <button
              onClick={() => navigate('/')}
              className="btn-secondary"
            >
              ← Modify Input Stream Parameters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {allocations.map((a) => (
              <AllocationCard
                key={a.pathway_key}
                alloc={a}
                totalQuantity={wasteStream.quantity_tpm}
              />
            ))}
          </div>
        )}
      </div>

      {/* Navigation Controls */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-200">
        <button
          onClick={() => navigate('/matching')}
          className="btn-secondary"
        >
          ← Back to Pathway Matching
        </button>
        <button
          onClick={() => navigate('/comparison')}
          className="btn-primary"
        >
          Proceed to Scenario Comparison →
        </button>
      </div>
    </div>
  );
}
