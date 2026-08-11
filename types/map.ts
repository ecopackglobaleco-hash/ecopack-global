/**
 * Types for the Global Supply World Map Visualization
 * Validates: Requirements 10
 */

/** Target market identifiers */
export type TargetMarket = 'USA' | 'UAE' | 'India' | 'UK' | 'Canada';

/** Geographic coordinates for a market position */
export interface MarketCoordinates {
  /** Latitude */
  lat: number;
  /** Longitude */
  lng: number;
}

/** Market data for a highlighted region on the world map */
export interface MarketData {
  /** Market identifier */
  id: TargetMarket;
  /** Display name shown in tooltip (e.g., "Dubai, UAE") */
  displayName: string;
  /** Geographic coordinates for marker placement */
  coordinates: MarketCoordinates;
  /** Whether this market is currently highlighted/active */
  isHighlighted: boolean;
}

/** Tooltip positioning relative to the market marker */
export type TooltipPosition = 'top' | 'bottom' | 'left' | 'right' | 'auto';

/** Configuration for market tooltips */
export interface TooltipConfig {
  /** Tooltip position relative to marker */
  position: TooltipPosition;
  /** Offset in pixels from the marker */
  offset: number;
  /** Whether to show tooltip on hover (pointer) or tap (touch) */
  showOnHover: boolean;
  /** Duration in ms before tooltip auto-hides (0 = no auto-hide) */
  autoHideDuration: number;
}

/** Props for the WorldMap component */
export interface WorldMapProps {
  /** Array of market data to display on the map */
  markets: MarketData[];
  /** Tooltip display configuration */
  tooltipConfig: TooltipConfig;
  /** Callback when a market is selected/tapped */
  onMarketSelect?: (market: MarketData) => void;
  /** Whether the map is in a loading state */
  isLoading?: boolean;
  /** Additional CSS class name */
  className?: string;
  /** ARIA label for the map container */
  ariaLabel?: string;
}
