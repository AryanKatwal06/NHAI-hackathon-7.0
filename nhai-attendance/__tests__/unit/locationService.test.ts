import { haversineDistanceMeters, computeLocationTrustScore } from '@services/LocationService';
import { LOCATION_CONSTANTS } from '@constants/trust.constants';

const WORKSITE = { id: 'w1', latitude: 28.6139, longitude: 77.2090, name: 'Delhi Test Worksite', radiusMeters: 100, shiftStartHour: 8.0 };

describe('haversineDistanceMeters', () => {
  it('should return 0 for identical coordinates', () => {
    expect(haversineDistanceMeters(28.6139, 77.2090, 28.6139, 77.2090)).toBeCloseTo(0, 0);
  });

  it('should compute known distance accurately', () => {
    // Distance from Delhi to Mumbai ≈ 1150 km
    const dist = haversineDistanceMeters(28.6139, 77.2090, 19.0760, 72.8777);
    expect(dist).toBeGreaterThan(1_100_000);
    expect(dist).toBeLessThan(1_200_000);
  });
});

describe('computeLocationTrustScore', () => {
  it('should return HIGH score within HIGH radius', () => {
    // 50m away from worksite — within HIGH radius (100m)
    const nearbyLat = WORKSITE.latitude + 0.00045; // ~50m
    const result = computeLocationTrustScore(nearbyLat, WORKSITE.longitude, WORKSITE);
    expect(result.score).toBe(LOCATION_CONSTANTS.HIGH_SCORE);
  });

  it('should return LOW score far from worksite', () => {
    // 5km away
    const farLat = WORKSITE.latitude + 0.045;
    const result = computeLocationTrustScore(farLat, WORKSITE.longitude, WORKSITE);
    expect(result.score).toBe(LOCATION_CONSTANTS.LOW_SCORE);
  });

  it('should return medium score in medium zone', () => {
    // 300m away — between HIGH (100m) and MEDIUM (500m) radius
    const midLat = WORKSITE.latitude + 0.0027;
    const result = computeLocationTrustScore(midLat, WORKSITE.longitude, WORKSITE);
    expect(result.score).toBeGreaterThan(LOCATION_CONSTANTS.LOW_SCORE);
    expect(result.score).toBeLessThan(LOCATION_CONSTANTS.HIGH_SCORE);
  });
});
