/**
 * API client for Circularity Twin backend.
 *
 * All endpoints accept a WasteStream payload and return JSON.
 * Errors are expected in { error: string, field: string } shape.
 */

const API_BASE = '/api';

class ApiError extends Error {
  constructor(message, field, status) {
    super(message);
    this.field = field;
    this.status = status;
    this.name = 'ApiError';
  }
}

async function post(endpoint, payload) {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new ApiError(
      data.error || 'Unknown error',
      data.field || 'unknown',
      res.status,
    );
  }

  return data;
}

export async function matchWasteStream(wasteStream) {
  return post('/match', wasteStream);
}

export async function allocateWasteStream(wasteStream) {
  return post('/allocate', wasteStream);
}

export async function computeEmissions(wasteStream) {
  return post('/emissions', wasteStream);
}

export async function computeComparison(wasteStream) {
  return post('/comparison', wasteStream);
}

export { ApiError };
