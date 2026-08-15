import { getAllProducts } from '@/lib/services/products'
import { getAllArt } from '@/lib/services/art'
import WishlistContent from '@/components/wishlist/WishlistContent'

/**
 * Saved items — /wishlist
 *
 * The wishlist itself lives in the browser (localStorage, synced to the account
 * when signed in), so the catalogues are fetched here and the client component
 * filters them. Previously this resolved slugs against the mock fixtures, which
 * meant it silently showed nothing once the API went live and never showed art
 * at all.
 *
 * Metadata lives in ./layout.tsx, which marks this route noindex.
 */
export const revalidate = 3600

export default async function WishlistPage() {
  const [products, art] = await Promise.all([getAllProducts(), getAllArt()])

  return (
    <main className="bg-ivory min-h-screen">
      {/* ── Header ── */}
      <section className="relative pt-40 pb-16 md:pt-52 md:pb-20 px-6 text-center overflow-hidden">
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse at top, rgba(201,169,110,0.08) 0%, transparent 65%)',
          }}
        />
        <div className="relative z-10 max-w-3xl mx-auto">
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="h-[1px] w-12 bg-gold/50" />
            <span className="font-body text-[10px] uppercase tracking-[0.35em] text-gold">
              Your Edit
            </span>
            <div className="h-[1px] w-12 bg-gold/50" />
          </div>
          <h1 className="font-display text-[clamp(36px,4.5vw,68px)] leading-[1.05] tracking-[-0.02em] text-obsidian mb-6">
            Saved <em className="italic text-walnut not-italic">Pieces</em>
          </h1>
        </div>
      </section>

      {/* Summary + grid — outside the narrow header so the grid can breathe. */}
      <WishlistContent products={products} art={art} />
    </main>
  )
}
