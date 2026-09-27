"""
Circularity Twin — FastAPI backend.

Endpoints:
  POST /api/match       — real matching engine (fully implemented)
  POST /api/allocate    — mock optimizer (TODO: real LP)
  POST /api/emissions   — mock emissions ledger (TODO: real calc)
  POST /api/comparison  — mock reuse vs disposal comparison
"""

import os

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import ValidationError

from app.models.waste_stream import WasteStream
from app.services.matching import match_waste_stream
from app.services.allocation import allocate
from app.services.emissions import compute_emissions, compute_comparison

app = FastAPI(
    title="Circularity Twin API",
    version="0.1.0",
    description="Industrial waste reuse decision platform",
)

# CORS — allow frontend dev server
cors_origins = os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Global validation error handler ──────────────────────────────────────
# Catches Pydantic ValidationErrors and returns the consistent
# { error, field } shape the frontend expects.
@app.exception_handler(ValidationError)
async def validation_exception_handler(request: Request, exc: ValidationError):
    first = exc.errors()[0]
    field = ".".join(str(loc) for loc in first["loc"]) if first["loc"] else "body"
    return JSONResponse(
        status_code=422,
        content={"error": first["msg"], "field": field},
    )


# ── POST /api/match ─────────────────────────────────────────────────────
# Fully implemented: evaluates all pathways against the waste stream.
@app.post("/api/match")
async def match_endpoint(request: Request):
    body = await request.json()

    # Manual validation to return our consistent error shape
    try:
        waste = WasteStream(**body)
    except ValidationError as exc:
        first = exc.errors()[0]
        field = ".".join(str(loc) for loc in first["loc"]) if first["loc"] else "body"
        msg = first["msg"]

        # Make composition sum error more user-friendly
        if "Composition percentages" in str(first.get("ctx", {}).get("error", "")):
            msg = str(first["ctx"]["error"])

        return JSONResponse(
            status_code=422,
            content={"error": msg, "field": field},
        )

    results = match_waste_stream(waste)
    return [r.model_dump() for r in results]


# ── POST /api/allocate ──────────────────────────────────────────────────
# TODO: replace with real optimizer, see docs/architecture.md
@app.post("/api/allocate")
async def allocate_endpoint(request: Request):
    body = await request.json()

    try:
        waste = WasteStream(**body)
    except ValidationError as exc:
        first = exc.errors()[0]
        field = ".".join(str(loc) for loc in first["loc"]) if first["loc"] else "body"
        return JSONResponse(
            status_code=422,
            content={"error": first["msg"], "field": field},
        )

    match_results = match_waste_stream(waste)
    match_dicts = [r.model_dump() for r in match_results]
    return allocate(waste, match_dicts)


# ── POST /api/emissions ─────────────────────────────────────────────────
# TODO: replace with real calculation, see docs/emissions-methodology.md
@app.post("/api/emissions")
async def emissions_endpoint(request: Request):
    body = await request.json()

    try:
        waste = WasteStream(**body)
    except ValidationError as exc:
        first = exc.errors()[0]
        field = ".".join(str(loc) for loc in first["loc"]) if first["loc"] else "body"
        return JSONResponse(
            status_code=422,
            content={"error": first["msg"], "field": field},
        )

    match_results = match_waste_stream(waste)
    match_dicts = [r.model_dump() for r in match_results]
    allocs = allocate(waste, match_dicts)
    return compute_emissions(waste, allocs)


# ── POST /api/comparison ────────────────────────────────────────────────
# TODO: replace with real computation
@app.post("/api/comparison")
async def comparison_endpoint(request: Request):
    body = await request.json()

    try:
        waste = WasteStream(**body)
    except ValidationError as exc:
        first = exc.errors()[0]
        field = ".".join(str(loc) for loc in first["loc"]) if first["loc"] else "body"
        return JSONResponse(
            status_code=422,
            content={"error": first["msg"], "field": field},
        )

    match_results = match_waste_stream(waste)
    match_dicts = [r.model_dump() for r in match_results]
    allocs = allocate(waste, match_dicts)
    emissions = compute_emissions(waste, allocs)
    return compute_comparison(waste, allocs, emissions)


# ── Health check ─────────────────────────────────────────────────────────
@app.get("/api/health")
async def health():
    return {"status": "ok", "version": "0.1.0"}
