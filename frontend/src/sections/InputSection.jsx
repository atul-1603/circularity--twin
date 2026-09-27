import { useCallback } from 'react';
import {
  COMPOSITION_PRESETS,
  MOISTURE_PRESETS,
  SITE_PRESETS,
} from '../lib/formatters';

/**
 * InputSection — waste type, quantity, location, composition sliders, moisture.
 *
 * Composition redistribution logic:
 * When one slider moves, the delta is redistributed proportionally across
 * the other sliders to maintain sum ≈ 100%. If all others are at 0,
 * the remainder goes to "Other".
 */
export default function InputSection({ wasteStream, onChange }) {
  const { waste_type, quantity_tpm, location, composition, moisture_pct } =
    wasteStream;

  const update = useCallback(
    (patch) => onChange({ ...wasteStream, ...patch }),
    [wasteStream, onChange]
  );

  // ── Waste type change → reset composition & moisture to preset ──
  const handleWasteTypeChange = (e) => {
    const wt = e.target.value;
    update({
      waste_type: wt,
      composition: { ...COMPOSITION_PRESETS[wt] },
      moisture_pct: MOISTURE_PRESETS[wt],
    });
  };

  // ── Composition slider change with proportional redistribution ──
  const handleCompositionChange = (key, rawValue) => {
    const newValue = Math.max(0, Math.min(100, parseFloat(rawValue) || 0));
    const oldValue = composition[key] || 0;
    const delta = newValue - oldValue;

    const otherKeys = Object.keys(composition).filter((k) => k !== key);
    const otherSum = otherKeys.reduce((s, k) => s + (composition[k] || 0), 0);

    const newComp = { ...composition, [key]: newValue };

    if (otherSum > 0 && delta !== 0) {
      // Redistribute proportionally
      let remaining = -delta;
      otherKeys.forEach((k) => {
        const proportion = composition[k] / otherSum;
        const adjustment = proportion * remaining;
        newComp[k] = Math.max(0, Math.round((composition[k] + adjustment) * 10) / 10);
      });
    } else if (otherSum === 0 && delta < 0) {
      // If all others are 0 and we decreased, put remainder in Other
      newComp['Other'] = (newComp['Other'] || 0) + Math.abs(delta);
    }

    // Final normalization: ensure sum is exactly 100 by adjusting the largest
    const total = Object.values(newComp).reduce((s, v) => s + v, 0);
    if (Math.abs(total - 100) > 0.01) {
      const largestKey = Object.keys(newComp)
        .filter((k) => k !== key)
        .sort((a, b) => newComp[b] - newComp[a])[0];
      if (largestKey) {
        newComp[largestKey] = Math.round((newComp[largestKey] + (100 - total)) * 10) / 10;
      }
    }

    update({ composition: newComp });
  };

  // ── Location change ──
  const handleSiteChange = (e) => {
    const idx = parseInt(e.target.value, 10);
    const site = SITE_PRESETS[idx];
    update({ location: { lat: site.lat, lng: site.lng } });
  };

  const compEntries = Object.entries(composition);
  const compSum = compEntries.reduce((s, [, v]) => s + v, 0);

  return (
    <section id="input" className="border-b" style={{ borderColor: 'var(--color-surface-600)' }}>
      <div className="section-container">
        <h2 className="section-title">① Waste Stream Input</h2>
        <p className="section-subtitle">
          Define the industrial waste stream to evaluate for circular-economy pathways.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Waste Type */}
          <div className="panel">
            <label className="control-label" htmlFor="waste-type">Waste Type</label>
            <select
              id="waste-type"
              className="control-select"
              value={waste_type}
              onChange={handleWasteTypeChange}
            >
              <option value="flyash">Fly Ash</option>
              <option value="slag">Slag</option>
              <option value="tailings">Tailings</option>
            </select>
          </div>

          {/* Quantity */}
          <div className="panel">
            <label className="control-label" htmlFor="quantity">
              Quantity{' '}
              <span className="readout" style={{ color: 'var(--color-accent-500)' }}>
                {quantity_tpm.toLocaleString()} t/mo
              </span>
            </label>
            <input
              id="quantity"
              type="range"
              min="200"
              max="8000"
              step="50"
              value={quantity_tpm}
              onChange={(e) => update({ quantity_tpm: parseFloat(e.target.value) })}
            />
            <div className="flex justify-between mt-1" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.625rem', color: 'var(--color-text-muted)' }}>
              <span>200</span>
              <span>8,000</span>
            </div>
          </div>

          {/* Location */}
          <div className="panel">
            <label className="control-label" htmlFor="location">Source Site</label>
            <select
              id="location"
              className="control-select"
              onChange={handleSiteChange}
              defaultValue="0"
            >
              {SITE_PRESETS.map((site, i) => (
                <option key={i} value={i}>{site.label}</option>
              ))}
            </select>
            <div
              className="readout mt-2"
              style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)' }}
            >
              {location.lat.toFixed(2)}°N, {location.lng.toFixed(2)}°E
            </div>
          </div>

          {/* Moisture */}
          <div className="panel">
            <label className="control-label" htmlFor="moisture">
              Moisture{' '}
              <span className="readout" style={{ color: 'var(--color-accent-500)' }}>
                {moisture_pct.toFixed(1)}%
              </span>
            </label>
            <input
              id="moisture"
              type="range"
              min="0"
              max="50"
              step="0.5"
              value={moisture_pct}
              onChange={(e) => update({ moisture_pct: parseFloat(e.target.value) })}
            />
            <div className="flex justify-between mt-1" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.625rem', color: 'var(--color-text-muted)' }}>
              <span>0%</span>
              <span>50%</span>
            </div>
          </div>
        </div>

        {/* Composition Sliders */}
        <div className="panel">
          <div className="flex items-center justify-between mb-3">
            <span className="control-label" style={{ marginBottom: 0 }}>
              Chemical Composition (%)
            </span>
            <span
              className="readout text-xs"
              style={{
                color:
                  Math.abs(compSum - 100) <= 0.5
                    ? 'var(--color-status-eligible)'
                    : 'var(--color-status-ineligible)',
              }}
            >
              Σ = {compSum.toFixed(1)}%
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {compEntries.map(([key, value]) => (
              <div key={key} className="panel-inset">
                <div className="flex items-center justify-between mb-1">
                  <span
                    className="text-xs font-medium"
                    style={{
                      fontFamily: 'var(--font-mono)',
                      color: 'var(--color-text-secondary)',
                    }}
                  >
                    {key}
                  </span>
                  <span
                    className="readout text-xs"
                    style={{ color: 'var(--color-accent-400)' }}
                  >
                    {value.toFixed(1)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="0.5"
                  value={value}
                  onChange={(e) => handleCompositionChange(key, e.target.value)}
                  aria-label={`${key} percentage`}
                />
                {/* Visual bar */}
                <div
                  className="mt-1"
                  style={{
                    height: '3px',
                    background: 'var(--color-surface-600)',
                    width: '100%',
                  }}
                >
                  <div
                    style={{
                      height: '100%',
                      width: `${value}%`,
                      background: 'var(--color-accent-500)',
                      transition: 'width 0.15s ease',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
