"""
Allocation service — mock implementation.

TODO: replace with real optimizer, see docs/architecture.md
Real implementation should use linear programming (e.g. scipy.optimize.linprog
or PuLP) to allocate tonnage across eligible pathways to maximize net benefit
(revenue − cost − transport) subject to capacity constraints.
"""

from typing import Any, Dict, List

from app.models.waste_stream import WasteStream


def allocate(waste: WasteStream, match_results: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Mock allocation: split tonnage evenly across eligible pathways.

    Returns realistic-shaped data so the frontend can be built against
    the real response schema without needing the optimizer yet.
    """
    eligible = [m for m in match_results if m["status"] in ("eligible", "marginal")]

    if not eligible:
        return []

    share = waste.quantity_tpm / len(eligible)

    allocations = []
    for m in eligible:
        # TODO: replace with real optimizer output
        net_benefit = round(share * 33.0 - share * 12.0 - share * 0.1 * 50, 2)
        allocations.append({
            "pathway_key": m["pathway_key"],
            "pathway_name": m["name"],
            "allocated_tpm": round(share, 1),
            "proc_cost": round(share * 12.0, 2),
            "revenue": round(share * 33.0, 2),
            "transport_cost": round(share * 0.1 * 50, 2),  # mock 50km distance
            "net_benefit": net_benefit,
        })

    return allocations
