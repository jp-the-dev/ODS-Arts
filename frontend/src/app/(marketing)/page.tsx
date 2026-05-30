// Homepage — /
// Assembles all homepage sections in order.
// Server Component (default)
// Reference: agents/09-homepage-wireframe.md

import { HeroSection } from '@/components/hero'
import FeaturedCollectionsSection from '@/components/sections/FeaturedCollectionsSection'
import CraftsmanshipSection from '@/components/sections/CraftsmanshipSection'
import CustomerHomesSection from '@/components/sections/CustomerHomesSection'
import FinalCTASection from '@/components/sections/FinalCTASection'

export default function HomePage() {
  return (
    <main className="bg-ivory">
      <HeroSection />

      {/* ═══════════════════════════════════════════
          SCREEN 2 — Brand Statement
      ═══════════════════════════════════════════ */}
      <section className="relative bg-ivory overflow-hidden">

        {/* Gold radial glow at top center */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[320px] pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at top, rgba(201,169,110,0.10) 0%, transparent 70%)' }}
        />

        {/* ── Brand Manifesto ── */}
        <div className="max-w-3xl mx-auto px-6 pt-28 pb-20 md:pt-36 md:pb-24 text-center relative z-10">

          <div className="flex items-center justify-center gap-4 mb-10">
            <div className="h-[1px] w-12 bg-gold/50" />
            <span className="font-body text-[10px] uppercase tracking-[0.3em] text-gold">ODSArts</span>
            <div className="h-[1px] w-12 bg-gold/50" />
          </div>

          <h2 className="font-display text-[clamp(34px,4.8vw,76px)] leading-[1.06] tracking-[-0.02em] text-obsidian mb-8">
            Every frame tells<br />
            <span className="italic text-walnut">a story worth keeping.</span>
          </h2>

          <div className="w-10 h-[1.5px] bg-gold mx-auto mb-8" />

          <p className="font-body text-[clamp(15px,1.35vw,18px)] leading-[1.85] text-pewter-dark max-w-xl mx-auto mb-14">
            We believe memories deserve more than a digital folder.
            ODSArts crafts premium frames by hand — because the moments
            that define your life deserve to live on your walls.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
            <a
              href="/collections"
              className="inline-flex items-center gap-3 bg-obsidian text-ivory font-body text-[11px] uppercase tracking-[0.22em] px-8 py-4 hover:bg-walnut transition-colors duration-500"
            >
              Explore Collections
              <svg width="13" height="13" viewBox="0 0 14 14" fill="none" className="opacity-60">
                <path d="M1 7h12M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
            <a
              href="/about"
              className="font-body text-[11px] uppercase tracking-[0.22em] text-obsidian/45 hover:text-obsidian border-b border-obsidian/20 hover:border-obsidian pb-[2px] transition-all duration-300"
            >
              Our Craft
            </a>
          </div>
        </div>

        {/* ── Full-width gold rule ── */}
        <div className="mx-6 md:mx-16 lg:mx-24 h-[1px] bg-gold/20" />

        {/* ── Three Pillars ── */}
        <div className="max-w-6xl mx-auto px-6 py-20 md:py-28">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8 lg:gap-16">

            {[
              {
                number: '01',
                title: 'Handcrafted',
                body: 'Every frame is cut, joined, and finished by hand in our studio. No shortcuts. No machines for the parts that matter.',
              },
              {
                number: '02',
                title: 'Premium Materials',
                body: 'Solid walnut, oak, and brushed metals. Museum-grade glass. Acid-free matting that protects for a lifetime.',
              },
              {
                number: '03',
                title: 'Made to Last',
                body: 'Heirloom construction standards. The frames you order today will be hanging in your family\'s homes decades from now.',
              },
            ].map((pillar) => (
              <div key={pillar.number} className="flex flex-col items-center text-center md:items-start md:text-left">
                <span className="font-body text-[10px] uppercase tracking-[0.3em] text-gold/70 mb-5">{pillar.number}</span>
                <h3 className="font-display text-[clamp(22px,2vw,30px)] leading-[1.2] tracking-[-0.01em] text-obsidian mb-4">
                  {pillar.title}
                </h3>
                <div className="w-6 h-[1px] bg-gold/50 mb-4" />
                <p className="font-body text-[clamp(14px,1.1vw,16px)] leading-[1.8] text-pewter-dark">
                  {pillar.body}
                </p>
              </div>
            ))}

          </div>
        </div>

        {/* ── Materials Showcase Strip ── */}
        <div className="border-t border-b border-obsidian/8 py-10 mb-2">
          <div className="max-w-6xl mx-auto px-6">
            <div className="flex flex-wrap items-center justify-center md:justify-between gap-8 md:gap-4">
              {['Solid Walnut', 'White Oak', 'Brushed Brass', 'Museum Glass', 'Acid-Free Mat'].map((material) => (
                <div key={material} className="flex items-center gap-3">
                  <div className="w-[5px] h-[5px] rounded-full bg-gold/60" />
                  <span className="font-body text-[11px] uppercase tracking-[0.25em] text-obsidian/50">
                    {material}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Pull quote ── */}
        <div className="max-w-2xl mx-auto px-6 py-20 md:py-28 text-center">
          <span className="font-display text-[80px] leading-[0] text-gold/20 select-none" aria-hidden>&ldquo;</span>
          <blockquote className="font-display text-[clamp(22px,2.5vw,34px)] leading-[1.4] tracking-[-0.01em] italic text-obsidian/75 mt-2">
            The right frame doesn&apos;t just hold a photograph.
            It tells people what that photograph means to you.
          </blockquote>
          <div className="w-8 h-[1px] bg-gold/50 mx-auto mt-8 mb-5" />
          <span className="font-body text-[10px] uppercase tracking-[0.3em] text-gold/70">
            Founding Principle
          </span>
        </div>

      </section>

      {/* ═══════════════════════════════════════════
          SCREEN 3 — Featured Collections
      ═══════════════════════════════════════════ */}
      <FeaturedCollectionsSection />

      {/* ═══════════════════════════════════════════
          SCREEN 4 — Craftsmanship
      ═══════════════════════════════════════════ */}
      <CraftsmanshipSection />

      {/* ═══════════════════════════════════════════
          SCREEN 5 — Customer Homes / Lifestyle
      ═══════════════════════════════════════════ */}
      <CustomerHomesSection />

      {/* ═══════════════════════════════════════════
          SCREEN 6 — Final Editorial CTA
      ═══════════════════════════════════════════ */}
      <FinalCTASection />

    </main>
  )
}
