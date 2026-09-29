function computeEmissions(waste, allocations) {
  let totalAvoided = 0.0;
  
  const entries = allocations.map((alloc) => {
    const qty = alloc.allocated_tpm;
    
    const credits = {
      cement: 0.83,
      road_subbase: 0.03,
      brick: 0.15,
    };
    
    const credit = credits[alloc.pathway_key] || 0.1;
    const displaced = credit * qty;
    const processEm = 0.02 * qty;
    const transportEm = 0.0001 * 50 * qty;
    const avoided = displaced - processEm - transportEm;
    
    totalAvoided += avoided;
    
    return {
      pathway_key: alloc.pathway_key,
      pathway_name: alloc.pathway_name,
      allocated_tpm: qty,
      displacement_credit_tco2e: Number(displaced.toFixed(2)),
      process_emissions_tco2e: Number(processEm.toFixed(2)),
      transport_emissions_tco2e: Number(transportEm.toFixed(2)),
      net_avoided_tco2e: Number(avoided.toFixed(2)),
      formula: `${credit} × ${qty} − 0.02 × ${qty} − 0.0001 × 50 × ${qty}`,
    };
  });
  
  return {
    entries,
    total_avoided_tco2e: Number(totalAvoided.toFixed(2)),
    methodology_version: 'v0.1',
  };
}

function computeComparison(waste, allocations, emissions) {
  const qty = waste.quantity_tpm;
  const landfillCost = qty * 18.0;
  const landfillEmissions = qty * 0.05;
  
  let reuseRevenue = 0;
  let reuseCost = 0;
  
  allocations.forEach(a => {
    reuseRevenue += a.revenue;
    reuseCost += a.proc_cost + a.transport_cost;
  });
  
  const reuseAvoided = emissions.total_avoided_tco2e;
  
  return {
    disposal: {
      cost: Number(landfillCost.toFixed(2)),
      emissions_tco2e: Number(landfillEmissions.toFixed(2)),
      revenue: 0,
    },
    reuse: {
      cost: Number(reuseCost.toFixed(2)),
      emissions_avoided_tco2e: Number(reuseAvoided.toFixed(2)),
      revenue: Number(reuseRevenue.toFixed(2)),
    },
    savings: {
      cost_delta: Number((reuseRevenue - reuseCost - landfillCost).toFixed(2)),
      emissions_delta_tco2e: Number((reuseAvoided + landfillEmissions).toFixed(2)),
    }
  };
}

module.exports = { computeEmissions, computeComparison };
