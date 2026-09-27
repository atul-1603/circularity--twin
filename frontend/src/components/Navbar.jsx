import { useState, useEffect } from 'react';

const NAV_ITEMS = [
  { id: 'input', label: 'Input' },
  { id: 'matching', label: 'Matching' },
  { id: 'allocation', label: 'Allocation' },
  { id: 'ledger', label: 'Ledger' },
  { id: 'comparison', label: 'Compare' },
  { id: 'about', label: 'About' },
];

export default function Navbar() {
  const [activeSection, setActiveSection] = useState('input');

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        // Find the entry with the largest intersection ratio
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible.length > 0) {
          setActiveSection(visible[0].target.id);
        }
      },
      { rootMargin: '-80px 0px -50% 0px', threshold: [0, 0.25, 0.5] }
    );

    NAV_ITEMS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 border-b"
      style={{
        background: 'rgba(10, 14, 20, 0.92)',
        backdropFilter: 'blur(12px)',
        borderColor: 'var(--color-surface-600)',
      }}
    >
      <div className="max-w-[80rem] mx-auto px-4 flex items-center justify-between h-14">
        {/* Logo / Title */}
        <a
          href="#input"
          className="flex items-center gap-2 no-underline"
          style={{ color: 'var(--color-accent-500)' }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2L2 7l10 5 10-5-10-5z" />
            <path d="M2 17l10 5 10-5" />
            <path d="M2 12l10 5 10-5" />
          </svg>
          <span
            className="font-bold text-sm tracking-widest uppercase"
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            Circularity Twin
          </span>
        </a>

        {/* Nav Links */}
        <div className="flex items-center gap-1">
          {NAV_ITEMS.map(({ id, label }) => (
            <a
              key={id}
              href={`#${id}`}
              className="px-3 py-1.5 text-xs font-medium uppercase tracking-wider no-underline transition-colors duration-150"
              style={{
                fontFamily: 'var(--font-mono)',
                color:
                  activeSection === id
                    ? 'var(--color-accent-500)'
                    : 'var(--color-text-secondary)',
                background:
                  activeSection === id
                    ? 'var(--color-accent-glow)'
                    : 'transparent',
                borderBottom:
                  activeSection === id
                    ? '2px solid var(--color-accent-500)'
                    : '2px solid transparent',
              }}
            >
              {label}
            </a>
          ))}
        </div>
      </div>
    </nav>
  );
}
