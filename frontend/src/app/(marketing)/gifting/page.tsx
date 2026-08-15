import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { COLLECTIONS } from '@/lib/data/collections'
import GiftingLeadForm from '@/components/gifting/GiftingLeadForm'

export const metadata: Metadata = {
  title: 'Gifting | ODSArts',
  description:
    'Handcrafted frames as gifts — curated sets for weddings, housewarmings and milestones, plus corporate gifting with bulk pricing and bespoke engraving.',
  alternates: { canonical: '/gifting' },
  openGraph: {
    title: 'Gifting | ODSArts',
    description:
      'Handcrafted frames as gifts — curated sets for milestones, plus corporate gifting with bulk pricing.',
    type: 'website',
  },
}

/** Curated sets, each anchored to a real collection so the CTA goes somewhere. */
const GIFT_SETS = [
  {
    collectionSlug: 'walnut',
    eyebrow: 'For the newly married',
    title: 'The Wedding Set',
    copy: 'Three walnut frames in graduated sizes — one for the ceremony, one for the portrait, one left empty for whatever comes next.',
  },
  {
    collectionSlug: 'gallery',
    eyebrow: 'For the new home',
    title: 'The Housewarming Set',
    copy: 'A trio of gallery profiles that suit any wall and any photograph. The safe gift that never reads as a safe gift.',
  },
  {
    collectionSlug: 'heritage',
    eyebrow: 'For the milestone',
    title: 'The Heirloom Set',
    copy: 'Heritage glass and hand-finished timber, built to outlast the occasion it marks. Engraving available on the backing plate.',
  },
] as const

const PROCESS = [
  { step: '01', title: 'Tell us the occasion', copy: 'Share the moment, the quantity and the date you need it by.' },
  { step: '02', title: 'We curate the set', copy: 'Our studio proposes sizes, finishes and presentation options within a day.' },
  { step: '03', title: 'Handmade to order', copy: 'Each frame is cut, joined and finished by hand. Allow 7–14 working days.' },
  { step: '04', title: 'Delivered gift-ready', copy: 'Wrapped in recycled tissue and ribboned, with a handwritten note if you wish.' },
]

export default function GiftingPage() {
  const setsWithArt = GIFT_SETS.map((set) => ({
    ...set,
    collection: COLLECTIONS.find((c) => c.slug === set.collectionSlug),
  }))

  return (
    <main className="bg-ivory min-h-screen">
      {/* ── Hero ── */}
      <section className="max-w-7xl mx-auto px-6 md:px-10 pt-28 pb-16">
        <div className="flex items-center gap-4 mb-6">
          <div className="h-[1px] w-10 bg-gold/40" />
          <span className="font-body text-[10px] uppercase tracking-[0.3em] text-pewter">
            Gifting
          </span>
        </div>

        <h1 className="font-display text-[clamp(36px,5.5vw,68px)] text-obsidian leading-[1.03] max-w-3xl mb-6">
          A frame is a promise that the moment mattered.
        </h1>

        <p className="font-body text-[15px] leading-[1.85] text-pewter-dark max-w-xl">
          Anyone can send flowers. A handmade frame says you intend the memory to
          outlive the occasion — and it hangs on their wall long after the card is
          thrown away.
        </p>
      </section>

      {/* ── Curated sets ── */}
      <section className="max-w-7xl mx-auto px-6 md:px-10 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {setsWithArt.map((set) => (
            <article key={set.collectionSlug} className="group">
              <Link href={`/collections/${set.collectionSlug}`} className="block">
                <div className="relative aspect-[3/4] overflow-hidden bg-ivory-200 mb-6">
                  {set.collection && (
                    <Image
                      src={set.collection.imageSrc}
                      alt={set.collection.imageAlt}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-[1000ms]"
                    />
                  )}
                </div>

                <p className="font-body text-[10px] uppercase tracking-[0.28em] text-gold mb-2">
                  {set.eyebrow}
                </p>
                <h2 className="font-display text-[24px] text-obsidian mb-3">{set.title}</h2>
                <p className="font-body text-[13px] leading-[1.8] text-pewter-dark mb-4">
                  {set.copy}
                </p>
                <span className="font-body text-[11px] uppercase tracking-[0.22em] text-obsidian border-b border-gold/50 pb-1">
                  Explore the set
                </span>
              </Link>
            </article>
          ))}
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="border-t border-obsidian/8 bg-ivory-200/40">
        <div className="max-w-7xl mx-auto px-6 md:px-10 py-20">
          <div className="flex items-center gap-4 mb-14">
            <div className="h-[1px] w-10 bg-gold/40" />
            <span className="font-body text-[10px] uppercase tracking-[0.3em] text-pewter">
              How gifting works
            </span>
          </div>

          <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
            {PROCESS.map((item) => (
              <li key={item.step}>
                <span className="font-display text-[34px] text-gold/40 block mb-3">
                  {item.step}
                </span>
                <h3 className="font-display text-[19px] text-obsidian mb-2">{item.title}</h3>
                <p className="font-body text-[13px] leading-[1.75] text-pewter-dark">
                  {item.copy}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── Corporate gifting ── */}
      <section className="max-w-7xl mx-auto px-6 md:px-10 py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 xl:gap-24">
          <div>
            <div className="flex items-center gap-4 mb-6">
              <div className="h-[1px] w-10 bg-gold/40" />
              <span className="font-body text-[10px] uppercase tracking-[0.3em] text-pewter">
                Corporate Gifting
              </span>
            </div>

            <h2 className="font-display text-[clamp(28px,3.5vw,44px)] text-obsidian leading-[1.1] mb-6">
              Fifty frames, one standard.
            </h2>

            <p className="font-body text-[14px] leading-[1.85] text-pewter-dark mb-8 max-w-md">
              For teams, clients and milestones at scale. We hold the same studio
              standard at fifty units as at one — with bulk pricing, coordinated
              delivery dates and optional engraving on the backing plate.
            </p>

            <ul className="flex flex-col gap-3">
              {[
                'Volume pricing from 10 units',
                'Bespoke engraving and branded backing plates',
                'Coordinated nationwide delivery on a date you choose',
                'A single point of contact from brief to doorstep',
              ].map((line) => (
                <li key={line} className="flex items-start gap-3">
                  <div className="w-1 h-1 rounded-full bg-gold flex-shrink-0 mt-2.5" />
                  <span className="font-body text-[13px] leading-[1.7] text-pewter-dark">
                    {line}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:pt-4">
            <GiftingLeadForm />
          </div>
        </div>
      </section>
    </main>
  )
}
