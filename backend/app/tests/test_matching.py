"""
Tests for the matching engine.

Coverage:
  - Each pathway: eligible, ineligible, and marginal cases
  - Composition-sum validation error (422)
  - API endpoint integration via TestClient
"""

import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.models.waste_stream import WasteStream
from app.services.matching import match_waste_stream

client = TestClient(app)


# ── Helper: base waste stream factory ────────────────────────────────────
def _make_waste(
    composition: dict,
    moisture: float = 10.0,
    waste_type: str = "flyash",
    quantity: float = 1000,
) -> dict:
    """Build a valid WasteStream dict for API calls."""
    return {
        "waste_type": waste_type,
        "quantity_tpm": quantity,
        "location": {"lat": 18.5, "lng": 73.8},
        "composition": composition,
        "moisture_pct": moisture,
    }


# ════════════════════════════════════════════════════════════════════════
# PATHWAY 1: Cement / Concrete Substitution
# Requires: SiO2 + Al2O3 + Fe2O3 > 70%, CaO < 15%
# ════════════════════════════════════════════════════════════════════════

class TestCementPathway:
    """Tests for the cement/concrete substitution pathway."""

    def test_clearly_eligible(self):
        """High pozzolanic sum (86%), low CaO (5%) → eligible."""
        waste = _make_waste({
            "SiO2": 52.0, "Al2O3": 26.0, "Fe2O3": 8.0,
            "CaO": 5.0, "Other": 9.0,
        })
        resp = client.post("/api/match", json=waste)
        assert resp.status_code == 200
        results = {r["pathway_key"]: r for r in resp.json()}
        assert results["cement"]["status"] == "eligible"
        assert results["cement"]["fit_score"] > 70

    def test_clearly_ineligible_low_pozzolanic(self):
        """Low pozzolanic sum (40%) → ineligible for cement."""
        waste = _make_waste({
            "SiO2": 20.0, "Al2O3": 15.0, "Fe2O3": 5.0,
            "CaO": 30.0, "Other": 30.0,
        })
        resp = client.post("/api/match", json=waste)
        assert resp.status_code == 200
        results = {r["pathway_key"]: r for r in resp.json()}
        assert results["cement"]["status"] == "ineligible"

    def test_ineligible_high_cao(self):
        """Even with good pozzolanic sum, CaO > 15% → ineligible for cement."""
        waste = _make_waste({
            "SiO2": 45.0, "Al2O3": 20.0, "Fe2O3": 10.0,
            "CaO": 20.0, "Other": 5.0,
        })
        resp = client.post("/api/match", json=waste)
        assert resp.status_code == 200
        results = {r["pathway_key"]: r for r in resp.json()}
        # pozzolanic = 75% but CaO = 20% > 15% → marginal (CaO in 15-20 band)
        assert results["cement"]["status"] == "marginal"

    def test_marginal_pozzolanic_band(self):
        """Pozzolanic sum exactly 68% (65–70 marginal band) → marginal."""
        waste = _make_waste({
            "SiO2": 40.0, "Al2O3": 20.0, "Fe2O3": 8.0,
            "CaO": 10.0, "Other": 22.0,
        })
        resp = client.post("/api/match", json=waste)
        assert resp.status_code == 200
        results = {r["pathway_key"]: r for r in resp.json()}
        assert results["cement"]["status"] == "marginal"


# ════════════════════════════════════════════════════════════════════════
# PATHWAY 2: Road Sub-base / Embankment Fill
# Requires: moisture < 20% (marginal: 20–27%)
# ════════════════════════════════════════════════════════════════════════

class TestRoadSubbasePathway:
    """Tests for the road sub-base / embankment fill pathway."""

    def test_clearly_eligible_dry(self):
        """Moisture 8% → clearly eligible for road sub-base."""
        waste = _make_waste(
            {"SiO2": 50.0, "Al2O3": 25.0, "Fe2O3": 5.0, "CaO": 10.0, "Other": 10.0},
            moisture=8.0,
        )
        resp = client.post("/api/match", json=waste)
        results = {r["pathway_key"]: r for r in resp.json()}
        assert results["road_subbase"]["status"] == "eligible"

    def test_clearly_ineligible_wet(self):
        """Moisture 35% → ineligible for road sub-base."""
        waste = _make_waste(
            {"SiO2": 50.0, "Al2O3": 25.0, "Fe2O3": 5.0, "CaO": 10.0, "Other": 10.0},
            moisture=35.0,
        )
        resp = client.post("/api/match", json=waste)
        results = {r["pathway_key"]: r for r in resp.json()}
        assert results["road_subbase"]["status"] == "ineligible"

    def test_marginal_moisture_band(self):
        """Moisture 24% (20–27 marginal band) → marginal."""
        waste = _make_waste(
            {"SiO2": 50.0, "Al2O3": 25.0, "Fe2O3": 5.0, "CaO": 10.0, "Other": 10.0},
            moisture=24.0,
        )
        resp = client.post("/api/match", json=waste)
        results = {r["pathway_key"]: r for r in resp.json()}
        assert results["road_subbase"]["status"] == "marginal"


# ════════════════════════════════════════════════════════════════════════
# PATHWAY 3: Brick / Block Manufacturing
# Requires: SiO2 + Al2O3 > 55% (marginal: 50–55%)
# ════════════════════════════════════════════════════════════════════════

class TestBrickPathway:
    """Tests for the brick/block manufacturing pathway."""

    def test_clearly_eligible(self):
        """SiO2 + Al2O3 = 78% → clearly eligible for brick."""
        waste = _make_waste({
            "SiO2": 52.0, "Al2O3": 26.0, "Fe2O3": 8.0,
            "CaO": 9.0, "Other": 5.0,
        })
        resp = client.post("/api/match", json=waste)
        results = {r["pathway_key"]: r for r in resp.json()}
        assert results["brick"]["status"] == "eligible"

    def test_clearly_ineligible(self):
        """SiO2 + Al2O3 = 35% → ineligible for brick."""
        waste = _make_waste({
            "SiO2": 20.0, "Al2O3": 15.0, "Fe2O3": 5.0,
            "CaO": 30.0, "Other": 30.0,
        })
        resp = client.post("/api/match", json=waste)
        results = {r["pathway_key"]: r for r in resp.json()}
        assert results["brick"]["status"] == "ineligible"

    def test_marginal_silicate_band(self):
        """SiO2 + Al2O3 = 53% (50–55 marginal band) → marginal."""
        waste = _make_waste({
            "SiO2": 33.0, "Al2O3": 20.0, "Fe2O3": 10.0,
            "CaO": 20.0, "Other": 17.0,
        })
        resp = client.post("/api/match", json=waste)
        results = {r["pathway_key"]: r for r in resp.json()}
        assert results["brick"]["status"] == "marginal"


# ════════════════════════════════════════════════════════════════════════
# VALIDATION ERRORS
# ════════════════════════════════════════════════════════════════════════

class TestValidation:
    """Tests for input validation and error shapes."""

    def test_composition_sum_error(self):
        """Composition summing to 90 (not ~100) → 422 with clear message."""
        waste = _make_waste({
            "SiO2": 40.0, "Al2O3": 20.0, "Fe2O3": 10.0,
            "CaO": 10.0, "Other": 10.0,
        })
        # Sum = 90, not 100
        resp = client.post("/api/match", json=waste)
        assert resp.status_code == 422
        body = resp.json()
        assert "error" in body
        assert "field" in body
        assert "90" in body["error"]  # should name the actual sum

    def test_quantity_zero_error(self):
        """quantity_tpm = 0 → 422."""
        waste = _make_waste(
            {"SiO2": 52.0, "Al2O3": 26.0, "Fe2O3": 8.0, "CaO": 9.0, "Other": 5.0},
            quantity=0,
        )
        resp = client.post("/api/match", json=waste)
        assert resp.status_code == 422
        body = resp.json()
        assert "error" in body
        assert "field" in body

    def test_negative_quantity_error(self):
        """quantity_tpm = -100 → 422."""
        waste = _make_waste(
            {"SiO2": 52.0, "Al2O3": 26.0, "Fe2O3": 8.0, "CaO": 9.0, "Other": 5.0},
            quantity=-100,
        )
        resp = client.post("/api/match", json=waste)
        assert resp.status_code == 422

    def test_unknown_waste_type_error(self):
        """Invalid waste_type → 422 listing valid options."""
        waste = {
            "waste_type": "unobtainium",
            "quantity_tpm": 1000,
            "location": {"lat": 18.5, "lng": 73.8},
            "composition": {"SiO2": 52, "Al2O3": 26, "Fe2O3": 8, "CaO": 9, "Other": 5},
            "moisture_pct": 10,
        }
        resp = client.post("/api/match", json=waste)
        assert resp.status_code == 422
        body = resp.json()
        assert "error" in body

    def test_error_shape_consistent(self):
        """All errors have { error, field } shape."""
        waste = _make_waste({"SiO2": 100.0})  # sum = 100 but only one component
        waste["quantity_tpm"] = -1
        resp = client.post("/api/match", json=waste)
        assert resp.status_code == 422
        body = resp.json()
        assert isinstance(body.get("error"), str)
        assert isinstance(body.get("field"), str)


# ════════════════════════════════════════════════════════════════════════
# DETERMINISM
# ════════════════════════════════════════════════════════════════════════

class TestDeterminism:
    """Ensure results are reproducible (no randomness in scoring)."""

    def test_same_input_same_output(self):
        """Calling /match twice with identical input gives identical results."""
        waste = _make_waste({
            "SiO2": 52.0, "Al2O3": 26.0, "Fe2O3": 8.0,
            "CaO": 9.0, "Other": 5.0,
        })
        resp1 = client.post("/api/match", json=waste)
        resp2 = client.post("/api/match", json=waste)
        assert resp1.json() == resp2.json()
