"""Pydantic models for waste stream input and matching response."""

from enum import Enum
from typing import Dict

from pydantic import BaseModel, Field, model_validator


class WasteType(str, Enum):
    """Supported industrial waste types."""
    flyash = "flyash"
    slag = "slag"
    tailings = "tailings"


class Location(BaseModel):
    """Geographic coordinates of the waste source."""
    lat: float = Field(..., ge=-90, le=90, description="Latitude")
    lng: float = Field(..., ge=-180, le=180, description="Longitude")


class WasteStream(BaseModel):
    """
    Represents a single industrial waste stream to be evaluated for
    circular-economy reuse pathways.
    """
    waste_type: WasteType
    quantity_tpm: float = Field(
        ..., gt=0,
        description="Tonnes per month, must be > 0"
    )
    location: Location
    composition: Dict[str, float] = Field(
        ...,
        description=(
            "Chemical composition as oxide percentages, "
            "e.g. {'SiO2': 52, 'Al2O3': 26, ...}. Must sum to 100 ± 0.5."
        )
    )
    moisture_pct: float = Field(
        ..., ge=0, le=100,
        description="Moisture content as a percentage (0-100)"
    )

    @model_validator(mode="after")
    def validate_composition_sum(self) -> "WasteStream":
        """Ensure composition percentages sum to 100 ± 0.5."""
        total = sum(self.composition.values())
        if abs(total - 100.0) > 0.5:
            raise ValueError(
                f"Composition percentages must sum to 100 ± 0.5, "
                f"but got {total:.2f}"
            )
        return self


class MatchStatus(str, Enum):
    """Eligibility status of a waste stream for a pathway."""
    eligible = "eligible"
    marginal = "marginal"
    ineligible = "ineligible"


class MatchResult(BaseModel):
    """Result of evaluating one pathway against a waste stream."""
    pathway_key: str
    name: str
    requirement_description: str
    status: MatchStatus
    fit_score: float = Field(..., ge=0, le=100)
    confidence_band: float = Field(
        ..., ge=0,
        description="Width of the confidence band around the fit score"
    )


class ErrorResponse(BaseModel):
    """Consistent error shape across the API."""
    error: str
    field: str
