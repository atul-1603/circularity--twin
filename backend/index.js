const express = require('express');
const cors = require('cors');
const { runMatching } = require('./services/matching');
const { allocate } = require('./services/allocation');
const { computeEmissions, computeComparison } = require('./services/emissions');

const app = express();
app.use(express.json());

// Enable CORS based on env var or fallback
const corsOrigins = (process.env.CORS_ORIGINS || 'http://localhost:5173').split(',');
app.use(cors({ origin: corsOrigins, credentials: true }));

// Validation middleware mimicking the old Python Pydantic validation
function validateWasteStream(req, res, next) {
  const waste = req.body;
  if (!waste || typeof waste !== 'object') {
    return res.status(422).json({ error: 'Body must be a JSON object', field: 'body' });
  }
  
  if (waste.quantity_tpm === undefined || waste.quantity_tpm <= 0) {
    return res.status(422).json({ error: 'Quantity must be > 0', field: 'quantity_tpm' });
  }
  
  if (!['flyash', 'slag', 'tailings'].includes(waste.waste_type)) {
    return res.status(422).json({ error: 'Invalid waste_type', field: 'waste_type' });
  }
  
  if (!waste.composition || typeof waste.composition !== 'object') {
    return res.status(422).json({ error: 'Composition is required', field: 'composition' });
  }
  
  const sum = Object.values(waste.composition).reduce((acc, val) => acc + (Number(val) || 0), 0);
  if (Math.abs(sum - 100.0) > 0.5) {
    return res.status(422).json({ 
      error: `Composition percentages must sum to 100 ± 0.5, but got ${sum.toFixed(2)}`,
      field: 'composition'
    });
  }
  
  next();
}

app.post('/api/match', validateWasteStream, async (req, res) => {
  try {
    const results = await runMatching(req.body);
    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Matching engine failed', details: err.message });
  }
});

app.post('/api/allocate', validateWasteStream, async (req, res) => {
  try {
    const matchResults = await runMatching(req.body);
    const allocations = allocate(req.body, matchResults);
    res.json(allocations);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Allocation failed', details: err.message });
  }
});

app.post('/api/emissions', validateWasteStream, async (req, res) => {
  try {
    const matchResults = await runMatching(req.body);
    const allocations = allocate(req.body, matchResults);
    const emissions = computeEmissions(req.body, allocations);
    res.json(emissions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Emissions calculation failed', details: err.message });
  }
});

app.post('/api/comparison', validateWasteStream, async (req, res) => {
  try {
    const matchResults = await runMatching(req.body);
    const allocations = allocate(req.body, matchResults);
    const emissions = computeEmissions(req.body, allocations);
    const comparison = computeComparison(req.body, allocations, emissions);
    res.json(comparison);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Comparison calculation failed', details: err.message });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', version: '0.1.0' });
});

const PORT = process.env.FASTAPI_PORT || process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Node.js server listening on port ${PORT}`);
});
