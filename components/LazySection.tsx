'use client';

/**
 * LazySection - Reusable wrapper for lazy loading below-fold sections
 * Validates: Requirements 7.1, 7.2
 *
 * Uses IntersectionObserver with a 200px rootMargin threshold to trigger
 * rendering of below-fold content only when it approaches the viewport.
 * This reduces initial bundle size and improves page load performance.
 */

import { useEffect, useRef, useState, type ReactNode } from 'react';

interface LazySectionProps {
  /** The content to render once the section enters the threshold */
  children: ReactNode;
  /** Fallback UI to show before the section loads */
  fallback?: ReactNode;
  /** rootMargin for IntersectionObserver (default: '200px') */
  rootMargin?: string;
  /** Minimum height for the placeholder to prevent layout shift */
  minHeight?: string;
  /** Optional className for the wrapper */
  className?: string;
}

/**
 * Default fallback placeholder that maintains space until the section loads.
 */
function DefaultFallback({ minHeight }: { minHeight: string }) {
  return (
    <div
      className="w-full animate-pulse bg-obsidian/5"
      style={{ minHeight }}
      aria-hidden="true"
    />
  );
}

export default function LazySection({
  children,
  fallback,
  rootMargin = '200px',
  minHeight = '200px',
  className,
}: LazySectionProps) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // If IntersectionObserver is not supported, render immediately
    if (typeof IntersectionObserver === 'undefined') {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      {
        rootMargin,
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [rootMargin]);

  return (
    <div ref={ref} className={className}>
      {isVisible
        ? children
        : (fallback ?? <DefaultFallback minHeight={minHeight} />)}
    </div>
  );
}
