'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { useCart } from '@/lib/store/cart'
import { formatPrice } from '@/lib/types/product'

export default function CartDrawer() {
  const { items, isDrawerOpen, closeDrawer, removeItem, updateQty, subtotalPaise, totalItems } = useCart()

  return (
    <AnimatePresence>
      {isDrawerOpen && (
        <>
          {/* ── Backdrop ── */}
          <motion.div
            key="cart-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={closeDrawer}
            className="fixed inset-0 z-[200] bg-obsidian/40 backdrop-blur-sm"
          />

          {/* ── Drawer panel ── */}
          <motion.aside
            key="cart-drawer"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 35 }}
            className="fixed top-0 right-0 z-[201] h-full w-full max-w-[420px] bg-ivory flex flex-col shadow-2xl"
          >

            {/* ── Header ── */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-obsidian/8">
              <div>
                <h2 className="font-display text-2xl text-obsidian">Your Cart</h2>
                <p className="font-body text-[11px] text-pewter mt-0.5">
                  {totalItems} {totalItems === 1 ? 'item' : 'items'}
                </p>
              </div>
              <button
                onClick={closeDrawer}
                className="w-10 h-10 flex items-center justify-center text-pewter hover:text-obsidian transition-colors focus:outline-none"
                aria-label="Close cart"
              >
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M1 1L17 17M17 1L1 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </button>
            </div>

            {/* ── Items ── */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
                  <div className="w-16 h-16 rounded-full bg-ivory-200 flex items-center justify-center">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" className="text-pewter">
                      <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 01-8 0"/>
                    </svg>
                  </div>
                  <p className="font-display text-xl text-obsidian">Your cart is empty</p>
                  <p className="font-body text-sm text-pewter">Explore our collections to find your perfect frame.</p>
                  <Link
                    href="/collections"
                    onClick={closeDrawer}
                    className="mt-2 font-body text-[11px] uppercase tracking-[0.2em] text-gold border-b border-gold hover:text-gold-dark transition-colors"
                  >
                    Browse Collections
                  </Link>
                </div>
              ) : (
                <ul className="flex flex-col divide-y divide-obsidian/6">
                  {items.map((item) => {
                    const heroImg = item.product.images.find(i => i.role === 'hero') ?? item.product.images[0]
                    return (
                      <li key={item.key} className="flex gap-4 py-5">
                        {/* Thumbnail */}
                        <div className="relative w-20 h-20 flex-shrink-0 bg-ivory-200 overflow-hidden">
                          {heroImg && (
                            <Image
                              src={heroImg.url}
                              alt={heroImg.alt}
                              fill
                              sizes="80px"
                              className="object-cover"
                            />
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 flex flex-col gap-1">
                          <h3 className="font-display text-[16px] text-obsidian leading-snug">
                            {item.product.name}
                          </h3>
                          <p className="font-body text-[12px] text-pewter">
                            {item.variant.sizeLabel} · {item.finish.name}
                          </p>
                          <p className="font-body text-[13px] text-obsidian mt-1">
                            {formatPrice(item.unitPricePaise)}
                          </p>

                          {/* Qty stepper + remove */}
                          <div className="flex items-center gap-3 mt-2">
                            <div className="flex items-center border border-obsidian/15">
                              <button
                                onClick={() => updateQty(item.key, item.quantity - 1)}
                                className="w-8 h-8 flex items-center justify-center text-obsidian hover:bg-obsidian/5 focus:outline-none font-body"
                              >
                                −
                              </button>
                              <span className="w-8 text-center font-body text-sm tabular-nums">{item.quantity}</span>
                              <button
                                onClick={() => updateQty(item.key, item.quantity + 1)}
                                className="w-8 h-8 flex items-center justify-center text-obsidian hover:bg-obsidian/5 focus:outline-none font-body"
                              >
                                +
                              </button>
                            </div>
                            <button
                              onClick={() => removeItem(item.key)}
                              className="font-body text-[11px] text-pewter hover:text-rose transition-colors focus:outline-none"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>

            {/* ── Footer ── */}
            {items.length > 0 && (
              <div className="border-t border-obsidian/8 px-6 py-6 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <span className="font-body text-[12px] uppercase tracking-[0.15em] text-pewter">Subtotal</span>
                  <span className="font-display text-xl text-obsidian">{formatPrice(subtotalPaise)}</span>
                </div>
                <p className="font-body text-[11px] text-pewter">
                  Taxes and shipping calculated at checkout.
                </p>

                {/* Checkout CTA — stub until backend is ready */}
                <Link
                  href="/checkout"
                  onClick={closeDrawer}
                  className="w-full py-5 bg-obsidian text-ivory font-body text-[11px] uppercase tracking-[0.22em] flex items-center justify-center hover:bg-walnut transition-colors duration-500"
                >
                  Proceed to Checkout
                </Link>

                <button
                  onClick={closeDrawer}
                  className="w-full py-3 font-body text-[11px] uppercase tracking-[0.15em] text-pewter hover:text-obsidian transition-colors"
                >
                  Continue Shopping
                </button>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
