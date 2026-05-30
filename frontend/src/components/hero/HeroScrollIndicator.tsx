'use client'

export default function HeroScrollIndicator() {
  return (
    <div
      className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center justify-center gap-4 z-20 animate-fade-in-slow"
      style={{ animationDelay: '1200ms' }}
    >
      <span className="font-body text-[10px] text-obsidian/50 uppercase tracking-[0.3em]">
        Scroll to Explore
      </span>
      {/* Track: obsidian/20 */}
      <div className="w-[1px] h-12 bg-obsidian/15" />
    </div>
  )
}
