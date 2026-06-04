# Theme

Design system tokens: color palette (dark-first), typography, spacing scale, shadows, assembled theme object. Suitable for outdoor use at construction sites.

Implemented in **Phase 3 (Security, Sync, UI, and Testing)

**Architectural Rules:**
- All components must reference theme tokens — no hardcoded colors, sizes, or spacing.
- Color palette must maintain WCAG AA contrast ratios for accessibility.
- Theme changes must be centralized here — never in individual component styles.
