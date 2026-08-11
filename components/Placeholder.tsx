/**
 * Placeholder - Visual placeholder for unavailable content
 * Validates: Requirements 14.2, 14.3
 *
 * Renders a styled placeholder following the "[PLACEHOLDER: <category>]" format.
 * Visually distinguishable from surrounding content with a dashed border and
 * muted styling so it's clearly identifiable as missing content.
 *
 * WARNING: This component must NOT appear in production builds.
 * The build-time check (scripts/check-placeholders.js) will fail the build
 * if any "[PLACEHOLDER:" text is found in source files.
 */

import type { PlaceholderCategory } from '@/lib/contentIntegrity';
import { placeholder } from '@/lib/contentIntegrity';

interface PlaceholderProps {
  /** The content category that needs verified data */
  category: PlaceholderCategory;
  /** Optional additional context for developers */
  context?: string;
}

/**
 * Renders a visually distinguishable placeholder element.
 * Used in development when specific factual content is not yet available.
 */
export default function Placeholder({ category, context }: PlaceholderProps) {
  const text = placeholder(category);

  return (
    <span
      className="inline-block px-2 py-1 border border-dashed border-champagne-gold/50 rounded text-champagne-gold/70 text-sm font-mono bg-forest-green/20"
      title={context || `Placeholder: awaiting verified ${category} data`}
      data-placeholder-category={category}
    >
      {text}
    </span>
  );
}
