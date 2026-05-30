# ODSArts — Framer Motion & Animation Guidelines

> **Critical Architecture Guidelines for Animations**
> This document outlines the mandatory rules for using `framer-motion` alongside Next.js App Router in the ODSArts codebase. These rules were established after debugging severe scroll-cache remount bugs.

---

## The Next.js Remount Bug
In Next.js App Router, when a user navigates away from a page and clicks the **Back** button, Next.js restores the component tree from its client-side cache and restores the scroll position.

**The Problem:** `framer-motion` struggles to sync its internal state with Next.js's rapid scroll restoration. 
1. `initial` and `animate` lifecycle props often fail to re-trigger, leaving elements permanently stuck in their `initial={{ opacity: 0 }}` hidden states.
2. `useScroll` hooks read temporary, volatile scroll values during the DOM remount, causing `useTransform` mappings to evaluate to incorrect values (like locking an opacity fade-out to `0`).

---

## 1. Rule: DO NOT use Framer Motion for Entry Animations
For elements that must appear when the page loads (especially Above-The-Fold elements like the Hero Image or Hero Text), **do not use Framer Motion's `initial` / `animate` cycle.**

### ❌ Anti-pattern (Causes text/images to disappear on back navigation)
```tsx
// NEVER do this for above-the-fold content
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
>
  Hero Content
</motion.div>
```

### ✅ Correct Pattern (Pure CSS)
Use the custom Tailwind CSS keyframes defined in `globals.css` (`animate-fade-up`, `animate-fade-in-slow`). CSS animations are processed natively by the browser's paint thread and are 100% immune to Next.js caching bugs.
```tsx
// ALWAYS do this for entry animations
<div 
  className="animate-fade-up" 
  style={{ animationDelay: '400ms' }}
>
  Hero Content
</div>
```

---

## 2. Rule: DO NOT animate `opacity: 0` on scroll
When using `useScroll` to create parallax effects, do not force the primary image's opacity to `0`. If `framer-motion` miscalculates the scroll progress on a route remount, the inline style will permanently stick at `opacity: 0` and the element will vanish from the DOM.

### ❌ Anti-pattern (Causes black flash or invisible images)
```tsx
const imageOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0])
<motion.div style={{ opacity: imageOpacity }}>
  <Image />
</motion.div>
```

### ✅ Correct Pattern (Overlay Method)
Leave the image at `opacity: 1`. Instead of fading the image *out*, fade a solid-colored overlay (like the `#F5F0E8` ivory bloom) *in* over top of it.
```tsx
const bloomOpacity = useTransform(scrollYProgress, [0.3, 0.9], [0, 1])

{/* Image never vanishes */}
<div className="absolute inset-0">
  <Image />
</div>

{/* Bloom covers it */}
<motion.div 
  className="absolute inset-0 bg-ivory" 
  style={{ opacity: bloomOpacity }} 
/>
```

---

## 3. Rule: Separate Scroll Wrappers from Entry Elements
If you absolutely must combine a scroll transform (like parallax `y` or `scale`) with an entry animation, **never put them on the same DOM element**. Framer Motion will conflict over the CSS properties.

```tsx
{/* Outer wrapper handles the scroll physics ONLY */}
<motion.div style={{ scale: scrollScale }}>
  
  {/* Inner wrapper handles the CSS entry animation ONLY */}
  <div className="animate-fade-in-slow">
    Content
  </div>

</motion.div>
```

## Summary Checklist for New Sections
- [ ] Are you using `animate-fade-up` instead of `initial={{ opacity: 0 }}` for load animations?
- [ ] Is your LCP (Largest Contentful Paint) image free of Javascript fade-ins?
- [ ] Are scroll-driven opacity fades done via overlays instead of hiding the content?
