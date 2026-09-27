"""
Emissions service — mock implementation.

TODO: replace with real calculation, see docs/emissions-methodology.md
Real implementation should use the formula:
  avoided = displacement_credit × qty − process_emissions × qty − transport × dist × qty
"""

from typing import Any, Dict, List

from app.models.waste_stream import WasteStream


def compute_emissions(
    waste: WasteStream,
    allocations: List[Dict[str, Any]],
) -> Dict[str, Any]:
    """
    Mock emissions ledger: returns plausible numbers in the correct shape.

    The real implementation will pull factors from emission_factors.json
    and compute per-pathway avoided emissions.
    """
    # TODO: replace with real emission factor lookups from emission_factors.json
    entries = []
    total_avoided = 0.0

    for alloc in allocations:
        qty = alloc["allocated_tpm"]
        # Mock displacement credits per pathway (realistic magnitudes)
        credits = {
            "cement": 0.83,
            "road_subbase": 0.03,
            "brick": 0.15,
        }
        credit = credits.get(alloc["pathway_key"], 0.1)
        displaced = round(credit * qty, 2)
        process_em = round(0.02 * qty, 2)  # mock process emissions
        transport_em = round(0.0001 * 50 * qty, 2)  # mock 50km
        avoided = round(displaced - process_em - transport_em, 2)
        total_avoided += avoided

        entries.append({
            "pathway_key": alloc["pathway_key"],
            "pathway_name": alloc["pathway_name"],
            "allocated_tpm": qty,
            "displacement_credit_tco2e": displaced,
            "process_emissions_tco2e": process_em,
            "transport_emissions_tco2e": transport_em,
            "net_avoided_tco2e": avoided,
            "formula": (
                f"{credit} × {qty} − {0.02} × {qty} − "
                f"{0.0001} × 50 × {qty}"
            ),
        })

    return {
        "entries": entries,
        "total_avoided_tco2e": round(total_avoided, 2),
        "methodology_version": "v0.1",
    }


def compute_comparison(
    waste: WasteStream,
    allocations: List[Dict[str, Any]],
    emissions: Dict[str, Any],
) -> Dict[str, Any]:
    """
    Mock comparison: reuse vs. disposal headline stats.

    TODO: replace with real computation wired to allocation + emissions
    """
    qty = waste.quantity_tpm
    # Baseline disposal scenario
    landfill_cost = round(qty * 18.0, 2)  # mock $18/t disposal cost
    landfill_emissions = round(qty * 0.05, 2)  # 0.05 tCO2e/t

    # Reuse scenario totals
    reuse_revenue = sum(a["revenue"] for a in allocations)
    reuse_cost = sum(a["proc_cost"] + a["transport_cost"] for a in allocations)
    reuse_avoided = emissions["total_avoided_tco2e"]

    return {
        "disposal": {
            "cost": landfill_cost,
            "emissions_tco2e": landfill_emissions,
            "revenue": 0,
        },
        "reuse": {
            "cost": round(reuse_cost, 2),
            "emissions_avoided_tco2e": reuse_avoided,
            "revenue": round(reuse_revenue, 2),
        },
        "savings": {
            "cost_delta": round(reuse_revenue - reuse_cost - landfill_cost, 2),
            "emissions_delta_tco2e": round(reuse_avoided + landfill_emissions, 2),
        },
    }
