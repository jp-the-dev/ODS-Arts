# ODSArts — Scroll Animation & Back-Navigation Bug: Root Cause & Fix

> **Document Type:** Bug Post-Mortem + Permanent Rule  
> **Status:** RESOLVED — Pattern established in `src/hooks/useScrollReveal.ts`  
> **Affected Stack:** Next.js App Router · React 19 · Framer Motion · Tailwind CSS v4

---

## The Bug

**Symptom:** After navigating to any inner page (e.g. `/collections`) and pressing the browser back button to return to the homepage, all animated sections below the fold rendered as **completely invisible blank space**. Headers rendered fine, but content blocks (CollectionStoryBlock, CraftsmanshipSection steps, HomeStoryBlock images, FinalCTASection) stayed permanently hidden even after scrolling directly to them.

---

## Root Cause: Three Compounding Issues

### Issue 1 — `animate` vs `whileInView` (First Mistake)

The original components used Framer Motion's `initial` + `animate` props:

```tsx
// ❌ WRONG — fires once on component MOUNT, never again
<motion.article
  initial="hidden"
  animate="visible"
  variants={blockVariants}
>
```

**Why it breaks:** `animate` fires its animation exactly once — when the component mounts. In Next.js App Router, client-side navigation (via `<Link>`) does **not unmount/remount** page components. It just swaps the page's server-rendered content. So when you navigate away and come back, `animate` has already fired and won't fire again. The component stays in whatever variant state it had last — often `opacity: 0` for below-fold elements.

**Partial fix applied:** Changed to `whileInView="visible"` — but this was still broken.

---

### Issue 2 — Framer Motion `whileInView` Race Condition with Scroll Restoration

`whileInView` uses Framer Motion's internal `IntersectionObserver`. After switching to `whileInView`, it still didn't work on back navigation. Here's why:

**Next.js App Router back-navigation sequence:**
1. User navigates to `/collections`
2. User presses back → React renders the `/` page tree
3. **`useEffect` runs** → Framer Motion sets up its IntersectionObserver  
4. IO fires its **initial intersection check** — at this moment, scroll position is `0` (top), so below-fold elements are `isIntersecting: false`
5. **Browser then restores scroll position** (e.g. to 3000px where user was before)
6. Elements are now in the viewport, but Framer Motion's IO only re-fires when intersection **changes** (enters/exits). In some timing windows, the IO fires before scroll is restored (step 3→4 before step 5), recording "not intersecting" — and then NEVER re-fires because the intersection state appears unchanged from Framer's internal perspective.

**Result:** `whileInView` permanently stuck at `hidden` state even with `viewport={{ once: false }}`.

---

### Issue 3 — React `useState` Re-render Timing

The second attempt used a custom `useScrollReveal` hook returning `{ ref, isVisible }` (a React state boolean):

```tsx
// ❌ STILL BROKEN — React state update timing
const { ref, isVisible } = useScrollReveal()

<div className={isVisible ? 'opacity-100' : 'opacity-0'}>
```

**Why it breaks:** Even with a working IntersectionObserver, the `setState` call goes into React's update queue. React 19 batches state updates and schedules re-renders asynchronously. In the race condition window where scroll restoration happens simultaneously with the IO callback, the setState can be deferred past the point where the user has already scrolled past the element. The element is now out of view → IO fires `isIntersecting: false` → `setState(false)` → opacity stays 0.

The chain: `IO fires → setState → React batches → schedules re-render → paint` has too many async steps where timing can fail.

---

## The Definitive Fix

**Pattern: Direct DOM style manipulation from the IO callback.**

```typescript
// ✅ CORRECT — src/hooks/useScrollReveal.ts
useEffect(() => {
  const el = ref.current
  if (!el) return

  // Set initial state directly on DOM — no React render needed
  el.style.opacity = '0'
  el.style.transform = `translateY(${y}px)`
  el.style.transition = `opacity ${duration}ms ..., transform ${duration}ms ...`

  const observer = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) {
      // Direct DOM write — synchronous, no React scheduler involved
      el.style.opacity = '1'
      el.style.transform = 'translateY(0px)'
    } else {
      el.style.opacity = '0'
      el.style.transform = `translateY(${y}px)`
    }
  }, { threshold })

  observer.observe(el)
  return () => observer.disconnect()
}, []) // Only on mount — fresh observer every time component mounts
```

**Why this works:**
- `IO fires → ref.current.style.opacity = '1'` is **synchronous and immediate**
- Zero React re-render cycle → zero batch/schedule timing issues
- `useEffect` runs fresh on every component mount, giving a fresh IO subscription
- `PageTransitionWrapper` (keyed on `usePathname`) ensures Client Components remount on route changes, so `useEffect` re-runs correctly on each navigation

---

## Rules Going Forward

> [!IMPORTANT]
> **NEVER use `initial + animate` on section components.** This fires once on mount and never re-triggers on client-side navigation. It will ALWAYS break on back navigation in Next.js App Router.

> [!IMPORTANT]
> **NEVER use `whileInView` from Framer Motion for section entry animations.** It has an unreliable race condition with Next.js App Router's scroll restoration on back navigation.

> [!IMPORTANT]
> **NEVER use `useState` to control scroll-reveal visibility.** React's batched state updates create timing issues with IO callbacks during scroll restoration.

### ✅ What TO Use

| Use Case | Correct Approach |
|---|---|
| Scroll-triggered section reveal | `useScrollReveal` hook (direct DOM style mutation) |
| Scroll-driven parallax (continuous) | Framer Motion `useScroll` + `useTransform` + `style` prop ✅ |
| Hover effects | Framer Motion `whileHover` ✅ (not IO-based, safe) |
| Hero / above-fold animations | CSS `@keyframes` + Tailwind `animate-*` classes ✅ (fires on mount) |
| Drawer / modal transitions | Framer Motion `AnimatePresence` ✅ (user-triggered, not IO) |

### What Framer Motion IS Safe For in This Project

```
✅ useScroll + useTransform  — parallax effects (scroll position, not IO)
✅ whileHover               — hover states (event-driven, not IO)
✅ AnimatePresence          — mount/unmount transitions (drawer, overlay)
✅ motion.div style prop    — any style driven by a MotionValue
```

---

## File Reference

| File | Role |
|---|---|
| `src/hooks/useScrollReveal.ts` | The correct scroll reveal implementation |
| `src/components/motion/PageTransitionWrapper.tsx` | Forces Client Component remount on route change |
| `src/components/collections/CollectionStoryBlock.tsx` | Example correct usage |
| `src/components/sections/CraftsmanshipSection.tsx` | Example with per-step staggered delays |
| `src/components/lifestyle/HomeStoryBlock.tsx` | Example with parallax + reveal combined |

---

## Usage Pattern

```tsx
// In any animated section component:
import { useScrollReveal } from '@/hooks/useScrollReveal'

const titleRef = useScrollReveal({ threshold: 0.15 })
const imageRef = useScrollReveal<HTMLDivElement>({ threshold: 0.1, duration: 1200 })
const bodyRef  = useScrollReveal<HTMLDivElement>({ threshold: 0.1, delay: 150 })

return (
  <section>
    <h2 ref={titleRef}>...</h2>        {/* No className needed for opacity */}
    <div ref={imageRef}>...</div>
    <div ref={bodyRef}>...</div>
  </section>
)
```

**Note:** Do NOT add `opacity-0` or `translate-y-*` Tailwind classes to elements using this hook. The hook sets those styles directly via `ref.current.style` in `useEffect`. Adding Tailwind classes will conflict.

---

## Issue 4 — Next.js 14 Bfcache / Hard Navigation Bug

**Symptom:** Elements controlled by React `useEffect` (like the Floating Navigation Orb) completely disappeared when navigating to an internal page and clicking the browser "Back" button.

**Root Cause:** The internal navigation links (like the "Explore Series" button) were using standard HTML `<a>` tags instead of Next.js `<Link>` components. 
- Standard `<a>` tags trigger a **hard, full-page navigation**.
- When the user hits "Back", the browser restores the DOM from its Back-Forward Cache (Bfcache).
- However, Next.js App Router hydration completely fails to resume the React JavaScript context after a hard navigation Bfcache resume. 
- The result: The component HTML was visible, but `useEffect` **never ran** (`Effect Runs: 0`). The JavaScript thread was completely dead, preventing any scroll listeners from attaching or firing.

**The Fix:** 
Replaced all internal `<a>` tags with `next/link` `<Link>` components. This forces Next.js to perform a soft, client-side navigation. When hitting "Back", Next.js intercepts it and reverses the client-side route, keeping the React tree completely alive and ensuring `useEffect` fires correctly.

> [!CAUTION]
> **NEVER use standard `<a>` tags for internal links in Next.js App Router.** Always use `import Link from 'next/link'`. Failing to do so will break Next.js client-side routing, corrupt the React tree on back-navigation, and permanently freeze any `useEffect` hooks relying on the Bfcache resume.
