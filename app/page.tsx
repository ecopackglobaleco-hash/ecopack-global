import dynamic from 'next/dynamic';
import HeroSection from '@/components/HeroSection';
import LazySection from '@/components/LazySection';
import ScrollSectionWiring from '@/components/ScrollSectionWiring';

/**
 * Below-fold section components are dynamically imported to enable
 * per-section code splitting. Each section loads its JavaScript bundle
 * only when needed, reducing the initial page transfer size.
 *
 * Validates: Requirements 7.1, 7.2, 7.7
 */

const BrandStatement = dynamic(() => import('@/components/BrandStatement'), {
  loading: () => <SectionPlaceholder />,
});

const PaperWaterBottles = dynamic(() => import('@/components/PaperWaterBottles'), {
  loading: () => <SectionPlaceholder />,
});

const ProductAnatomy = dynamic(() => import('@/components/ProductAnatomy'), {
  loading: () => <SectionPlaceholder />,
});

const WhyEcoPack = dynamic(() => import('@/components/WhyEcoPack'), {
  loading: () => <SectionPlaceholder />,
});

const ProductPortfolio = dynamic(() => import('@/components/ProductPortfolio'), {
  loading: () => <SectionPlaceholder />,
});

const Industries = dynamic(() => import('@/components/Industries'), {
  loading: () => <SectionPlaceholder />,
});

const CustomBranding = dynamic(() => import('@/components/CustomBranding'), {
  loading: () => <SectionPlaceholder />,
});

const GlobalSupply = dynamic(() => import('@/components/GlobalSupply'), {
  loading: () => <SectionPlaceholder />,
});

const HowItWorks = dynamic(() => import('@/components/HowItWorks'), {
  loading: () => <SectionPlaceholder />,
});

const EnquiryFormWrapper = dynamic(() => import('@/components/EnquiryFormWrapper'), {
  loading: () => <SectionPlaceholder />,
});

const FinalCTA = dynamic(() => import('@/components/FinalCTA'), {
  loading: () => <SectionPlaceholder />,
});

/** Lightweight placeholder shown while dynamic chunks load */
function SectionPlaceholder() {
  return (
    <div
      className="w-full min-h-[200px] animate-pulse bg-obsidian/5"
      aria-hidden="true"
    />
  );
}

export default function Home() {
  return (
    <main>
      {/* Scroll-position-linked transition wiring for all 13 sections (Req 2.1) */}
      <ScrollSectionWiring />

      {/* Above-fold: statically imported for immediate render */}
      <HeroSection />

      {/* Below-fold: lazy loaded at 200px IntersectionObserver threshold */}
      <LazySection minHeight="300px">
        <BrandStatement />
      </LazySection>

      <LazySection minHeight="600px">
        <PaperWaterBottles />
      </LazySection>

      <LazySection minHeight="600px">
        <ProductAnatomy />
      </LazySection>

      <LazySection minHeight="600px">
        <WhyEcoPack />
      </LazySection>

      <LazySection minHeight="600px">
        <ProductPortfolio />
      </LazySection>

      <LazySection minHeight="500px">
        <Industries />
      </LazySection>

      <LazySection minHeight="500px">
        <CustomBranding />
      </LazySection>

      <LazySection minHeight="500px">
        <GlobalSupply />
      </LazySection>

      <LazySection minHeight="500px">
        <HowItWorks />
      </LazySection>

      <LazySection minHeight="500px">
        <EnquiryFormWrapper />
      </LazySection>

      <LazySection minHeight="300px">
        <FinalCTA />
      </LazySection>
    </main>
  );
}
