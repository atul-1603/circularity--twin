import { useNavigate } from 'react-router-dom';
import { useWaste } from '../lib/WasteContext';

const STATUS_CONFIG = {
  eligible: {
    bg: '#ECFDF5',
    border: '#A7F3D0',
    fill: '#059669',
    text: '#059669',
    label: 'Eligible',
    badgeClass: 'badge-eligible',
  },
  marginal: {
    bg: '#FFFBEB',
    border: '#FDE68A',
    fill: '#D97706',
    text: '#D97706',
    label: 'Marginal',
    badgeClass: 'badge-marginal',
  },
  ineligible: {
    bg: '#FEF2F2',
    border: '#FECACA',
    fill: '#DC2626',
    text: '#DC2626',
    label: 'Ineligible',
    badgeClass: 'badge-ineligible',
  },
};

function SkeletonCard() {
  return (
    <div className="panel bg-white loading-pulse p-6">
      <div className="h-5 bg-slate-200 rounded w-1/2 mb-3" />
      <div className="h-4 bg-slate-100 rounded w-5/6 mb-4" />
      <div className="meter-track h-3 bg-slate-200 rounded-full" />
    </div>
  );
}

function PathwayCard({ result }) {
  const { name, pathway_key, requirement_description, status, fit_score, confidence_band } =
    result;
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.ineligible;

  const bandLeft = Math.max(0, fit_score - confidence_band);
  const bandRight = Math.min(100, fit_score + confidence_band);

  return (
    <div className="panel bg-white p-6 border-l-4 border-l-teal-700 flex flex-col justify-between" style={{ borderLeftColor: cfg.fill }}>
      <div>
        {/* Top Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 leading-snug">
              {name}
            </h3>
            <span className="font-mono text-xs text-slate-400">
              Code: {pathway_key}
            </span>
          </div>
          <span className={`badge ${cfg.badgeClass}`}>
            <span
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: cfg.fill,
                display: 'inline-block',
              }}
            />
            {cfg.label}
          </span>
        </div>

        {/* Technical Specification Requirement */}
        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 mb-4 text-xs font-mono text-slate-700 leading-relaxed">
          <div className="text-[10px] text-slate-400 uppercase font-bold mb-0.5">
            Standard Compliance Criteria
          </div>
          {requirement_description}
        </div>
      </div>

      {/* Meter Bar Section */}
      <div>
        <div className="flex items-baseline justify-between mb-1.5">
          <span className="text-xs font-mono font-semibold uppercase text-slate-500">
            Engine Fit Score
          </span>
          <div className="flex items-baseline gap-1.5">
            <span
              className="readout text-xl font-bold"
              style={{ color: cfg.text }}
            >
              {fit_score.toFixed(1)}
            </span>
            <span className="text-xs font-mono text-slate-400">/ 100</span>
          </div>
        </div>

        {/* Track with confidence band and fill */}
        <div className="relative w-full h-3 bg-slate-200 rounded-full overflow-hidden">
          {/* Shaded confidence band range */}
          <div
            className="absolute top-0 bottom-0 opacity-25 rounded-full pointer-events-none"
            style={{
              left: `${bandLeft}%`,
              width: `${Math.max(2, bandRight - bandLeft)}%`,
              backgroundColor: cfg.fill,
            }}
          />
          {/* Actual score fill */}
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{
              width: `${fit_score}%`,
              backgroundColor: cfg.fill,
            }}
          />
        </div>

        {/* Scale Numbers */}
        <div className="flex justify-between text-[10px] font-mono text-slate-400 mt-1">
          <span>0</span>
          <span>25</span>
          <span>50</span>
          <span>75</span>
          <span>100</span>
        </div>

        {/* Confidence Band Subtext */}
        <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 mt-2 pt-2 border-t border-slate-100">
          <span>Uncertainty Margin:</span>
          <span className="font-semibold text-slate-700">
            ±{confidence_band.toFixed(1)} pts
          </span>
        </div>
      </div>
    </div>
  );
}

export default function MatchingPage() {
  const { matchResults, loading, error, wasteStream } = useWaste();
  const navigate = useNavigate();

  const eligibleCount = matchResults.filter((r) => r.status === 'eligible').length;
  const marginalCount = matchResults.filter((r) => r.status === 'marginal').length;
  const ineligibleCount = matchResults.filter((r) => r.status === 'ineligible').length;

  return (
    <div className="page-container">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="page-title text-2xl font-bold text-slate-900">
              Pathway Compatibility & Matching
            </h1>
            <span className="badge badge-eligible">STEP 2 OF 5</span>
          </div>
          <p className="page-subtitle mb-0 text-slate-600">
            Continuous deterministic evaluation of chemical and moisture assays against statutory civil engineering standards.
          </p>
        </div>

        {/* Quick Stepper Action */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/allocation')}
            className="btn-primary"
          >
            Allocate Tonnage →
          </button>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="error-banner mb-6">
          <strong>API Fault:</strong> {error}
        </div>
      )}

      {/* Status Bar */}
      <div className="panel bg-white p-4 mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4 text-xs font-mono">
          <span className="font-bold text-slate-800 uppercase">Evaluated Pathways ({matchResults.length}):</span>
          <span className="badge badge-eligible">{eligibleCount} Eligible</span>
          <span className="badge badge-marginal">{marginalCount} Marginal</span>
          <span className="badge badge-ineligible">{ineligibleCount} Ineligible</span>
        </div>

        <button
          onClick={() => navigate('/')}
          className="text-xs font-mono text-teal-700 hover:text-teal-800 underline"
        >
          Modify Stream Parameters
        </button>
      </div>

      {/* Grid of Pathways */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        {loading.match
          ? [0, 1, 2].map((i) => <SkeletonCard key={i} />)
          : matchResults.map((r) => (
              <PathwayCard key={r.pathway_key} result={r} />
            ))}
      </div>

      {/* Navigation Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-200">
        <button
          onClick={() => navigate('/')}
          className="btn-secondary"
        >
          ← Back to Stream Input
        </button>
        <button
          onClick={() => navigate('/allocation')}
          className="btn-primary"
        >
          Proceed to Tonnage Allocation →
        </button>
      </div>
    </div>
  );
}
