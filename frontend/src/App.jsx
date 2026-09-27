import { useState, useEffect, useRef, useCallback } from 'react';
import './index.css';

import Navbar from './components/Navbar';
import InputSection from './sections/InputSection';
import MatchingSection from './sections/MatchingSection';
import AllocationSection from './sections/AllocationSection';
import LedgerSection from './sections/LedgerSection';
import ComparisonSection from './sections/ComparisonSection';
import AboutSection from './sections/AboutSection';

import {
  matchWasteStream,
  allocateWasteStream,
  computeEmissions,
  computeComparison,
} from './lib/api';
import { COMPOSITION_PRESETS, MOISTURE_PRESETS, SITE_PRESETS } from './lib/formatters';

/** Default waste stream state */
const DEFAULT_WASTE_STREAM = {
  waste_type: 'flyash',
  quantity_tpm: 2000,
  location: { lat: SITE_PRESETS[0].lat, lng: SITE_PRESETS[0].lng },
  composition: { ...COMPOSITION_PRESETS.flyash },
  moisture_pct: MOISTURE_PRESETS.flyash,
};

export default function App() {
  // ── State ──
  const [wasteStream, setWasteStream] = useState(DEFAULT_WASTE_STREAM);
  const [matchResults, setMatchResults] = useState([]);
  const [allocations, setAllocations] = useState([]);
  const [emissions, setEmissions] = useState(null);
  const [comparison, setComparison] = useState(null);

  const [loading, setLoading] = useState({ match: false, rest: false });
  const [error, setError] = useState(null);

  const debounceRef = useRef(null);
  const abortRef = useRef(null);

  // ── Debounced API calls (300ms) ──
  const fetchAll = useCallback(async (ws) => {
    // Abort any in-flight request
    if (abortRef.current) {
      abortRef.current.abort();
    }
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading({ match: true, rest: true });
    setError(null);

    try {
      // Real matching call
      const matchData = await matchWasteStream(ws);
      if (controller.signal.aborted) return;
      setMatchResults(matchData);
      setLoading((prev) => ({ ...prev, match: false }));

      // Mock calls (fire in parallel)
      const [allocData, emissionsData, comparisonData] = await Promise.all([
        allocateWasteStream(ws),
        computeEmissions(ws),
        computeComparison(ws),
      ]);
      if (controller.signal.aborted) return;

      setAllocations(allocData);
      setEmissions(emissionsData);
      setComparison(comparisonData);
      setLoading({ match: false, rest: false });
    } catch (err) {
      if (controller.signal.aborted) return;
      setError(err.message || 'Unknown error');
      setLoading({ match: false, rest: false });
    }
  }, []);

  // ── Debounce wrapper ──
  const handleInputChange = useCallback(
    (newWasteStream) => {
      setWasteStream(newWasteStream);

      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      debounceRef.current = setTimeout(() => {
        fetchAll(newWasteStream);
      }, 300);
    },
    [fetchAll]
  );

  // ── Initial fetch on mount ──
  useEffect(() => {
    fetchAll(wasteStream);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (abortRef.current) abortRef.current.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-surface-900)' }}>
      <Navbar />

      {/* Spacer for fixed navbar */}
      <div style={{ height: '3.5rem' }} />

      <main>
        <InputSection
          wasteStream={wasteStream}
          onChange={handleInputChange}
        />
        <MatchingSection
          results={matchResults}
          loading={loading.match}
          error={error}
        />
        <AllocationSection
          allocations={allocations}
          loading={loading.rest}
        />
        <LedgerSection
          emissions={emissions}
          loading={loading.rest}
        />
        <ComparisonSection
          comparison={comparison}
          loading={loading.rest}
        />
        <AboutSection />
      </main>

      {/* Footer */}
      <footer
        className="py-6 text-center border-t"
        style={{
          borderColor: 'var(--color-surface-600)',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.6875rem',
          color: 'var(--color-text-muted)',
        }}
      >
        Circularity Twin v0.1 — HackMatrix 5.0 PCCOE — ENR-04
      </footer>
    </div>
  );
}
