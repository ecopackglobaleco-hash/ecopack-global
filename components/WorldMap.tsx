'use client';

/**
 * WorldMap - SVG world map visualization with target market markers
 * Validates: Requirements 10.1, 10.2, 10.3, 10.4
 *
 * Renders a lightweight SVG world outline with pulsing dot markers at
 * each target market location. Supports hover tooltips for pointer
 * devices and tap labels for touch devices.
 * Labels are positioned to avoid obscuring other highlighted markets.
 * Scales responsively from 320px to 1920px using viewBox.
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import type { MarketData, TargetMarket } from '@/types/map';

/** SVG coordinate positions for each target market (mapped to a 1000x500 viewBox) */
const MARKET_SVG_POSITIONS: Record<TargetMarket, { x: number; y: number }> = {
  USA: { x: 220, y: 195 },
  UAE: { x: 620, y: 245 },
  India: { x: 680, y: 255 },
  UK: { x: 470, y: 155 },
  Canada: { x: 240, y: 145 },
};

/** Tooltip offset directions to prevent obscuring other markets */
const TOOLTIP_OFFSETS: Record<TargetMarket, { dx: number; dy: number }> = {
  USA: { dx: 0, dy: 24 },
  UAE: { dx: -20, dy: -20 },
  India: { dx: 20, dy: 20 },
  UK: { dx: 0, dy: -22 },
  Canada: { dx: 20, dy: -20 },
};

const TARGET_MARKETS: MarketData[] = [
  { id: 'USA', displayName: 'United States', coordinates: { lat: 39.8, lng: -98.5 }, isHighlighted: true },
  { id: 'UAE', displayName: 'Dubai, UAE', coordinates: { lat: 25.2, lng: 55.3 }, isHighlighted: true },
  { id: 'India', displayName: 'India', coordinates: { lat: 20.6, lng: 78.9 }, isHighlighted: true },
  { id: 'UK', displayName: 'London, UK', coordinates: { lat: 51.5, lng: -0.1 }, isHighlighted: true },
  { id: 'Canada', displayName: 'Canada', coordinates: { lat: 56.1, lng: -106.3 }, isHighlighted: true },
];

export interface WorldMapComponentProps {
  className?: string;
}

export default function WorldMap({ className = '' }: WorldMapComponentProps) {
  const [activeMarket, setActiveMarket] = useState<TargetMarket | null>(null);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
  }, []);

  const handleMarkerEnter = useCallback((id: TargetMarket) => {
    if (!isTouchDevice) {
      setActiveMarket(id);
    }
  }, [isTouchDevice]);

  const handleMarkerLeave = useCallback(() => {
    if (!isTouchDevice) {
      setActiveMarket(null);
    }
  }, [isTouchDevice]);

  const handleMarkerTap = useCallback((id: TargetMarket) => {
    if (isTouchDevice) {
      setActiveMarket((prev) => (prev === id ? null : id));
    }
  }, [isTouchDevice]);

  return (
    <div className={`relative w-full ${className}`}>
      <svg
        ref={svgRef}
        viewBox="0 0 1000 500"
        preserveAspectRatio="xMidYMid meet"
        className="w-full h-auto"
        role="img"
        aria-label="World map showing EcoPack Global target markets: United States, Dubai UAE, India, London UK, and Canada"
      >
        {/* Definitions for pulse animation and glow */}
        <defs>
          <radialGradient id="marker-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#C8A96B" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#C8A96B" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Simplified world map outline - continental shapes */}
        <g fill="rgba(28, 74, 59, 0.3)" stroke="rgba(243, 240, 231, 0.15)" strokeWidth="0.5">
          {/* North America */}
          <path d="M130,90 L160,80 L200,75 L240,80 L280,95 L310,110 L320,140 L310,170 L290,190 L280,220 L270,240 L250,260 L230,270 L200,265 L180,250 L160,240 L140,220 L130,200 L120,170 L115,140 L120,110 Z" />
          {/* South America */}
          <path d="M230,280 L250,275 L270,280 L290,300 L300,330 L305,360 L300,390 L285,410 L270,430 L255,440 L240,435 L230,420 L225,390 L220,360 L215,330 L220,300 Z" />
          {/* Europe */}
          <path d="M440,100 L460,95 L490,100 L510,110 L520,130 L515,150 L505,165 L490,170 L475,175 L460,170 L450,160 L445,140 L440,120 Z" />
          {/* Africa */}
          <path d="M450,190 L470,185 L500,190 L520,200 L540,220 L550,250 L555,280 L550,310 L540,340 L525,360 L510,375 L490,380 L470,375 L455,360 L445,340 L440,310 L435,280 L440,250 L445,220 Z" />
          {/* Asia */}
          <path d="M540,90 L580,80 L630,75 L680,80 L730,90 L770,105 L790,120 L800,140 L795,160 L780,180 L760,195 L740,205 L710,215 L680,225 L660,235 L640,240 L620,235 L600,225 L580,210 L560,195 L545,175 L535,155 L530,130 L535,110 Z" />
          {/* Middle East */}
          <path d="M570,195 L590,190 L620,195 L640,205 L650,220 L645,235 L630,245 L610,250 L590,245 L575,235 L565,220 L565,205 Z" />
          {/* Australia */}
          <path d="M750,320 L780,315 L820,320 L850,335 L860,355 L855,375 L840,390 L815,395 L790,390 L770,380 L755,365 L750,345 Z" />
          {/* Greenland */}
          <path d="M340,50 L360,45 L385,50 L400,60 L405,75 L400,90 L385,95 L365,92 L350,85 L342,70 Z" />
        </g>

        {/* Target market markers with pulse animation */}
        {TARGET_MARKETS.map((market) => {
          const pos = MARKET_SVG_POSITIONS[market.id];
          const offset = TOOLTIP_OFFSETS[market.id];
          const isActive = activeMarket === market.id;

          return (
            <g
              key={market.id}
              className="cursor-pointer focus-visible:outline-none"
              onMouseEnter={() => handleMarkerEnter(market.id)}
              onMouseLeave={handleMarkerLeave}
              onClick={() => handleMarkerTap(market.id)}
              role="button"
              tabIndex={0}
              aria-label={`${market.displayName} — target market region`}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setActiveMarket((prev) => (prev === market.id ? null : market.id));
                }
              }}
              onFocus={() => handleMarkerEnter(market.id)}
              onBlur={handleMarkerLeave}
            >
              {/* Outer pulse ring */}
              <circle
                cx={pos.x}
                cy={pos.y}
                r="12"
                fill="url(#marker-glow)"
                className="animate-pulse"
              />
              {/* Focus ring indicator (visible on keyboard focus) */}
              <circle
                cx={pos.x}
                cy={pos.y}
                r="16"
                fill="none"
                stroke="#C8A96B"
                strokeWidth="2"
                className="opacity-0 group-focus-visible:opacity-100"
                style={{ opacity: 0 }}
                aria-hidden="true"
              />
              {/* Inner solid dot */}
              <circle
                cx={pos.x}
                cy={pos.y}
                r="5"
                fill="#C8A96B"
                stroke="#F3F0E7"
                strokeWidth="1.5"
              />

              {/* Tooltip */}
              {isActive && (
                <g>
                  <rect
                    x={pos.x + offset.dx - 45}
                    y={pos.y + offset.dy - 12}
                    width="90"
                    height="24"
                    rx="4"
                    fill="rgba(8, 10, 9, 0.9)"
                    stroke="rgba(200, 169, 107, 0.5)"
                    strokeWidth="1"
                  />
                  <text
                    x={pos.x + offset.dx}
                    y={pos.y + offset.dy + 4}
                    textAnchor="middle"
                    fill="#F3F0E7"
                    fontSize="11"
                    fontFamily="Inter, sans-serif"
                    fontWeight="500"
                  >
                    {market.displayName}
                  </text>
                </g>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
