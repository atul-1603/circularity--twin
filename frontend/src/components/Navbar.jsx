import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';

const NAV_ITEMS = [
  { to: '/', label: 'Input', step: '1' },
  { to: '/matching', label: 'Matching', step: '2' },
  { to: '/allocation', label: 'Allocation', step: '3' },
  { to: '/comparison', label: 'Compare', step: '4' },
  { to: '/ledger', label: 'Ledger', step: '5' },
  { to: '/about', label: 'Methodology', step: 'ℹ' },
];

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-[80rem] mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        
        {/* Brand (Left) */}
        <div className="flex-1 flex items-center justify-start">
          <NavLink to="/" className="flex items-center gap-2.5 no-underline group">
            <div className="w-8 h-8 rounded-lg bg-teal-700 flex items-center justify-center text-white shadow-xs group-hover:bg-teal-600 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
              </svg>
            </div>
            <span className="font-bold text-base tracking-tight text-slate-900 group-hover:text-teal-700 transition-colors">
              Circularity Twin
            </span>
          </NavLink>
        </div>

        {/* Centered Process Bar */}
        <nav className="hidden md:flex items-center justify-center gap-1 bg-slate-100/80 p-1 rounded-lg border border-slate-200/60">
          {NAV_ITEMS.map((item) => {
            const isActive = location.pathname === item.to || (item.to === '/' && location.pathname === '');
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={`
                  px-3.5 py-1.5 rounded-md font-medium text-xs transition-all duration-150 no-underline flex items-center gap-1.5
                  ${
                    isActive
                      ? 'bg-white text-teal-800 font-semibold shadow-xs border border-slate-200/80'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                  }
                `}
              >
                <span className={`text-[10px] font-mono px-1 py-0.2 rounded ${isActive ? 'bg-teal-50 text-teal-700 font-bold' : 'text-slate-400'}`}>
                  {item.step}
                </span>
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Right Spacer for Symmetry */}
        <div className="flex-1 hidden md:flex justify-end" />

        {/* Mobile Toggle */}
        <button
          onClick={() => setMobileMenuOpen((prev) => !prev)}
          className="md:hidden p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 py-3 space-y-1 shadow-md">
          {NAV_ITEMS.map((item) => {
            const isActive = location.pathname === item.to || (item.to === '/' && location.pathname === '');
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between p-2 rounded-md text-sm font-medium transition-colors no-underline ${
                  isActive
                    ? 'bg-teal-50 text-teal-800 font-semibold'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span>{item.label}</span>
                <span className="font-mono text-xs text-slate-400">Step {item.step}</span>
              </NavLink>
            );
          })}
        </div>
      )}
    </header>
  );
}
