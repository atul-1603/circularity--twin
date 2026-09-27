import { useNavigate } from 'react-router-dom';
import { useWaste } from '../lib/WasteContext';
import { formatCurrency, formatCo2, formatNumber } from '../lib/formatters';

export default function ComparisonPage() {
  const { comparison, wasteStream, loading } = useWaste();
  const navigate = useNavigate();

  const disposal = comparison?.disposal;
  const reuse = comparison?.reuse;
  const savings = comparison?.savings;

  return (
    <div className="page-container">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="page-title text-2xl font-bold text-slate-900">
              Scenario Analysis: Circular Reuse vs. Disposal
            </h1>
            <span className="mock-badge">PILOT BENCHMARK</span>
          </div>
          <p className="page-subtitle mb-0 text-slate-600">
            Head-to-head financial and carbon assessment comparing conventional landfill disposal against circular economy valorization.
          </p>
        </div>

        {/* Action Button */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/ledger')}
            className="btn-primary"
          >
            Audit Emissions Ledger →
          </button>
        </div>
      </div>

      {loading.rest ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="panel loading-pulse" style={{ minHeight: '260px' }} />
          <div className="panel loading-pulse" style={{ minHeight: '260px' }} />
        </div>
      ) : !comparison ? (
        <div className="panel text-center py-12 mb-6">
          <p className="text-slate-500 font-mono text-sm">
            Comparison data is currently not available for this configuration.
          </p>
        </div>
      ) : (
        <>
          {/* Key Impact Headline Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
            <div className="panel bg-white border-l-4 border-l-emerald-600">
              <div className="text-xs uppercase font-mono tracking-wider text-slate-500 mb-1">
                Net Monthly Economic Advantage
              </div>
              <div className="readout text-3xl font-bold text-emerald-700">
                {formatCurrency(savings?.cost_delta)}
              </div>
              <p className="text-xs text-slate-600 mt-2">
                Gain from avoided landfill tipping fees + off-take reuse revenue.
              </p>
            </div>

            <div className="panel bg-white border-l-4 border-l-teal-600">
              <div className="text-xs uppercase font-mono tracking-wider text-slate-500 mb-1">
                Net Carbon Avoidance Impact
              </div>
              <div className="readout text-3xl font-bold text-teal-700">
                {formatCo2(savings?.emissions_delta_tco2e)}
              </div>
              <p className="text-xs text-slate-600 mt-2">
                Equivalent to removing ~{formatNumber((savings?.emissions_delta_tco2e || 0) / 4.6, 0)} passenger vehicles annually.
              </p>
            </div>

            <div className="panel bg-white border-l-4 border-l-blue-600">
              <div className="text-xs uppercase font-mono tracking-wider text-slate-500 mb-1">
                Landfill Diversion Rate
              </div>
              <div className="readout text-3xl font-bold text-blue-700">
                100.0%
              </div>
              <p className="text-xs text-slate-600 mt-2">
                {formatNumber(wasteStream.quantity_tpm, 0)} tonnes/month redirected from dedicated landfill ash ponds.
              </p>
            </div>
          </div>

          {/* Two-Column Side-by-Side Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Baseline Disposal Column */}
            <div className="panel bg-white border-t-4 border-t-rose-600">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-200">
                <div>
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-rose-700 block">
                    Scenario A • Linear Baseline
                  </span>
                  <h3 className="text-lg font-bold text-slate-900">
                    Direct Landfill Disposal
                  </h3>
                </div>
                <span className="badge badge-ineligible">Linear Economy</span>
              </div>

              <div className="space-y-4 mb-4">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="text-xs font-mono text-slate-500">MONTHLY EXPENDITURE</div>
                  <div className="readout text-2xl font-bold text-rose-600 mt-0.5">
                    {formatCurrency(disposal?.cost)}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    Direct tipping fee, excavation, pond maintenance & compliance liability.
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="text-xs font-mono text-slate-500">DIRECT EMISSIONS BURDEN</div>
                  <div className="readout text-xl font-bold text-slate-700 mt-0.5">
                    {formatCo2(disposal?.emissions_tco2e)}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    Heavy equipment diesel handling, fugitives, and leachate aeration.
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-md bg-rose-50 border border-rose-200 text-xs text-rose-800">
                ⚠️ <strong>Regulatory Risk:</strong> Long-term ash pond storage faces strict CPCB/MoEFCC compliance penalties and escalating site closure liabilities.
              </div>
            </div>

            {/* Circular Reuse Column */}
            <div className="panel bg-white border-t-4 border-t-teal-700">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-200">
                <div>
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-teal-700 block">
                    Scenario B • Circularity Twin
                  </span>
                  <h3 className="text-lg font-bold text-slate-900">
                    Industrial Symbiosis Reuse
                  </h3>
                </div>
                <span className="badge badge-eligible">Circular Pathway</span>
              </div>

              <div className="space-y-4 mb-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="text-xs font-mono text-slate-500">OFFTAKE SALES</div>
                    <div className="readout text-xl font-bold text-emerald-700 mt-0.5">
                      +{formatCurrency(reuse?.revenue)}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      Secondary raw material value.
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="text-xs font-mono text-slate-500">PROCESSING & FREIGHT</div>
                    <div className="readout text-xl font-bold text-slate-700 mt-0.5">
                      −{formatCurrency(reuse?.cost)}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      Drying, grinding & freight.
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-teal-50 rounded-lg border border-teal-200">
                  <div className="text-xs font-mono text-teal-800 font-semibold">NET CARBON OFFSET / AVOIDED</div>
                  <div className="readout text-2xl font-bold text-teal-800 mt-0.5">
                    {formatCo2(reuse?.emissions_avoided_tco2e)}
                  </div>
                  <div className="text-xs text-teal-700 mt-1">
                    Audited displacement of virgin clinker, natural aggregates, and fired clay.
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-md bg-emerald-50 border border-emerald-200 text-xs text-emerald-800">
                ✅ <strong>ESG & Carbon Credits:</strong> Generates auditable Scope 3 emission reductions qualified for corporate BRSR reporting and voluntary carbon offset issuance.
              </div>
            </div>
          </div>
        </>
      )}

      {/* Navigation Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-200">
        <button
          onClick={() => navigate('/allocation')}
          className="btn-secondary"
        >
          ← Back to Tonnage Allocation
        </button>
        <button
          onClick={() => navigate('/ledger')}
          className="btn-primary"
        >
          View Full Emissions Ledger →
        </button>
      </div>
    </div>
  );
}
