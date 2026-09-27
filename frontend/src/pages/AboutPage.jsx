import { useNavigate } from 'react-router-dom';

export default function AboutPage() {
  const navigate = useNavigate();

  return (
    <div className="page-container">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="page-title text-2xl font-bold text-slate-900">
              Technical Standards & Methodology
            </h1>
            <span className="badge badge-eligible">AUDIT SPECIFICATION</span>
          </div>
          <p className="page-subtitle mb-0 text-slate-600">
            Formal technical specifications, chemical compatibility thresholds, emissions equations, and regulatory citations.
          </p>
        </div>

        <button
          onClick={() => navigate('/')}
          className="btn-primary"
        >
          ← Return to Stream Input
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Pathway Matching Standards */}
        <div className="panel bg-white border border-slate-200">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-600 inline-block" />
            <h3 className="text-base font-bold text-slate-900">
              Pathway Eligibility Rules
            </h3>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed mb-4">
            Circularity Twin matches waste characteristics against official civil engineering and metallurgical standards:
          </p>

          <div className="space-y-3 font-mono text-xs">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <div className="font-bold text-slate-800 mb-1">
                1. Cement Replacement — ASTM C618 / IS 3812
              </div>
              <p className="text-slate-600 font-sans text-xs mb-2">
                Pozzolanic activity requires silica, alumina, and iron oxide synergy with constrained free lime.
              </p>
              <div className="text-teal-800 font-bold bg-white p-2 rounded border border-slate-200">
                Rule: SiO₂ + Al₂O₃ + Fe₂O₃ ≥ 70.0% AND CaO &lt; 15.0%
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <div className="font-bold text-slate-800 mb-1">
                2. Road Sub-base / Embankment — IRC SP-58:2001
              </div>
              <p className="text-slate-600 font-sans text-xs mb-2">
                Geotechnical compaction requires controlled moisture to achieve maximum dry density.
              </p>
              <div className="text-teal-800 font-bold bg-white p-2 rounded border border-slate-200">
                Rule: Moisture Content ≤ 20.0%
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <div className="font-bold text-slate-800 mb-1">
                3. Precast Bricks & Blocks — IS 12894:2002
              </div>
              <p className="text-slate-600 font-sans text-xs mb-2">
                Hydrothermal reaction between fly ash, lime, and gypsum for compressive strength.
              </p>
              <div className="text-teal-800 font-bold bg-white p-2 rounded border border-slate-200">
                Rule: SiO₂ + Al₂O₃ ≥ 55.0%
              </div>
            </div>
          </div>
        </div>

        {/* Carbon Accounting Equations */}
        <div className="panel bg-white border border-slate-200">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block" />
            <h3 className="text-base font-bold text-slate-900">
              Auditable Emissions Formulation
            </h3>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed mb-4">
            Emissions reductions comply with ISO 14064-2 and GHG Protocol Project Accounting standards.
          </p>

          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 mb-4 font-mono text-xs">
            <div className="text-slate-500 mb-1">PRIMARY MATHEMATICAL MODEL:</div>
            <div className="text-teal-900 font-bold text-sm bg-white p-3 rounded border border-slate-200 leading-normal">
              E_avoided = (EF_virgin × Q) − (EF_proc × Q) − (EF_freight × D × Q)
            </div>
            <div className="mt-3 space-y-1 text-slate-600">
              <div>• <strong>EF_virgin</strong>: Emission factor of replaced virgin material (tCO₂e/t)</div>
              <div>• <strong>EF_proc</strong>: Electricity and drying fossil emissions (tCO₂e/t)</div>
              <div>• <strong>EF_freight</strong>: Road freight penalty (0.000105 tCO₂e/t·km)</div>
              <div>• <strong>Q</strong>: Allocated monthly dry mass tonnage</div>
              <div>• <strong>D</strong>: Haulage distance between source facility and receptor site (km)</div>
            </div>
          </div>

          <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 text-xs text-emerald-900">
            <strong>IPCC AR6 WG III Chapter 11 Reference:</strong> Industrial pozzolans displacing Ordinary Portland Cement (OPC) avoid clinker calcination emissions (~0.82 tCO₂/t clinker).
          </div>
        </div>

        {/* Regulatory Standards Database */}
        <div className="panel bg-white border border-slate-200">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block" />
            <h3 className="text-base font-bold text-slate-900">
              Regulatory Standards Citations
            </h3>
          </div>
          <ul className="space-y-2 text-xs font-mono text-slate-700 divide-y divide-slate-100">
            <li className="pt-2">
              <strong className="text-slate-900">ASTM C618-22:</strong> Standard Specification for Coal Fly Ash and Raw or Calcined Natural Pozzolan for Use in Concrete.
            </li>
            <li className="pt-2">
              <strong className="text-slate-900">IS 3812 (Part 1): 2013:</strong> Pulverized Fuel Ash — Specification for Use as Pozzolana in Cement and Cement Mortar.
            </li>
            <li className="pt-2">
              <strong className="text-slate-900">IRC SP-58: 2001:</strong> Guidelines for Use of Fly Ash in Road Embankments and Sub-grade (Indian Roads Congress).
            </li>
            <li className="pt-2">
              <strong className="text-slate-900">IS 12894: 2002:</strong> Pulverized Fuel Ash-Lime Bricks — Specification (Bureau of Indian Standards).
            </li>
            <li className="pt-2">
              <strong className="text-slate-900">CPCB India Guidelines 2021:</strong> Technical Guidelines for Environmental Management of Fly Ash Generation & Disposal.
            </li>
          </ul>
        </div>

        {/* Architecture & Verification Status */}
        <div className="panel bg-white border border-slate-200">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 inline-block" />
            <h3 className="text-base font-bold text-slate-900">
              Engine Subsystem Verification
            </h3>
          </div>
          <div className="space-y-2 font-mono text-xs">
            {[
              {
                name: 'Chemical Characterization Engine',
                status: 'VERIFIED & ACTIVE',
                endpoint: 'POST /api/match',
                type: 'Production deterministic rule-set',
              },
              {
                name: 'Pathway Fit & Scoring Model',
                status: 'VERIFIED & ACTIVE',
                endpoint: 'POST /api/match',
                type: 'Continuous linear tolerance penalty model',
              },
              {
                name: 'Tonnage Allocation Optimizer',
                status: 'CONNECTED (PILOT)',
                endpoint: 'POST /api/allocate',
                type: 'Greedy profit-maximization solver',
              },
              {
                name: 'Carbon Avoidance Ledger',
                status: 'CONNECTED (PILOT)',
                endpoint: 'POST /api/emissions',
                type: 'IPCC AR6 tier 2 audited formulas',
              },
              {
                name: 'Life Cycle Cost Comparison',
                status: 'CONNECTED (PILOT)',
                endpoint: 'POST /api/comparison',
                type: 'Landfill tipping vs circular offtake model',
              },
            ].map((item) => (
              <div key={item.name} className="p-2.5 bg-slate-50 rounded border border-slate-200">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800">{item.name}</span>
                  <span className="badge badge-eligible">{item.status}</span>
                </div>
                <div className="text-[11px] text-slate-500 mt-1 flex justify-between">
                  <span>{item.type}</span>
                  <span className="text-teal-700">{item.endpoint}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-200">
        <button
          onClick={() => navigate('/ledger')}
          className="btn-secondary"
        >
          ← Back to Emissions Ledger
        </button>
        <button
          onClick={() => navigate('/')}
          className="btn-primary"
        >
          Configure New Waste Stream →
        </button>
      </div>
    </div>
  );
}
