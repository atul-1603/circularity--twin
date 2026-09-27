# Emissions Methodology

## Overview

Circularity Twin calculates **avoided CO₂-equivalent emissions** by comparing
the lifecycle impact of reusing industrial waste against the baseline scenario
of landfill disposal + virgin material production.

## Core Formula

```
avoided_emissions (tCO₂e) =
    displacement_credit (tCO₂e/t) × quantity_reused (t)
  − process_emissions (tCO₂e/t) × quantity_reused (t)
  − transport_emissions (tCO₂e/t·km) × distance (km) × quantity_reused (t)
```

### Term Definitions

| Term | Unit | Description |
|------|------|-------------|
| `displacement_credit` | tCO₂e / tonne | CO₂ avoided by not producing virgin material (e.g., Portland cement displaced by fly ash) |
| `process_emissions` | tCO₂e / tonne | CO₂ emitted by the reuse process itself (grinding, mixing, curing) |
| `transport_emissions` | tCO₂e / tonne·km | CO₂ from trucking waste to the reuse facility |
| `distance` | km | Great-circle distance from waste source to reuse facility |
| `quantity_reused` | tonnes | Tonnage allocated to this pathway |

## Displacement Credits (Sources)

| Pathway | Credit (tCO₂e/t) | Source |
|---------|-------------------|--------|
| Cement substitution | 0.83 | IPCC AR6 WG III, Table 11.3 — ~0.6–0.9 tCO₂e per tonne of clinker displaced |
| Road sub-base | 0.03 | Approximate; displaces crushed aggregate, low-energy material |
| Brick manufacturing | 0.15 | Based on average fired-brick emission intensity vs. unfired waste-based blocks |

## Assumptions & Limitations

1. **Version 1 (current prototype):** Transport emissions are estimated using a
   flat factor of 0.0001 tCO₂e/t·km (loaded truck, European average). Real routing
   distances and modal splits are not yet implemented.
2. Displacement credits assume 1:1 substitution by mass. In practice, replacement
   ratios vary (e.g., 15–35% fly ash in blended cement). The optimizer should apply
   a `replacement_ratio` coefficient — TODO for next iteration.
3. All factors are approximate and drawn from public literature. For production use,
   site-specific Life Cycle Assessment (LCA) data should replace these defaults.

## Versioning

This methodology document is versioned alongside the code. Any change to emission
factors or formulas must be accompanied by an update here.

- **v0.1** — Initial prototype factors, September 2026.
