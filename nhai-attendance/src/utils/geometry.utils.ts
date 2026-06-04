// geometry.utils.ts — Haversine distance calculation and GPS coordinate math.
// Used by LocationService to verify worker proximity to worksite.

const EARTH_RADIUS_METERS = 6_371_000; // Mean Earth radius in meters

/**
 * Converts degrees to radians.
 */
function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/**
 * Computes the Haversine distance between two GPS coordinates.
 * Returns distance in meters.
 *
 * @param lat1 - Latitude of point 1 (degrees)
 * @param lon1 - Longitude of point 1 (degrees)
 * @param lat2 - Latitude of point 2 (degrees)
 * @param lon2 - Longitude of point 2 (degrees)
 * @returns Distance in meters
 */
export function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return EARTH_RADIUS_METERS * c;
}

/**
 * Checks if a GPS coordinate is within a specified radius of a center point.
 *
 * @param workerLat - Worker's latitude
 * @param workerLon - Worker's longitude
 * @param worksiteLat - Worksite center latitude
 * @param worksiteLon - Worksite center longitude
 * @param radiusMeters - Geofence radius in meters
 * @returns true if the worker is within the geofence
 */
export function isWithinGeofence(
  workerLat: number,
  workerLon: number,
  worksiteLat: number,
  worksiteLon: number,
  radiusMeters: number,
): boolean {
  const distance = haversineDistance(workerLat, workerLon, worksiteLat, worksiteLon);
  return distance <= radiusMeters;
}

/**
 * Computes a location trust score (0–100) based on distance from the worksite.
 * - Within 50m: 100
 * - Within radius: linearly scaled from 100 to 60
 * - Outside radius: linearly decreases to 0 at 2x radius
 *
 * @param distanceMeters - Distance from the worksite center
 * @param radiusMeters - Configured geofence radius
 * @returns Trust score 0–100
 */
export function computeLocationScore(distanceMeters: number, radiusMeters: number): number {
  if (distanceMeters <= 50) {
    return 100;
  }
  if (distanceMeters <= radiusMeters) {
    // Linearly scale from 100 (at 50m) to 60 (at radius)
    const fraction = (distanceMeters - 50) / (radiusMeters - 50);
    return Math.round(100 - fraction * 40);
  }
  if (distanceMeters <= radiusMeters * 2) {
    // Linearly scale from 60 (at radius) to 0 (at 2x radius)
    const fraction = (distanceMeters - radiusMeters) / radiusMeters;
    return Math.round(60 * (1 - fraction));
  }
  return 0;
}

/**
 * Formats GPS coordinates as a display string.
 */
export function formatCoordinates(lat: number, lon: number): string {
  const latDir = lat >= 0 ? 'N' : 'S';
  const lonDir = lon >= 0 ? 'E' : 'W';
  return `${Math.abs(lat).toFixed(6)}° ${latDir}, ${Math.abs(lon).toFixed(6)}° ${lonDir}`;
}
