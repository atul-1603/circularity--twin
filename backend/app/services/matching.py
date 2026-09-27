"""
Matching service — evaluates a WasteStream against all known Pathways.

Scoring methodology (deterministic, no randomness):
─────────────────────────────────────────────────────
fit_score (0–100):
  For each pathway, we measure how far the relevant composition metric
  exceeds the eligibility threshold, normalized to a 0–100 scale.

  - Cement: score = clamp((pozzolanic_sum − 60) / 30 × 100, 0, 100)
    where pozzolanic_sum = SiO2 + Al2O3 + Fe2O3.
    Rationale: 60% is the lower marginal boundary, 90% is an exceptional ash.

  - Road sub-base: score = clamp((30 − moisture) / 30 × 100, 0, 100)
    Rationale: 0% moisture is perfect, 30% is unusable.

  - Brick: score = clamp((silicate_sum − 45) / 35 × 100, 0, 100)
    where silicate_sum = SiO2 + Al2O3.
    Rationale: 45% is well below marginal, 80% is excellent.

confidence_band:
  A fixed ±5 points for eligible, ±10 for marginal, ±0 for ineligible.
  Represents how certain we are about the classification.
  Wider band for marginal = "near the boundary, small composition changes
  could flip the result."
"""

from typing import Dict, List

from app.data.pathways import PATHWAYS, Pathway
from app.models.waste_stream import MatchResult, MatchStatus, WasteStream


def _clamp(value: float, lo: float = 0.0, hi: float = 100.0) -> float:
    return max(lo, min(hi, value))


def _score_cement(comp: Dict[str, float], moisture: float) -> float:
    pozzolanic = comp.get("SiO2", 0) + comp.get("Al2O3", 0) + comp.get("Fe2O3", 0)
    return _clamp((pozzolanic - 60.0) / 30.0 * 100.0)


def _score_road(comp: Dict[str, float], moisture: float) -> float:
    return _clamp((30.0 - moisture) / 30.0 * 100.0)


def _score_brick(comp: Dict[str, float], moisture: float) -> float:
    silicate = comp.get("SiO2", 0) + comp.get("Al2O3", 0)
    return _clamp((silicate - 45.0) / 35.0 * 100.0)


# Map pathway keys to their scoring functions
_SCORE_FNS: Dict[str, callable] = {
    "cement": _score_cement,
    "road_subbase": _score_road,
    "brick": _score_brick,
}


def evaluate_pathway(
    pathway: Pathway,
    composition: Dict[str, float],
    moisture: float,
) -> MatchResult:
    """Evaluate a single pathway against composition and moisture."""

    # Determine status
    if pathway.eligibility_rule(composition, moisture):
        status = MatchStatus.eligible
        confidence_band = 5.0
    elif pathway.marginal_rule(composition, moisture):
        status = MatchStatus.marginal
        confidence_band = 10.0
    else:
        status = MatchStatus.ineligible
        confidence_band = 0.0

    # Compute fit score using the pathway-specific scoring function
    score_fn = _SCORE_FNS.get(pathway.key)
    fit_score = round(score_fn(composition, moisture), 1) if score_fn else 0.0

    return MatchResult(
        pathway_key=pathway.key,
        name=pathway.name,
        requirement_description=pathway.requirement_description,
        status=status,
        fit_score=fit_score,
        confidence_band=confidence_band,
    )


def match_waste_stream(waste: WasteStream) -> List[MatchResult]:
    """
    Evaluate all pathways against the given waste stream.
    Returns a list of MatchResult sorted by fit_score descending.
    """
    results = [
        evaluate_pathway(p, waste.composition, waste.moisture_pct)
        for p in PATHWAYS
    ]
    results.sort(key=lambda r: r.fit_score, reverse=True)
    return results
