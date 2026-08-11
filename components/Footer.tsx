/**
 * Footer Component
 * Displays contact links (email, WhatsApp, Instagram) at the bottom of every page.
 * Rendered inside the ResponsiveLayout's semantic <footer> element.
 *
 * Validates: Requirements 12.1, 12.2, 12.3, 12.4, 12.5
 */
export default function Footer() {
  return (
    <div
      id="footer"
      aria-label="Site footer with contact information"
      className="w-full bg-forest-green px-section py-12"
    >
      <div className="mx-auto max-w-5xl flex flex-col items-center gap-5 tablet:flex-row tablet:justify-center tablet:gap-8">
        {/* Email - mailto link (Req 12.1) */}
        <a
          href="mailto:ecopackglobaleco@gmail.com"
          className="min-h-[44px] min-w-[44px] flex items-center gap-2 font-inter text-sm text-ivory underline decoration-ivory/40 underline-offset-4 transition-colors hover:text-champagne-gold hover:decoration-champagne-gold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-champagne-gold tablet:text-base"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 shrink-0" aria-hidden="true">
            <path d="M1.5 8.67v8.58a3 3 0 003 3h15a3 3 0 003-3V8.67l-8.928 5.493a3 3 0 01-3.144 0L1.5 8.67z" />
            <path d="M22.5 6.908V6.75a3 3 0 00-3-3h-15a3 3 0 00-3 3v.158l9.714 5.978a1.5 1.5 0 001.572 0L22.5 6.908z" />
          </svg>
          ecopackglobaleco@gmail.com
        </a>

        {/* WhatsApp 1 - opens in new tab (Req 12.2, 12.5) */}
        <a
          href="https://wa.me/919347232843"
          target="_blank"
          rel="noopener noreferrer"
          className="min-h-[44px] min-w-[44px] flex items-center gap-2 font-inter text-sm text-ivory underline decoration-ivory/40 underline-offset-4 transition-colors hover:text-champagne-gold hover:decoration-champagne-gold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-champagne-gold tablet:text-base"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 shrink-0" aria-hidden="true">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
            <path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.492a.75.75 0 00.917.918l4.458-1.495A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22a9.94 9.94 0 01-5.332-1.545.75.75 0 00-.635-.079l-2.92.979.979-2.92a.75.75 0 00-.08-.635A9.94 9.94 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
          </svg>
          +91 93472 32843
        </a>

        {/* WhatsApp 2 - opens in new tab */}
        <a
          href="https://wa.me/916281482039"
          target="_blank"
          rel="noopener noreferrer"
          className="min-h-[44px] min-w-[44px] flex items-center gap-2 font-inter text-sm text-ivory underline decoration-ivory/40 underline-offset-4 transition-colors hover:text-champagne-gold hover:decoration-champagne-gold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-champagne-gold tablet:text-base"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 shrink-0" aria-hidden="true">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
            <path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.492a.75.75 0 00.917.918l4.458-1.495A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22a9.94 9.94 0 01-5.332-1.545.75.75 0 00-.635-.079l-2.92.979.979-2.92a.75.75 0 00-.08-.635A9.94 9.94 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
          </svg>
          +91 62814 82039
        </a>

        {/* Instagram - opens in new tab (Req 12.3, 12.5) */}
        <a
          href="https://www.instagram.com/ecopackglobal"
          target="_blank"
          rel="noopener noreferrer"
          className="min-h-[44px] min-w-[44px] flex items-center gap-2 font-inter text-sm text-ivory underline decoration-ivory/40 underline-offset-4 transition-colors hover:text-champagne-gold hover:decoration-champagne-gold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-champagne-gold tablet:text-base"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 shrink-0" aria-hidden="true">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
          </svg>
          ecopackglobal
        </a>
      </div>

      <p className="mt-6 text-center font-inter text-xs text-ivory/60">
        © {new Date().getFullYear()} EcoPack Global. All rights reserved.
      </p>
    </div>
  );
}
