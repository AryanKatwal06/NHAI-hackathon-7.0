# Trust Components

This folder contains UI components for displaying the Dynamic Trust Score: TrustScoreGauge (animated circular gauge), ScoreBreakdown (per-signal detail view), and related visualization widgets.

All trust components are implemented in **Phase 2 (Core AI/ML Engine)

**Architectural Rules:**
- The gauge animation must smoothly animate from 0 to the final score.
- Color coding must match TRUST_THRESHOLDS: green (>=80), yellow (>=60), red (<60).
- Score breakdowns must show all 5 signal contributions.
