import { NavLink, useLocation } from 'react-router-dom';

const STEPS = [
  { step: '1', path: '/', label: 'Stream Input', short: 'Input' },
  { step: '2', path: '/matching', label: 'Pathway Matching', short: 'Matching' },
  { step: '3', path: '/allocation', label: 'Tonnage Allocation', short: 'Allocation' },
  { step: '4', path: '/comparison', label: 'Scenario Comparison', short: 'Compare' },
  { step: '5', path: '/ledger', label: 'Emissions Ledger', short: 'Ledger' },
];

export default function WorkflowStepper() {
  const location = useLocation();

  // Find current step index
  const currentIndex = STEPS.findIndex((s) => s.path === location.pathname);

  return (
    <div
      className="border-b"
      style={{
        background: '#FFFFFF',
        borderColor: 'var(--color-surface-200)',
      }}
    >
      <div className="max-w-[76rem] mx-auto px-4 py-2 flex items-center justify-center">
        {/* Centered Step progression breadcrumbs */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
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
      </div>
    </div>
  );
}
