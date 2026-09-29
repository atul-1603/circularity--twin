/**
 * Pathway definitions — economics, eligibility thresholds, and buyer cluster locations.
 *
 * Sources:
 *   - Cement: ASTM C618 / IS 3812:2013, IPCC AR6 WG III Table 11.3
 *   - Road:   IRC SP-58:2001
 *   - Brick:  IS 12894:2002 (Fly Ash-Lime-Gypsum Bricks)
 *
 * Economics are INR-denominated and reflect Indian industrial market rates (2024–26).
 * Buyer cluster coordinates are representative centroids for the nearest active
 * demand zone to NTPC Ramagundam / Telangana / Andhra Pradesh region.
 */

const PATHWAYS = [
  {
    key: 'cement',
    name: 'Cement / Concrete Substitution',
    requirementDescription:
      'SiO₂ + Al₂O₃ + Fe₂O₃ > 70% and CaO < 15% (ASTM C618 Class F pozzolan / IS 3812:2013)',

    // ── Economics (INR) ──
    procCostPerTonne: 500.0,        // ₹/t — grinding, blending, QC
    revenuePerTonne: 1800.0,        // ₹/t — offtake by cement blenders
    distanceCostFactor: 2.5,        // ₹/t·km — loaded road freight
    displacementCreditFactor: 0.83, // tCO2e/t — IPCC AR6 WG III Table 11.3
    processEmissionFactor: 0.040,   // tCO2e/t — ball-mill grinding energy

    // ── Buyer cluster: Hyderabad / AP cement belt (Deccan) ──
    buyerLat: 17.38,
    buyerLng: 78.48,
  },
  {
    key: 'road_subbase',
    name: 'Road Sub-base / Embankment Fill',
    requirementDescription:
      'Moisture < 20% for direct use; 20–27% marginal with lime stabilization (IRC SP-58:2001)',

    procCostPerTonne: 180.0,        // ₹/t — spreading, compaction testing
    revenuePerTonne: 350.0,         // ₹/t — road contractor offtake
    distanceCostFactor: 3.5,        // ₹/t·km — heavier payload trucks
    displacementCreditFactor: 0.03, // tCO2e/t — displaces crushed aggregate
    processEmissionFactor: 0.005,   // tCO2e/t — minimal: spreading + compaction

    // ── Buyer cluster: NH-44 / NH-65 Telangana zone ──
    buyerLat: 17.93,
    buyerLng: 79.02,
  },
  {
    key: 'brick',
    name: 'Brick / Block Manufacturing',
    requirementDescription:
      'SiO₂ + Al₂O₃ > 55% for adequate silicate bonding (IS 12894:2002 Fly Ash-Lime-Gypsum Bricks)',

    procCostPerTonne: 320.0,        // ₹/t — pressing, autoclaving, curing
    revenuePerTonne: 900.0,         // ₹/t — brick manufacturer offtake
    distanceCostFactor: 3.0,        // ₹/t·km
    displacementCreditFactor: 0.15, // tCO2e/t — vs. fired-clay bricks
    processEmissionFactor: 0.015,   // tCO2e/t — autoclave steam energy

    // ── Buyer cluster: Nalgonda / Suryapet brick belt (Telangana) ──
    buyerLat: 17.50,
    buyerLng: 79.30,
  },
];

/** Build a key → pathway lookup for O(1) access */
const PATHWAY_MAP = Object.fromEntries(PATHWAYS.map((p) => [p.key, p]));

module.exports = { PATHWAYS, PATHWAY_MAP };
