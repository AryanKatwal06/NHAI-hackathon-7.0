export interface BehavioralScore {
  score: number; // 0–100
  typicalLoginHour: number; // Decimal hours (e.g., 8.5 = 8:30 AM)
  currentLoginHour: number;
  hoursFromTypical: number;
  usedPersonalHistory: boolean; // false = used population baseline
  reason: string;
}
