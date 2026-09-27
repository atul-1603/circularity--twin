import { createContext, useContext, useState, useRef, useCallback, useEffect } from 'react';
import {
  matchWasteStream,
  allocateWasteStream,
  computeEmissions,
  computeComparison,
} from './api';
import { COMPOSITION_PRESETS, MOISTURE_PRESETS, SITE_PRESETS } from './formatters';

/** Default waste stream state */
const DEFAULT_WASTE_STREAM = {
  waste_type: 'flyash',
  quantity_tpm: 2000,
  location: { lat: SITE_PRESETS[0].lat, lng: SITE_PRESETS[0].lng },
  composition: { ...COMPOSITION_PRESETS.flyash },
  moisture_pct: MOISTURE_PRESETS.flyash,
};

const WasteContext = createContext(null);

export function useWaste() {
  const ctx = useContext(WasteContext);
  if (!ctx) throw new Error('useWaste must be used within WasteProvider');
  return ctx;
}

export function WasteProvider({ children }) {
  const [wasteStream, setWasteStream] = useState(DEFAULT_WASTE_STREAM);
  const [matchResults, setMatchResults] = useState([]);
  const [allocations, setAllocations] = useState([]);
  const [emissions, setEmissions] = useState(null);
  const [comparison, setComparison] = useState(null);

  const [loading, setLoading] = useState({ match: false, rest: false });
  const [error, setError] = useState(null);

  const debounceRef = useRef(null);
  const abortRef = useRef(null);

  // ── Fetch all API data ──
  const fetchAll = useCallback(async (ws) => {
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading({ match: true, rest: true });
    setError(null);

    try {
      const matchData = await matchWasteStream(ws);
      if (controller.signal.aborted) return;
      setMatchResults(matchData);
      setLoading((prev) => ({ ...prev, match: false }));

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

  // ── Debounce wrapper (300ms) ──
  const handleInputChange = useCallback(
    (newWasteStream) => {
      setWasteStream(newWasteStream);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => fetchAll(newWasteStream), 300);
    },
    [fetchAll]
  );

  // ── Initial fetch ──
  useEffect(() => {
    fetchAll(wasteStream);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (abortRef.current) abortRef.current.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <WasteContext.Provider
      value={{
        wasteStream,
        handleInputChange,
        matchResults,
        allocations,
        emissions,
        comparison,
        loading,
        error,
      }}
    >
      {children}
    </WasteContext.Provider>
  );
}
