function allocate(waste, matchResults) {
  const eligible = matchResults.filter(
    (m) => m.status === 'eligible' || m.status === 'marginal'
  );

  if (eligible.length === 0) return [];

  const share = waste.quantity_tpm / eligible.length;

  return eligible.map((m) => {
    const procCost = share * 12.0;
    const revenue = share * 33.0;
    const transportCost = share * 0.1 * 50; // mock 50km
    const netBenefit = revenue - procCost - transportCost;

    return {
      pathway_key: m.pathway_key,
      pathway_name: m.name,
      allocated_tpm: Number(share.toFixed(1)),
      proc_cost: Number(procCost.toFixed(2)),
      revenue: Number(revenue.toFixed(2)),
      transport_cost: Number(transportCost.toFixed(2)),
      net_benefit: Number(netBenefit.toFixed(2)),
    };
  });
}

module.exports = { allocate };
