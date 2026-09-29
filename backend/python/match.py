import sys
import json

def _clamp(value: float, lo: float = 0.0, hi: float = 100.0) -> float:
    return max(lo, min(hi, value))

def _score_cement(comp: dict, moisture: float) -> float:
    pozzolanic = comp.get("SiO2", 0) + comp.get("Al2O3", 0) + comp.get("Fe2O3", 0)
    return _clamp((pozzolanic - 60.0) / 30.0 * 100.0)

def _score_road(comp: dict, moisture: float) -> float:
    return _clamp((30.0 - moisture) / 30.0 * 100.0)

def _score_brick(comp: dict, moisture: float) -> float:
    silicate = comp.get("SiO2", 0) + comp.get("Al2O3", 0)
    return _clamp((silicate - 45.0) / 35.0 * 100.0)

def evaluate_cement(comp, moisture):
    pozzolanic_sum = comp.get("SiO2", 0) + comp.get("Al2O3", 0) + comp.get("Fe2O3", 0)
    cao = comp.get("CaO", 0)
    
    eligible = pozzolanic_sum > 70.0 and cao < 15.0
    if eligible:
        return "eligible", 5.0
        
    marginal = (65.0 <= pozzolanic_sum <= 70.0) or (15.0 <= cao <= 20.0)
    if marginal:
        return "marginal", 10.0
        
    return "ineligible", 0.0

def evaluate_road(comp, moisture):
    if moisture < 20.0:
        return "eligible", 5.0
    if 20.0 <= moisture <= 27.0:
        return "marginal", 10.0
    return "ineligible", 0.0

def evaluate_brick(comp, moisture):
    silicate_sum = comp.get("SiO2", 0) + comp.get("Al2O3", 0)
    if silicate_sum > 55.0:
        return "eligible", 5.0
    if 50.0 <= silicate_sum <= 55.0:
        return "marginal", 10.0
    return "ineligible", 0.0

def evaluate(waste):
    comp = waste.get("composition", {})
    moisture = waste.get("moisture_pct", 0.0)
    
    results = []
    
    # Cement
    status, band = evaluate_cement(comp, moisture)
    results.append({
        "pathway_key": "cement",
        "name": "Cement / Concrete Substitution",
        "requirement_description": "SiO2 + Al2O3 + Fe2O3 > 70% and CaO < 15% (ASTM C618 Class F pozzolan)",
        "status": status,
        "fit_score": round(_score_cement(comp, moisture), 1),
        "confidence_band": band
    })
    
    # Road
    status, band = evaluate_road(comp, moisture)
    results.append({
        "pathway_key": "road_subbase",
        "name": "Road Sub-base / Embankment Fill",
        "requirement_description": "Moisture < 20% for direct use; 20-27% marginal with lime stabilization (IRC SP-58)",
        "status": status,
        "fit_score": round(_score_road(comp, moisture), 1),
        "confidence_band": band
    })
    
    # Brick
    status, band = evaluate_brick(comp, moisture)
    results.append({
        "pathway_key": "brick",
        "name": "Brick / Block Manufacturing",
        "requirement_description": "SiO2 + Al2O3 > 55% for adequate silicate bonding (IS 12894:2002)",
        "status": status,
        "fit_score": round(_score_brick(comp, moisture), 1),
        "confidence_band": band
    })
    
    results.sort(key=lambda r: r["fit_score"], reverse=True)
    return results

if __name__ == "__main__":
    try:
        input_data = sys.stdin.read()
        waste = json.loads(input_data)
        out = evaluate(waste)
        print(json.dumps(out))
    except Exception as e:
        print(json.dumps({"error": str(e)}), file=sys.stderr)
        sys.exit(1)
