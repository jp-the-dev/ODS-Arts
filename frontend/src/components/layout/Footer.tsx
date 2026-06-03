import Link from 'next/link'
import FooterNewsletter from './FooterNewsletter'

const FOOTER_LINKS = {
  shop: [
    { label: 'Collections', href: '/collections' },
    { label: 'Best Sellers', href: '/products' },
    { label: 'Custom Framing', href: '/custom-framing' },
    { label: 'The Gift Edit', href: '/gifting' },
  ],
  about: [
    { label: 'Our Story', href: '/about' },
    { label: 'Craftsmanship', href: '/#craft' }, // Using hash for homepage section as per standard
    { label: 'Sustainability', href: '/sustainability' },
    { label: 'Press', href: '/press' },
  ],
  help: [
    { label: 'Shipping Info', href: '/help/shipping' },
    { label: 'Returns', href: '/help/returns' },
    { label: 'Care Guide', href: '/help/care' },
    { label: 'FAQ', href: '/help/faq' },
  ],
  follow: [
    { label: 'Instagram', href: 'https://instagram.com/odsarts' },
    { label: 'Pinterest', href: 'https://pinterest.com/odsarts' },
  ]
}

export default function Footer() {
  return (
    <footer className="bg-obsidian w-full relative pt-20 pb-8 md:pt-32 border-t border-obsidian">
      {/* 1px gold rule closing the gallery */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gold/20" />

      <div className="max-w-7xl mx-auto px-6">
        
        {/* DESKTOP LAYOUT (visible md and up) */}
        <div className="hidden md:grid md:grid-cols-4 gap-12 lg:gap-16 mb-24">
          
          {/* Col 1: Brand */}
          <div className="flex flex-col gap-4">
            <Link href="/" className="font-display text-[28px] text-ivory tracking-wide hover:text-gold transition-colors">
              ODSArts
            </Link>
            <p className="font-display italic text-[17px] text-pewter leading-snug max-w-[200px]">
              &quot;Where memory becomes art.&quot;
            </p>
          </div>

          {/* Col 2: Shop & Help */}
          <div className="flex flex-col gap-16">
            <div className="flex flex-col gap-6">
              <span className="font-body text-[11px] uppercase tracking-[0.25em] text-gold">Shop</span>
              <ul className="flex flex-col gap-3">
                {FOOTER_LINKS.shop.map(link => (
                  <li key={link.label}>
                    <Link href={link.href} className="font-body text-[14px] text-pewter hover:text-ivory transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="flex flex-col gap-6">
              <span className="font-body text-[11px] uppercase tracking-[0.25em] text-gold">Help</span>
              <ul className="flex flex-col gap-3">
                {FOOTER_LINKS.help.map(link => (
                  <li key={link.label}>
                    <Link href={link.href} className="font-body text-[14px] text-pewter hover:text-ivory transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Col 3: About */}
          <div className="flex flex-col gap-6">
            <span className="font-body text-[11px] uppercase tracking-[0.25em] text-gold">About</span>
            <ul className="flex flex-col gap-3">
              {FOOTER_LINKS.about.map(link => (
                <li key={link.label}>
                  <Link href={link.href} className="font-body text-[14px] text-pewter hover:text-ivory transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4: Contact & Follow */}
          <div className="flex flex-col gap-16">
            <div className="flex flex-col gap-6">
              <span className="font-body text-[11px] uppercase tracking-[0.25em] text-gold">Contact</span>
              <a href="mailto:hello@odsarts.in" className="font-body text-[14px] text-pewter hover:text-ivory transition-colors">
                hello@odsarts.in
              </a>
            </div>

            <div className="flex flex-col gap-6">
              <span className="font-body text-[11px] uppercase tracking-[0.25em] text-gold">Follow</span>
              <ul className="flex flex-col gap-3">
                {FOOTER_LINKS.follow.map(link => (
                  <li key={link.label}>
                    <a href={link.href} target="_blank" rel="noopener noreferrer" className="font-body text-[14px] text-pewter hover:text-ivory transition-colors">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* MOBILE LAYOUT (Accordion, visible below md) */}
        <div className="md:hidden flex flex-col gap-10 mb-16">
          
          {/* Brand */}
          <div className="flex flex-col gap-3 items-center text-center pb-6">
            <Link href="/" className="font-display text-[28px] text-ivory tracking-wide">
              ODSArts
            </Link>
            <p className="font-display italic text-[17px] text-pewter">
              &quot;Where memory becomes art.&quot;
            </p>
          </div>

          <div className="flex flex-col divide-y divide-gold/10 border-t border-b border-gold/10">
            {/* Shop Accordion */}
            <details className="group py-5">
              <summary className="flex items-center justify-between font-body text-[12px] uppercase tracking-[0.25em] text-gold cursor-pointer list-none [&::-webkit-details-marker]:hidden">
                Shop
                <span className="text-gold/50 transition-transform group-open:rotate-180">↓</span>
              </summary>
              <ul className="flex flex-col gap-4 mt-5 pb-2">
                {FOOTER_LINKS.shop.map(link => (
                  <li key={link.label}>
                    <Link href={link.href} className="font-body text-[15px] text-pewter hover:text-ivory transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </details>

            {/* About Accordion */}
            <details className="group py-5">
              <summary className="flex items-center justify-between font-body text-[12px] uppercase tracking-[0.25em] text-gold cursor-pointer list-none [&::-webkit-details-marker]:hidden">
                About
                <span className="text-gold/50 transition-transform group-open:rotate-180">↓</span>
              </summary>
              <ul className="flex flex-col gap-4 mt-5 pb-2">
                {FOOTER_LINKS.about.map(link => (
                  <li key={link.label}>
                    <Link href={link.href} className="font-body text-[15px] text-pewter hover:text-ivory transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </details>

            {/* Help Accordion */}
            <details className="group py-5">
              <summary className="flex items-center justify-between font-body text-[12px] uppercase tracking-[0.25em] text-gold cursor-pointer list-none [&::-webkit-details-marker]:hidden">
                Help
                <span className="text-gold/50 transition-transform group-open:rotate-180">↓</span>
              </summary>
              <ul className="flex flex-col gap-4 mt-5 pb-2">
                {FOOTER_LINKS.help.map(link => (
                  <li key={link.label}>
                    <Link href={link.href} className="font-body text-[15px] text-pewter hover:text-ivory transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </details>

            {/* Contact & Follow */}
            <details className="group py-5">
              <summary className="flex items-center justify-between font-body text-[12px] uppercase tracking-[0.25em] text-gold cursor-pointer list-none [&::-webkit-details-marker]:hidden">
                Contact & Follow
                <span className="text-gold/50 transition-transform group-open:rotate-180">↓</span>
              </summary>
              <div className="flex flex-col gap-6 mt-5 pb-2">
                <a href="mailto:hello@odsarts.in" className="font-body text-[15px] text-pewter hover:text-ivory transition-colors">
                  hello@odsarts.in
                </a>
                <div className="flex gap-6">
                  {FOOTER_LINKS.follow.map(link => (
                    <a key={link.label} href={link.href} target="_blank" rel="noopener noreferrer" className="font-body text-[15px] text-pewter hover:text-ivory transition-colors">
                      {link.label}
                    </a>
                  ))}
                </div>
              </div>
            </details>
          </div>
        </div>

        {/* Newsletter Section */}
        <div className="w-full flex justify-start md:justify-end border-b border-gold/10 pb-16 md:pb-24">
          <FooterNewsletter />
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <span className="font-body text-[11px] text-pewter tracking-[0.08em] order-3 md:order-1">
            © {new Date().getFullYear()} ODSArts
          </span>
          <div className="flex items-center gap-8 order-1 md:order-2">
            <Link href="/privacy" className="font-body text-[11px] text-pewter hover:text-ivory tracking-[0.08em] transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="font-body text-[11px] text-pewter hover:text-ivory tracking-[0.08em] transition-colors">
              Terms
            </Link>
          </div>
          <span className="font-body text-[11px] text-pewter tracking-[0.08em] order-2 md:order-3">
            Made in India
          </span>
        </div>

      </div>
    </footer>
  )
}
