import { NavLink } from 'react-router-dom';

const NAV_ITEMS = [
  { to: '/', label: '1. Input' },
  { to: '/matching', label: '2. Matching' },
  { to: '/allocation', label: '3. Allocation' },
  { to: '/comparison', label: '4. Compare' },
  { to: '/ledger', label: '5. Ledger' },
  { to: '/about', label: 'Methodology' },
];

export default function Navbar() {
  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 border-b bg-white"
      style={{
        borderColor: 'var(--color-surface-200)',
        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)',
      }}
    >
      <div className="max-w-[76rem] mx-auto px-4 flex items-center justify-between h-16">
        {/* Brand / Title */}
        <NavLink
          to="/"
          className="flex items-center gap-3 no-underline"
        >
          <div className="w-9 h-9 rounded-lg bg-teal-700 flex items-center justify-center text-white shadow-sm">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21.5 2v6h-6" />
              <path d="M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base tracking-tight text-slate-900 leading-tight">
                Circularity Twin
              </span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-teal-50 text-teal-800 border border-teal-200">
                ENR-04
              </span>
            </div>
            <span className="font-mono text-[11px] text-slate-500 block leading-none mt-0.5">
              Industrial Waste Decision Platform
            </span>
          </div>
        </NavLink>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1">
          {NAV_ITEMS.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `nav-link ${isActive ? 'active' : ''}`
              }
            >
              {label}
            </NavLink>
          ))}
        </div>

        {/* Engine Status Badge */}
        <div className="hidden lg:flex items-center gap-2 font-mono text-xs text-slate-500 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[11px] font-semibold text-slate-700">ENGINE READY</span>
          <span className="text-slate-300">|</span>
          <span className="text-[10px] text-slate-400">DETERMINISTIC</span>
        </div>
      </div>
    </nav>
  );
}
