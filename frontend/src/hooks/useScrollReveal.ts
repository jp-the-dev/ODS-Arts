'use client'

/**
 * useScrollReveal — Direct DOM Scroll Reveal
 *
 * WHY direct DOM manipulation instead of useState:
 * - useState requires React to schedule a re-render, which has timing issues
 *   with Next.js App Router's scroll restoration on back navigation.
 * - Direct style mutation via ref is synchronous — IO fires → style changes
 *   immediately, no React re-render cycle involved.
 * - This works reliably on first load, on back navigation, and on any route
 *   change that causes a component remount.
 */

import { useEffect, useRef } from 'react'

interface UseScrollRevealOptions {
  threshold?: number   // fraction of element visible to trigger (0-1)
  delay?: number       // ms delay before transition starts
  duration?: number    // ms for the transition
  y?: number           // px to translate from
}

export function useScrollReveal<T extends HTMLElement = HTMLDivElement>(
  options: UseScrollRevealOptions = {}
) {
  const {
    threshold = 0.08,
    delay = 0,
    duration = 900,
    y = 28,
  } = options

  const ref = useRef<T>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    // Set initial hidden state directly on the DOM node — no React state needed
    el.style.opacity = '0'
    el.style.transform = `translateY(${y}px)`
    el.style.transition = `opacity ${duration}ms cubic-bezier(0.25,0,0,1) ${delay}ms, transform ${duration}ms cubic-bezier(0.25,0,0,1) ${delay}ms`
    el.style.willChange = 'opacity, transform'

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Reveal — directly write to DOM, no React re-render needed
          el.style.opacity = '1'
          el.style.transform = 'translateY(0px)'
          el.style.willChange = 'auto'
          // Keep observing — if scrolled away and back, re-trigger
        } else {
          el.style.opacity = '0'
          el.style.transform = `translateY(${y}px)`
        }
      },
      { threshold }
    )

    observer.observe(el)
    return () => observer.disconnect()
    // Mount/unmount only, deliberately. The options are read once to configure
    // the observer and the element's initial style; re-running on a changed
    // option would tear down and rebuild the observer mid-scroll, and callers
    // pass literals that never actually change. Suppressed rather than
    // "fixed", because adding the deps would change documented behaviour.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return ref
}
