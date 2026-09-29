/**
 * Emissions and comparison service.
 *
 * computeEmissions — auditable per-pathway emissions ledger.
 *   Displacement credits, transport factor, and landfill baseline all come
 *   from data/emission_factors.json (IPCC AR6 WG III / ecoinvent 3.9).
 *   Process emission factors come from data/pathways.js.
 *   Distance comes from the allocation record (haversine-computed).
 *
 * computeComparison — head-to-head financial and carbon comparison.
 *   FIX — cost_delta sign corrected:
 *     Old: reuseRevenue − reuseCost − landfillCost  (subtracted the saving!)
 *     New: reuseRevenue − reuseCost + landfillCost
 *     Meaning: "how much better off (₹) is reuse vs disposal?"
 *              = avoided landfill spend + circular margin
 *   FIX — landfill baseline emissions now from emission_factors.json.
 *   FIX — diversion_pct included so frontend doesn't need to hardcode 100%.
 *   FIX — landfill_cost uses ₹400/t (CPCB India tipping fee), not mock $18/t.
 */

const path = require('path');
const fs   = require('fs');
const { PATHWAY_MAP } = require('../data/pathways');

// ── Load emission factors from JSON at startup ──────────────────────────────
const EF_PATH = path.join(__dirname, '../data/emission_factors.json');
const EF = JSON.parse(fs.readFileSync(EF_PATH, 'utf-8'));

// Pre-index displacement credits for O(1) lookup
const DISPLACEMENT = Object.fromEntries(
  Object.entries(EF.displacement_credits).map(([k, v]) => [k, v.value])
);
const TRANSPORT_FACTOR  = EF.transport.truck_loaded.value;   // tCO2e/t·km
const LANDFILL_BASELINE = EF.landfill_baseline.value;        // tCO2e/t

const METHODOLOGY_VERSION = (
  `v0.2 · IPCC AR6 WG III · ecoinvent 3.9 · emission_factors.json ${EF._meta.version}`
);

// ── computeEmissions ────────────────────────────────────────────────────────

/**
 * Compute the auditable emissions ledger for each allocated pathway.
 *
 * @param {object} waste       - WasteStream
 * @param {Array}  allocations - output of allocate()
 * @returns {object} { entries, total_avoided_tco2e, methodology_version }
 */
function computeEmissions(waste, allocations) {
  let totalAvoided = 0.0;

  const entries = allocations.map((alloc) => {
    const qty     = alloc.allocated_tpm;
    const pkey    = alloc.pathway_key;
    const distKm  = alloc.distance_km ?? 50.0;  // fallback if key missing

    const credit          = DISPLACEMENT[pkey]                   ?? 0.10;
    const processFactor   = PATHWAY_MAP[pkey]?.processEmissionFactor ?? 0.020;
    const transportFactor = TRANSPORT_FACTOR;

    const displaced    = Number((credit        * qty).toFixed(2));
    const processEm    = Number((processFactor * qty).toFixed(2));
    const transportEm  = Number((transportFactor * distKm * qty).toFixed(2));
    const avoided      = Number((displaced - processEm - transportEm).toFixed(2));

    totalAvoided += avoided;

    return {
      pathway_key:                 pkey,
      pathway_name:                alloc.pathway_name,
      allocated_tpm:               qty,
      distance_km:                 distKm,
      displacement_credit_tco2e:   displaced,
      process_emissions_tco2e:     processEm,
      transport_emissions_tco2e:   transportEm,
      net_avoided_tco2e:           avoided,
      formula: (
        `${credit} × ${qty} t ` +
        `− ${processFactor} × ${qty} t ` +
        `− ${transportFactor} × ${distKm.toFixed(1)} km × ${qty} t`
      ),
    };
  });

  return {
    entries,
    total_avoided_tco2e: Number(totalAvoided.toFixed(2)),
    methodology_version: METHODOLOGY_VERSION,
  };
}

// ── computeComparison ───────────────────────────────────────────────────────

/**
 * Head-to-head financial and carbon comparison: reuse vs. landfill disposal.
 *
 * @param {object} waste       - WasteStream
 * @param {Array}  allocations - output of allocate()
 * @param {object} emissions   - output of computeEmissions()
 * @returns {object} comparison record
 */
function computeComparison(waste, allocations, emissions) {
  const qty = waste.quantity_tpm;

  // Disposal scenario (baseline)
  const landfillCost      = Number((qty * 400.0).toFixed(2));             // ₹400/t tipping fee (CPCB India)
  const landfillEmissions = Number((qty * LANDFILL_BASELINE).toFixed(2)); // from JSON

  // Reuse scenario totals
  const totalAllocated = allocations.reduce((s, a) => s + a.allocated_tpm, 0);
  const reuseRevenue   = Number(allocations.reduce((s, a) => s + a.revenue,                      0).toFixed(2));
  const reuseCost      = Number(allocations.reduce((s, a) => s + a.proc_cost + a.transport_cost, 0).toFixed(2));
  const reuseAvoided   = emissions.total_avoided_tco2e;

  // Diversion rate
  const diversionPct = qty > 0
    ? Number(((totalAllocated / qty) * 100).toFixed(1))
    : 0.0;

  return {
    disposal: {
      cost:            landfillCost,
      emissions_tco2e: landfillEmissions,
      revenue:         0,
    },
    reuse: {
      cost:                     reuseCost,
      emissions_avoided_tco2e:  reuseAvoided,
      revenue:                  reuseRevenue,
    },
    savings: {
      // Corrected sign: avoided landfill spend + circular margin
      cost_delta:            Number((reuseRevenue - reuseCost + landfillCost).toFixed(2)),
      emissions_delta_tco2e: Number((reuseAvoided + landfillEmissions).toFixed(2)),
    },
    diversion_pct: diversionPct,
  };
}

module.exports = { computeEmissions, computeComparison };
