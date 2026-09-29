import { Routes, Route, Navigate } from 'react-router-dom';
import { WasteProvider } from './lib/WasteContext';
import Navbar from './components/Navbar';
import WorkflowStepper from './components/WorkflowStepper';
import InputPage from './pages/InputPage';
import MatchingPage from './pages/MatchingPage';
import AllocationPage from './pages/AllocationPage';
import ComparisonPage from './pages/ComparisonPage';
import LedgerPage from './pages/LedgerPage';
import AboutPage from './pages/AboutPage';

export default function App() {
  return (
    <WasteProvider>
      <div className="min-h-screen bg-slate-50 flex flex-col justify-between" style={{ backgroundColor: 'var(--color-surface-100)' }}>
        <div>
          {/* Sticky navigation bar */}
          <Navbar />

          {/* Persistent industrial workflow stepper */}
          <WorkflowStepper />

          {/* Main Page Content */}
          <main>
            <Routes>
              <Route path="/" element={<InputPage />} />
              <Route path="/matching" element={<MatchingPage />} />
              <Route path="/allocation" element={<AllocationPage />} />
              <Route path="/comparison" element={<ComparisonPage />} />
              <Route path="/ledger" element={<LedgerPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>

        {/* Industrial Engineering Footer */}
        <footer
          className="py-6 mt-12 bg-white border-t text-center font-mono text-xs text-slate-500"
          style={{ borderColor: 'var(--color-surface-200)' }}
        >
          <div className="max-w-[76rem] mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
            <span>
              Circularity Twin Decision Engine • HackMatrix 5.0 PCCOE (ENR-04)
            </span>
            <span className="text-[11px] text-slate-400">
              Deterministic Auditable Carbon Accounting • ASTM / IS / IRC Aligned
            </span>
          </div>
        </footer>
      </div>
    </WasteProvider>
  );
}
