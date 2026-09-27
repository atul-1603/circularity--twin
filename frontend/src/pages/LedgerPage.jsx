import { useNavigate } from 'react-router-dom';
import { useWaste } from '../lib/WasteContext';
import { formatNumber, formatCo2 } from '../lib/formatters';

export default function LedgerPage() {
  const { emissions, loading } = useWaste();
  const navigate = useNavigate();

  const entries = emissions?.entries || [];
  const totalAvoided = emissions?.total_avoided_tco2e || 0;
  const version = emissions?.methodology_version || 'v1.0-IPCC-AR6';

  const exportCsv = () => {
    if (!entries.length) return;
    const headers = [
      'Pathway',
      'Allocated (t/mo)',
      'Displacement Credit (tCO2e)',
      'Process Emissions (tCO2e)',
      'Transport Emissions (tCO2e)',
      'Net Avoided (tCO2e)',
      'Formula',
    ];
    const rows = entries.map((e) => [
      `"${e.pathway_name}"`,
      e.allocated_tpm,
      e.displacement_credit_tco2e,
      e.process_emissions_tco2e,
      e.transport_emissions_tco2e,
      e.net_avoided_tco2e,
      `"${e.formula}"`,
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `circularity_emissions_ledger_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="page-title text-2xl font-bold text-slate-900">
              Auditable Emissions Ledger
            </h1>
            <span className="badge badge-eligible">ISO 14064 ALIGNED</span>
          </div>
          <p className="page-subtitle mb-0 text-slate-600">
            Cryptographically verifiable carbon accounting table detailing displaced virgin emissions, processing overhead, and logistics penalties.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={exportCsv}
            disabled={entries.length === 0}
            className="btn-secondary"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Export CSV
          </button>
          <button
            onClick={() => navigate('/about')}
            className="btn-primary"
          >
            View Standards & Methodology →
          </button>
        </div>
      </div>

      {/* Methodology Reference Box */}
      <div className="panel bg-slate-50 border border-slate-200 mb-6 p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
          <span className="text-xs font-mono font-semibold text-slate-700 uppercase tracking-wide">
            Calculation Engine Protocol: <span className="text-teal-700">{version}</span>
          </span>
          <span className="text-xs font-mono text-slate-500">
            Baseline: ecoinvent 3.9 & IPCC AR6 WG III Ch. 11
          </span>
        </div>
        <p className="text-xs text-slate-600 font-mono leading-relaxed mb-0">
          Governing Formula: <strong className="text-slate-800">E_avoided = (EF_virgin × Qty) − (EF_proc × Qty) − (EF_freight × Distance × Qty)</strong>
        </p>
      </div>

      {/* Ledger Table Panel */}
      <div className="panel bg-white p-0 overflow-hidden mb-8 border border-slate-200">
        {loading.rest ? (
          <div className="p-8">
            <div className="loading-pulse h-40 bg-slate-100 rounded" />
          </div>
        ) : entries.length === 0 ? (
          <div className="text-center py-12 p-6">
            <p className="text-slate-500 font-mono text-sm">
              No eligible emissions entries found. Please verify stream parameters.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr className="bg-slate-50">
                  <th className="py-3 px-4">Pathway / Application</th>
                  <th className="py-3 px-4 text-right">Allocated Volume</th>
                  <th className="py-3 px-4 text-right text-emerald-700">Displacement Credit</th>
                  <th className="py-3 px-4 text-right text-rose-600">Process Emission</th>
                  <th className="py-3 px-4 text-right text-rose-600">Freight Transport</th>
                  <th className="py-3 px-4 text-right font-bold text-teal-800">Net Avoided (tCO₂e)</th>
                  <th className="py-3 px-4 text-left font-mono">Transparency Formula</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-xs">
                {entries.map((e) => (
                  <tr key={e.pathway_key} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-4 font-sans font-semibold text-slate-900">
                      {e.pathway_name}
                      <span className="block font-mono text-[10px] text-slate-400 font-normal">
                        {e.pathway_key}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono text-slate-800">
                      {formatNumber(e.allocated_tpm, 0)} t/mo
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-semibold text-emerald-700">
                      +{formatCo2(e.displacement_credit_tco2e)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono text-rose-600">
                      −{formatCo2(e.process_emissions_tco2e)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono text-rose-600">
                      −{formatCo2(e.transport_emissions_tco2e)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-teal-800 bg-teal-50/50">
                      {formatCo2(e.net_avoided_tco2e)}
                    </td>
                    <td
                      className="py-3.5 px-4 text-slate-500 font-mono text-[11px] max-w-[280px] truncate"
                      title={e.formula}
                    >
                      {e.formula}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-slate-100 border-t-2 border-slate-300 font-bold">
                  <td colSpan="5" className="py-4 px-4 text-right font-mono text-xs uppercase text-slate-700">
                    Net Portfolio Carbon Avoidance:
                  </td>
                  <td className="py-4 px-4 text-right font-mono text-base text-teal-800">
                    {formatCo2(totalAvoided)}
                  </td>
                  <td className="py-4 px-4 font-mono text-xs text-slate-500">
                    Monthly Audited Total
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>

      {/* Navigation Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-200">
        <button
          onClick={() => navigate('/comparison')}
          className="btn-secondary"
        >
          ← Back to Scenario Comparison
        </button>
        <button
          onClick={() => navigate('/about')}
          className="btn-primary"
        >
          View Technical Standards & Methodology →
        </button>
      </div>
    </div>
  );
}
