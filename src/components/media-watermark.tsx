import { cn } from "@/lib/utils";

export function MediaWatermark({ className }: { className?: string }) {
  return <div aria-hidden="true" className={cn("pointer-events-none absolute bottom-4 right-4 z-20 select-none text-white md:bottom-6 md:right-6", className)}>
    <div className="flex items-end gap-3 border border-white/20 bg-black/35 px-3 py-2 shadow-sm backdrop-blur-md">
      <span className="h-7 w-px bg-white/65 md:h-9"/>
      <span className="text-right leading-none">
        <strong className="block text-sm font-bold text-white md:text-base">ARCHI</strong>
        <span className="mt-1 block font-mono text-[7px] uppercase text-white/70 md:text-[8px]">Visual Archive / 2015</span>
      </span>
    </div>
  </div>;
}
