/**
 * Utility helpers shared across services.
 */

/**
 * Great-circle distance between two (lat, lng) points in kilometres.
 * Uses the haversine formula (accurate to ~0.5% for terrestrial distances).
 *
 * @param {number} lat1
 * @param {number} lng1
 * @param {number} lat2
 * @param {number} lng2
 * @returns {number} distance in km
 */
function haversineKm(lat1, lng1, lat2, lng2) {
  const R = 6371.0; // Earth's mean radius, km
  const toRad = (deg) => (deg * Math.PI) / 180;

  const phi1 = toRad(lat1);
  const phi2 = toRad(lat2);
  const dphi = toRad(lat2 - lat1);
  const dlambda = toRad(lng2 - lng1);

  const a =
    Math.sin(dphi / 2) ** 2 +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(dlambda / 2) ** 2;

  return R * 2 * Math.asin(Math.sqrt(a));
}

module.exports = { haversineKm };
