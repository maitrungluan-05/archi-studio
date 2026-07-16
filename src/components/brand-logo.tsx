import { cn } from "@/lib/utils";

export function BrandMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      role="img"
      aria-label="ARCHI"
      className={cn("h-10 w-10", className)}
    >
      <rect width="48" height="48" rx="8" fill="currentColor" />
      <path d="M13 16.5h6l2.25-3h5.5l2.25 3h6a3 3 0 0 1 3 3v15a3 3 0 0 1-3 3H13a3 3 0 0 1-3-3v-15a3 3 0 0 1 3-3Z" fill="#fff" fillOpacity=".16" stroke="#fff" strokeWidth="1.5" />
      <circle cx="24" cy="27" r="8.25" fill="none" stroke="#fff" strokeWidth="1.5" />
      <path d="m24 18.75 3.95 6.84-7.9.01L24 18.75Zm7.14 4.12-3.95 6.84-3.96-6.84h7.91Zm0 8.25h-7.9l3.95-6.84 3.95 6.84ZM24 35.25l-3.95-6.84 7.9-.01L24 35.25Zm-7.14-4.12 3.95-6.84 3.96 6.84h-7.91Zm0-8.25h7.9l-3.95 6.84-3.95-6.84Z" fill="#fff" />
      <path d="M33.5 12.5v5M31 15h5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M12.5 21h2M12.5 27h2M12.5 33h2M33.5 21h2M33.5 27h2M33.5 33h2" stroke="#fff" strokeWidth="1.25" strokeLinecap="round" opacity=".9" />
    </svg>
  );
}

export function BrandLockup({ compact = false }: { compact?: boolean }) {
  return (
    <span className="flex items-center gap-3">
      <BrandMark className="h-11 w-11 text-burnt-orange shrink-0" />
      {!compact && (
        <span className="leading-none">
          <span className="block text-base font-bold text-primary">ARCHI</span>
          <span className="mt-1 block text-[10px] font-medium uppercase text-muted">Digital Archive</span>
        </span>
      )}
    </span>
  );
}
