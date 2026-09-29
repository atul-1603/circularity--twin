import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWaste } from '../lib/WasteContext';
import {
  COMPOSITION_PRESETS,
  MOISTURE_PRESETS,
  SITE_PRESETS,
  formatNumber,
} from '../lib/formatters';

export default function InputPage() {
  const { wasteStream, handleInputChange } = useWaste();
  const navigate = useNavigate();

  const { waste_type, quantity_tpm, location, composition, moisture_pct } =
    wasteStream;

  const update = useCallback(
    (patch) => handleInputChange({ ...wasteStream, ...patch }),
    [wasteStream, handleInputChange]
  );

  // Waste type change → reset composition & moisture to preset
  const handleWasteTypeChange = (wt) => {
    update({
      waste_type: wt,
      composition: { ...COMPOSITION_PRESETS[wt] },
      moisture_pct: MOISTURE_PRESETS[wt],
    });
  };

  // Composition slider change with proportional redistribution
  const handleCompositionChange = (key, rawValue) => {
    const newValue = Math.max(0, Math.min(100, parseFloat(rawValue) || 0));
    const oldValue = composition[key] || 0;
    const delta = newValue - oldValue;

    const otherKeys = Object.keys(composition).filter((k) => k !== key);
    const otherSum = otherKeys.reduce((s, k) => s + (composition[k] || 0), 0);

    const newComp = { ...composition, [key]: newValue };

    if (otherSum > 0 && delta !== 0) {
      let remaining = -delta;
      otherKeys.forEach((k) => {
        const proportion = composition[k] / otherSum;
        const adjustment = proportion * remaining;
        newComp[k] = Math.max(0, Math.round((composition[k] + adjustment) * 10) / 10);
      });
    } else if (otherSum === 0 && delta < 0) {
      newComp['Other'] = (newComp['Other'] || 0) + Math.abs(delta);
    }

    // Final normalization
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

  // Location change
  const handleSiteChange = (e) => {
    const idx = parseInt(e.target.value, 10);
    const site = SITE_PRESETS[idx];
    update({ location: { lat: site.lat, lng: site.lng } });
  };

  const compEntries = Object.entries(composition);
  const compSum = compEntries.reduce((s, [, v]) => s + v, 0);
  const isBalanced = Math.abs(compSum - 100) <= 0.5;

  return (
    <div className="page-container">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="page-title text-2xl font-bold text-slate-900">
              Waste Stream Characterization
            </h1>
            <span className="badge badge-eligible">STEP 1 OF 5</span>
          </div>
          <p className="page-subtitle mb-0 text-slate-600">
            Define material physical properties, monthly generated volume, facility location, and assay oxide fractions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/matching')}
            className="btn-primary"
          >
            Evaluate Pathways →
          </button>
        </div>
      </div>

      {/* Industrial Stream Selector Tabs */}
      <div className="panel bg-white p-4 mb-6">
        <label className="text-xs uppercase font-mono tracking-wider font-semibold text-slate-600 block mb-3">
          Select Industrial Material Feedstock:
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            {
              id: 'flyash',
              name: 'Coal Fly Ash',
              source: 'Thermal Power Station',
              spec: 'ASTM C618 Class F / IS 3812',
            },
            {
              id: 'slag',
              name: 'Blast Furnace Slag',
              source: 'Integrated Steel Plant',
              spec: 'GGBS / IS 12089',
            },
            {
              id: 'tailings',
              name: 'Bauxite Residue / Tailings',
              source: 'Alumina Refinery',
              spec: 'Red Mud / High Iron Alumina',
            },
          ].map((type) => {
            const isSelected = waste_type === type.id;
            return (
              <button
                key={type.id}
                type="button"
                onClick={() => handleWasteTypeChange(type.id)}
                className={`stream-type-card p-3 rounded-lg border text-left transition-all ${
                  isSelected
                    ? 'bg-teal-50/70 border-teal-600 ring-2 ring-teal-600/20'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={`font-semibold text-sm ${
                      isSelected ? 'text-teal-900' : 'text-slate-900'
                    }`}
                  >
                    {type.name}
                  </span>
                  {isSelected && (
                    <span className="w-2 h-2 rounded-full bg-teal-600" />
                  )}
                </div>
                <div className="text-xs text-slate-500 font-sans">{type.source}</div>
                <div className="text-[11px] font-mono text-slate-400 mt-1">
                  {type.spec}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Primary Parameters Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
        {/* Quantity (t/mo) */}
        <div className="panel metric-panel bg-white p-5">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs uppercase font-mono tracking-wider font-semibold text-slate-600" htmlFor="quantity-input">
              Generation Volume
            </label>
            <span className="readout text-lg font-bold text-teal-800">
              {formatNumber(quantity_tpm, 0)} t/mo
            </span>
          </div>

          <input
            id="quantity-slider"
            type="range"
            min="200"
            max="8000"
            step="50"
            value={quantity_tpm}
            onChange={(e) => update({ quantity_tpm: parseFloat(e.target.value) })}
            className="w-full my-2"
          />

          <div className="flex justify-between text-xs text-slate-400 font-mono mb-3">
            <span>200 t/mo</span>
            <span>4,000</span>
            <span>8,000 t/mo</span>
          </div>

          <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
            <span className="text-xs text-slate-500">Quick:</span>
            {[1000, 2000, 4000, 6000].map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => update({ quantity_tpm: val })}
                className="px-2 py-1 text-xs font-mono rounded bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
              >
                {val}t
              </button>
            ))}
          </div>
        </div>

        {/* Moisture (%) */}
        <div className="panel metric-panel bg-white p-5">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs uppercase font-mono tracking-wider font-semibold text-slate-600" htmlFor="moisture-slider">
              Moisture Content
            </label>
            <span
              className={`readout text-lg font-bold ${
                moisture_pct <= 20 ? 'text-teal-800' : 'text-amber-700'
              }`}
            >
              {moisture_pct.toFixed(1)}% wt
            </span>
          </div>

          <input
            id="moisture-slider"
            type="range"
            min="0"
            max="50"
            step="0.5"
            value={moisture_pct}
            onChange={(e) => update({ moisture_pct: parseFloat(e.target.value) })}
            className="w-full my-2"
          />

          <div className="flex justify-between text-xs text-slate-400 font-mono mb-3">
            <span>0% (Dry)</span>
            <span>20% (Road Spec Limit)</span>
            <span>50%</span>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
            <span className="text-slate-500 font-mono">IRC SP-58 Limit:</span>
            <span
              className={`font-semibold font-mono ${
                moisture_pct <= 20 ? 'text-emerald-700' : 'text-amber-600'
              }`}
            >
              {moisture_pct <= 20 ? '✓ Within tolerance (≤20%)' : '⚠ Exceeds limit (>20%)'}
            </span>
          </div>
        </div>

        {/* Source Facility / Location */}
        <div className="panel metric-panel bg-white p-5">
          <label className="text-xs uppercase font-mono tracking-wider font-semibold text-slate-600 block mb-2" htmlFor="site-select">
            Facility Origin Site
          </label>

          <select
            id="site-select"
            className="control-select mb-3"
            onChange={handleSiteChange}
            defaultValue="0"
          >
            {SITE_PRESETS.map((site, i) => (
              <option key={i} value={i}>
                {site.label}
              </option>
            ))}
          </select>

          <div className="p-2.5 rounded bg-slate-50 border border-slate-200 text-xs font-mono space-y-1">
            <div className="flex justify-between text-slate-500">
              <span>Geo-Coordinates:</span>
              <span className="font-semibold text-slate-800">
                {location.lat.toFixed(2)}°N, {location.lng.toFixed(2)}°E
              </span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Logistics Radius:</span>
              <span className="text-teal-700">~120 km radius mapped</span>
            </div>
          </div>
        </div>
      </div>

      {/* Chemical Composition Oxide Assay */}
      <div className="panel bg-white p-6 mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-200">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Chemical Assay & Oxide Breakdown (% wt)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Adjust oxide percentages. Sliders automatically redistribute to preserve mass conservation (Σ = 100%).
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => handleWasteTypeChange(waste_type)}
              className="text-xs font-mono text-teal-700 hover:text-teal-800 underline"
            >
              Reset to Standard {waste_type} Spec
            </button>
            <span
              className={`readout px-2.5 py-1 rounded text-xs border ${
                isBalanced
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300 font-bold'
                  : 'bg-rose-50 text-rose-800 border-rose-300 font-bold'
              }`}
            >
              Total Σ = {compSum.toFixed(1)}% {isBalanced ? '✓ Balanced' : '⚠ Imbalanced'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {compEntries.map(([key, value]) => {
            const isSilicaGroup = ['SiO2', 'Al2O3', 'Fe2O3'].includes(key);
            return (
              <div key={key} className="assay-card panel-inset bg-slate-50 border border-slate-200 p-3.5">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-slate-800 font-mono">
                    {key}
                  </span>
                  <span className="readout text-sm font-bold text-teal-800">
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
                  className="w-full"
                />

                <div className="mt-2 h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      isSilicaGroup ? 'bg-teal-600' : 'bg-slate-500'
                    }`}
                    style={{ width: `${Math.min(100, value)}%` }}
                  />
                </div>

                <div className="text-[10px] text-slate-400 font-mono mt-1 text-right">
                  {key === 'SiO2' && 'Silicon Dioxide'}
                  {key === 'Al2O3' && 'Aluminum Oxide'}
                  {key === 'Fe2O3' && 'Iron Oxide'}
                  {key === 'CaO' && 'Calcium Oxide'}
                  {key === 'Other' && 'Residual Oxides'}
                </div>
              </div>
            );
          })}
        </div>

        {/* Pozzolanic ratio indicator */}
        <div className="mt-4 p-3 bg-teal-50/50 rounded-lg border border-teal-200 flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
          <span className="text-teal-900">
            <strong>ASTM C618 Key Pozzolanic Sum (SiO₂ + Al₂O₃ + Fe₂O₃):</strong>{' '}
            <span className="text-sm font-bold text-teal-800">
              {((composition.SiO2 || 0) + (composition.Al2O3 || 0) + (composition.Fe2O3 || 0)).toFixed(1)}%
            </span>{' '}
            (Threshold: ≥ 70.0%)
          </span>
          <span className="text-slate-600">
            <strong>Free Lime (CaO):</strong> {composition.CaO?.toFixed(1) || '0.0'}% (Threshold: &lt; 15.0%)
          </span>
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-200">
        <span className="text-xs font-mono text-slate-500">
          Parameters are automatically synchronized with the matching engine.
        </span>
        <button
          onClick={() => navigate('/matching')}
          className="btn-primary"
        >
          Evaluate Pathway Eligibility →
        </button>
      </div>
    </div>
  );
}
