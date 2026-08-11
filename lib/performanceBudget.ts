/**
 * Performance Budget Configuration
 * Validates: Requirements 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7
 *
 * Defines performance thresholds for the EcoPack Global website.
 * These budgets align with Lighthouse scoring and Core Web Vitals targets.
 */

/** Performance budget constants */
export const PERFORMANCE_BUDGET = {
  /** Maximum initial page transfer size before lazy-loaded assets (Req 7.1) */
  maxInitialTransferKB: 2048, // 2MB

  /** Critical bundle size limit: layout + hero text + CSS + fonts (Req 7.2) */
  maxCriticalBundleKB: 100,

  /** Maximum size per 3D model file after compression (Req 7.3) */
  maxModelSizeKB: 5120, // 5MB

  /** Target First Contentful Paint - desktop (Req 7.5) */
  targetFCPDesktopMs: 1500,

  /** Target Largest Contentful Paint - desktop, 10Mbps, 40ms RTT (Req 7.4) */
  targetLCPDesktopMs: 3000,

  /** Target Largest Contentful Paint - mobile, 1.6Mbps, 150ms RTT, 4x CPU (Req 7.6) */
  targetLCPMobileMs: 5000,

  /** Maximum number of initial HTTP requests (Req 7.7) */
  maxInitialRequests: 25,
} as const;

/** Asset type categories for budgeting */
export type AssetCategory = 'font' | 'image' | 'model' | 'script' | 'style';

/** Per-category size budgets (KB) */
export const CATEGORY_BUDGETS: Record<AssetCategory, number> = {
  font: 150,     // All font files combined
  image: 500,    // Above-fold images only (hero fallback, background)
  model: 5120,   // Single model (loaded async, not in initial payload)
  script: 300,   // Critical path JS (framework + app code)
  style: 50,     // CSS (inlined critical + external)
};

/**
 * Lighthouse simulation conditions for testing
 */
export const LIGHTHOUSE_CONDITIONS = {
  desktop: {
    throughputMbps: 10,
    rttMs: 40,
    cpuSlowdown: 1,
  },
  mobile: {
    throughputMbps: 1.6,
    rttMs: 150,
    cpuSlowdown: 4,
  },
} as const;
