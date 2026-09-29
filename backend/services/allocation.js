/**
 * Allocation service — distributes waste tonnage across eligible pathways.
 *
 * Uses per-pathway revenue/cost rates from data/pathways.js and real
 * great-circle distance (haversine) from the waste source to each pathway's
 * representative buyer cluster.
 *
 * Current implementation: proportional even-split (mock optimizer).
 * TODO: replace with real LP (e.g. linprog / PuLP via python or glpk.js)
 *       to maximise net_benefit subject to buyer capacity constraints.
 *
 * FIX: replaces former hardcoded 50 km flat rate and mock ₹ values.
 */

const { PATHWAY_MAP } = require('../data/pathways');
const { haversineKm } = require('../utils');

/**
 * Allocate tonnage evenly across eligible + marginal pathways.
 *
 * @param {object} waste      - WasteStream: { quantity_tpm, location: {lat, lng}, ... }
 * @param {Array}  matchResults - output of runMatching()
 * @returns {Array} allocation records
 */
function allocate(waste, matchResults) {
  const eligible = matchResults.filter(
    (m) => m.status === 'eligible' || m.status === 'marginal'
  );

  if (eligible.length === 0) return [];

  const share = waste.quantity_tpm / eligible.length;
  const srcLat = waste.location?.lat ?? 0;
  const srcLng = waste.location?.lng ?? 0;

  return eligible.map((m) => {
    const pathway = PATHWAY_MAP[m.pathway_key];
    if (!pathway) return null;

    // Real great-circle distance: waste source → buyer cluster
    const distanceKm = haversineKm(srcLat, srcLng, pathway.buyerLat, pathway.buyerLng);

    const revenue       = Number((pathway.revenuePerTonne       * share).toFixed(2));
    const procCost      = Number((pathway.procCostPerTonne       * share).toFixed(2));
    const transportCost = Number((pathway.distanceCostFactor * distanceKm * share).toFixed(2));
    const netBenefit    = Number((revenue - procCost - transportCost).toFixed(2));

    return {
      pathway_key:   m.pathway_key,
      pathway_name:  m.name,
      status:        m.status,           // included so frontend can show correct badge
      allocated_tpm: Number(share.toFixed(1)),
      proc_cost:     procCost,
      revenue:       revenue,
      transport_cost: transportCost,
      distance_km:   Number(distanceKm.toFixed(1)),
      net_benefit:   netBenefit,
    };
  }).filter(Boolean);
}

module.exports = { allocate };
