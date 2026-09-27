import { NavLink, useLocation } from 'react-router-dom';
import { useWaste } from '../lib/WasteContext';
import { formatNumber } from '../lib/formatters';

const STEPS = [
  { step: '1', path: '/', label: 'Stream Input', short: 'Input' },
  { step: '2', path: '/matching', label: 'Pathway Matching', short: 'Matching' },
  { step: '3', path: '/allocation', label: 'Tonnage Allocation', short: 'Allocation' },
  { step: '4', path: '/comparison', label: 'Scenario Comparison', short: 'Compare' },
  { step: '5', path: '/ledger', label: 'Emissions Ledger', short: 'Ledger' },
];

export default function WorkflowStepper() {
  const location = useLocation();
  const { wasteStream } = useWaste();

  // Find current step index
  const currentIndex = STEPS.findIndex((s) => s.path === location.pathname);

  // Waste type label
  const wasteLabel =
    wasteStream.waste_type === 'flyash'
      ? 'Coal Fly Ash'
      : wasteStream.waste_type === 'slag'
      ? 'Blast Furnace Slag'
      : 'Bauxite Tailings';

  return (
    <div
      className="border-b"
      style={{
        background: '#FFFFFF',
        borderColor: 'var(--color-surface-200)',
      }}
    >
      <div className="max-w-[76rem] mx-auto px-4 py-2.5 flex flex-wrap items-center justify-between gap-3">
        {/* Step progression breadcrumbs */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-1">
          {STEPS.map((s, idx) => {
            const isActive = location.pathname === s.path;
            const isPassed = currentIndex > idx;

            return (
              <div key={s.path} className="flex items-center gap-1.5">
                <NavLink
                  to={s.path}
                  className={`step-chip ${isActive ? 'active' : ''} ${isPassed ? 'completed' : ''}`}
                >
                  <span className="step-num">
                    {isPassed ? '✓' : s.step}
                  </span>
                  <span>{s.label}</span>
                </NavLink>

                {idx < STEPS.length - 1 && (
                  <span
                    style={{
                      color: 'var(--color-surface-300)',
                      fontSize: '0.75rem',
                      userSelect: 'none',
                    }}
                  >
                    →
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Current stream quick summary chip */}
        <div
          className="flex items-center gap-2 px-3 py-1.5 rounded-md border text-xs"
          style={{
            background: 'var(--color-surface-100)',
            borderColor: 'var(--color-surface-200)',
            fontFamily: 'var(--font-mono)',
          }}
        >
          <span
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: 'var(--color-status-eligible)',
              display: 'inline-block',
            }}
          />
          <span className="font-semibold text-slate-800">{wasteLabel}</span>
          <span style={{ color: 'var(--color-surface-400)' }}>|</span>
          <span style={{ color: 'var(--color-accent-700)' }}>
            {formatNumber(wasteStream.quantity_tpm, 0)} t/mo
          </span>
          <span style={{ color: 'var(--color-surface-400)' }}>|</span>
          <span style={{ color: 'var(--color-text-secondary)' }}>
            {wasteStream.moisture_pct.toFixed(1)}% H₂O
          </span>
        </div>
      </div>
    </div>
  );
}
