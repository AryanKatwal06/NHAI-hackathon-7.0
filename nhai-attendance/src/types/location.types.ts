export interface LocationTrustScore {
  score: number; // 0–100
  distanceMeters: number;
  worksiteName: string;
  currentLatitude: number;
  currentLongitude: number;
  worksiteLatitude: number;
  worksiteLongitude: number;
  reason: string;
}
