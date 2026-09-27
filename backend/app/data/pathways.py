"""
Static pathway definitions for circular-economy reuse of industrial waste.

Each pathway has:
  - eligibility_rule: hard pass/fail based on composition & moisture
  - marginal_rule: softer band — meets basic criteria but near the boundary

Thresholds are drawn from industry standards (cited inline).
"""

from dataclasses import dataclass, field
from typing import Callable, Dict


@dataclass
class Pathway:
    """A reuse pathway that a waste stream can be evaluated against."""
    key: str
    name: str
    requirement_description: str
    eligibility_rule: Callable[[Dict[str, float], float], bool]
    marginal_rule: Callable[[Dict[str, float], float], bool]
    proc_cost_per_tonne: float
    revenue_per_tonne: float
    distance_cost_factor: float
    displacement_credit_factor: float  # tCO2e/t — used by emissions ledger


def _get(comp: Dict[str, float], key: str) -> float:
    """Safely get a composition value, defaulting to 0."""
    return comp.get(key, 0.0)


# ---------------------------------------------------------------------------
# Pathway 1: Cement / Concrete Substitution (Supplementary Cementitious Material)
#
# Source: ASTM C618 (Standard Specification for Coal Fly Ash and Raw or Calcined
# Natural Pozzolan for Use in Concrete) requires SiO2 + Al2O3 + Fe2O3 ≥ 70%
# for Class F fly ash. CaO < 15% distinguishes Class F (pozzolanic) from Class C.
# See also IS 3812:2013 (Indian standard) which mirrors these thresholds.
# ---------------------------------------------------------------------------
def _cement_eligible(comp: Dict[str, float], moisture: float) -> bool:
    pozzolanic_sum = _get(comp, "SiO2") + _get(comp, "Al2O3") + _get(comp, "Fe2O3")
    return pozzolanic_sum > 70.0 and _get(comp, "CaO") < 15.0


def _cement_marginal(comp: Dict[str, float], moisture: float) -> bool:
    """Marginal: pozzolanic sum 65–70% OR CaO 15–20% (still usable with blending)."""
    pozzolanic_sum = _get(comp, "SiO2") + _get(comp, "Al2O3") + _get(comp, "Fe2O3")
    cao = _get(comp, "CaO")
    in_marginal_sum = 65.0 <= pozzolanic_sum <= 70.0
    in_marginal_cao = 15.0 <= cao <= 20.0
    # Marginal if within either soft band but not fully eligible
    return (in_marginal_sum or in_marginal_cao) and not _cement_eligible(comp, moisture)


# ---------------------------------------------------------------------------
# Pathway 2: Road Sub-base / Embankment Fill
#
# Source: IRC SP-58:2001 (Indian Roads Congress) and FHWA guidelines for use of
# industrial by-products in road construction. Moisture must be controllable for
# compaction — typically < 20% optimum moisture content (OMC). Materials with
# moisture 20–27% can still be used with additional drying/stabilization.
# ---------------------------------------------------------------------------
def _road_eligible(comp: Dict[str, float], moisture: float) -> bool:
    return moisture < 20.0


def _road_marginal(comp: Dict[str, float], moisture: float) -> bool:
    """Marginal: moisture 20–27% — usable with pre-conditioning / lime stabilization."""
    return 20.0 <= moisture <= 27.0


# ---------------------------------------------------------------------------
# Pathway 3: Brick / Block Manufacturing
#
# Source: IS 12894:2002 (Fly Ash-Lime-Gypsum Bricks) and BIS standards.
# Minimum SiO2 + Al2O3 > 55% for adequate silicate bonding in autoclaved or
# pressed blocks. Marginal band: 50–55%.
# ---------------------------------------------------------------------------
def _brick_eligible(comp: Dict[str, float], moisture: float) -> bool:
    silicate_sum = _get(comp, "SiO2") + _get(comp, "Al2O3")
    return silicate_sum > 55.0


def _brick_marginal(comp: Dict[str, float], moisture: float) -> bool:
    """Marginal: SiO2+Al2O3 between 50 and 55% — may work with additives."""
    silicate_sum = _get(comp, "SiO2") + _get(comp, "Al2O3")
    return 50.0 <= silicate_sum <= 55.0 and not _brick_eligible(comp, moisture)


# ---------------------------------------------------------------------------
# Seed data — the list of all pathways available in the system
# ---------------------------------------------------------------------------
PATHWAYS: list[Pathway] = [
    Pathway(
        key="cement",
        name="Cement / Concrete Substitution",
        requirement_description=(
            "SiO₂ + Al₂O₃ + Fe₂O₃ > 70% and CaO < 15% "
            "(ASTM C618 Class F pozzolan)"
        ),
        eligibility_rule=_cement_eligible,
        marginal_rule=_cement_marginal,
        proc_cost_per_tonne=12.0,
        revenue_per_tonne=45.0,
        distance_cost_factor=0.08,
        displacement_credit_factor=0.83,  # tCO2e/t — IPCC AR6 WG III
    ),
    Pathway(
        key="road_subbase",
        name="Road Sub-base / Embankment Fill",
        requirement_description=(
            "Moisture < 20% for direct use; 20–27% marginal with "
            "lime stabilization (IRC SP-58)"
        ),
        eligibility_rule=_road_eligible,
        marginal_rule=_road_marginal,
        proc_cost_per_tonne=5.0,
        revenue_per_tonne=8.0,
        distance_cost_factor=0.12,
        displacement_credit_factor=0.03,  # displaces crushed aggregate
    ),
    Pathway(
        key="brick",
        name="Brick / Block Manufacturing",
        requirement_description=(
            "SiO₂ + Al₂O₃ > 55% for adequate silicate bonding "
            "(IS 12894:2002)"
        ),
        eligibility_rule=_brick_eligible,
        marginal_rule=_brick_marginal,
        proc_cost_per_tonne=8.0,
        revenue_per_tonne=22.0,
        distance_cost_factor=0.10,
        displacement_credit_factor=0.15,  # vs. fired-clay bricks
    ),
]
