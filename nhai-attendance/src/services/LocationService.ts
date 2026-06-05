import Geolocation from 'react-native-geolocation-service';
import { Platform, PermissionsAndroid, type Permission } from 'react-native';
import { LOCATION_CONSTANTS } from '@constants/trust.constants';
import type { LocationTrustScore } from '@/types/location.types';

export interface WorksiteCoordinates {
  latitude: number;
  longitude: number;
  name: string;
  radiusMeters?: number; // Override default radius for this specific worksite
}

/**
 * Haversine formula for computing great-circle distance between two GPS coordinates.
 * Returns distance in meters.
 *
 * The Haversine formula is accurate to within ~0.3% for distances under 20km,
 * which is more than sufficient for worksite proximity detection (we care about
 * distances of 100m–500m).
 *
 * @param lat1, lon1 - First coordinate (decimal degrees)
 * @param lat2, lon2 - Second coordinate (decimal degrees)
 * @returns Distance in meters
 */
export function haversineDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6_371_000; // Earth radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Acquires the current GPS position.
 * Returns a promise that resolves with the position or rejects with a timeout/permission error.
 *
 * The timeout is set to GPS_TIMEOUT_MS (10 seconds) to avoid blocking the authentication
 * flow indefinitely at sites with poor GPS signal (e.g., inside buildings).
 *
 * If GPS acquisition fails or times out, the LocationService returns a LOW score (10)
 * rather than blocking authentication entirely — location is one signal among several.
 */
export async function acquireCurrentPosition(): Promise<{
  latitude: number;
  longitude: number;
  accuracy: number;
}> {
  if (Platform.OS === 'android') {
    const granted = await PermissionsAndroid.check(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION as Permission,
    );
    if (!granted) {
      throw new Error('Location permission not granted. Cannot verify worksite proximity.');
    }
  }

  return new Promise((resolve, reject) => {
    Geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
      },
      (error) => {
        reject(new Error(`GPS acquisition failed (code ${error.code}): ${error.message}`));
      },
      {
        enableHighAccuracy: true,
        timeout: LOCATION_CONSTANTS.GPS_TIMEOUT_MS,
        maximumAge: LOCATION_CONSTANTS.GPS_MAX_AGE_MS,
        forceRequestLocation: true, // Android: force fresh location even if cached is available
      },
    );
  });
}

/**
 * Computes the location trust score for an authentication attempt.
 *
 * @param currentLatitude - GPS latitude of the current location
 * @param currentLongitude - GPS longitude of the current location
 * @param worksite - The registered worksite to compare against
 * @returns LocationTrustScore with a 0–100 trust score
 */
export function computeLocationTrustScore(
  currentLatitude: number,
  currentLongitude: number,
  worksite: WorksiteCoordinates,
): LocationTrustScore {
  const distanceMeters = haversineDistanceMeters(
    currentLatitude,
    currentLongitude,
    worksite.latitude,
    worksite.longitude,
  );

  const highRadius = worksite.radiusMeters ?? LOCATION_CONSTANTS.HIGH_SCORE_RADIUS_METERS;
  const mediumRadius = LOCATION_CONSTANTS.MEDIUM_SCORE_RADIUS_METERS;

  let score: number;
  let reason: string;

  if (distanceMeters <= highRadius) {
    score = LOCATION_CONSTANTS.HIGH_SCORE;
    reason = `Within ${Math.round(distanceMeters)}m of worksite "${worksite.name}" (HIGH trust zone ≤${highRadius}m).`;
  } else if (distanceMeters <= mediumRadius) {
    // Linear decay from HIGH_SCORE to MEDIUM_SCORE between high and medium radius
    const fraction = (distanceMeters - highRadius) / (mediumRadius - highRadius);
    score = Math.round(
      LOCATION_CONSTANTS.HIGH_SCORE -
        fraction * (LOCATION_CONSTANTS.HIGH_SCORE - LOCATION_CONSTANTS.MEDIUM_SCORE),
    );
    reason = `${Math.round(distanceMeters)}m from worksite "${worksite.name}" (MEDIUM trust zone ${highRadius}–${mediumRadius}m).`;
  } else {
    score = LOCATION_CONSTANTS.LOW_SCORE;
    reason = `${Math.round(distanceMeters)}m from worksite "${worksite.name}" — well outside expected area (>500m).`;
  }

  return {
    score,
    distanceMeters,
    worksiteName: worksite.name,
    currentLatitude,
    currentLongitude,
    worksiteLatitude: worksite.latitude,
    worksiteLongitude: worksite.longitude,
    reason,
  };
}
