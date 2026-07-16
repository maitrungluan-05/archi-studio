"use client";

import Image from "next/image";
import Link from "next/link";
import { Eye, Heart, Play } from "lucide-react";
import { formatNumber, cn } from "@/lib/utils";
import type { MockAsset } from "@/lib/mock-data";

interface AssetCardProps {
  asset: MockAsset;
  priority?: boolean;
  className?: string;
  variant?: "standard" | "portrait" | "wide";
}

export function AssetCard({ asset, priority = false, className, variant = "standard" }: AssetCardProps) {
  const href = `/gallery/${asset.slug}`;
  const duration = asset.duration
    ? `${Math.floor(asset.duration / 60)}:${String(asset.duration % 60).padStart(2, "0")}`
    : null;

  return (
    <article
      className={cn(
        "archive-tile group relative overflow-hidden bg-surface",
        "transition-all duration-300 ease-out",
        "hover:shadow-lg",
        className
      )}
    >
      {/* Image Container */}
      <figure className={cn(
        "relative overflow-hidden bg-border-light",
        variant === "portrait" && "aspect-[3/4]",
        variant === "wide" && "aspect-[16/9]",
        variant === "standard" && "aspect-[4/3]"
      )}>
        <Link href={href} className="block w-full h-full absolute inset-0 z-10">
          <span className="sr-only">View {asset.title}</span>
        </Link>
        
        <Image
          src={asset.thumbnailUrl}
          alt={asset.imageContent || asset.title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
          preload={priority}
        />

        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" aria-hidden="true" />

        {/* Video badge */}
        {asset.type === "VIDEO" && (
          <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2 py-1 rounded-full bg-black/60 text-white text-xs font-medium" aria-label="Video">
            <Play size={12} fill="currentColor" />
            {duration || "Film"}
          </div>
        )}

        <div className="absolute right-3 top-3 rounded-sm bg-black/55 px-2 py-1 text-[10px] font-semibold uppercase text-white/90 opacity-0 backdrop-blur-sm transition-opacity duration-300 group-hover:opacity-100">
          © {asset.copyrightYear} {asset.copyrightOwner}
        </div>

        {/* Stats overlay on hover */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="flex items-center gap-3 text-white text-xs">
            <span className="flex items-center gap-1" aria-label={`${formatNumber(asset.views)} views`}>
              <Eye size={13} strokeWidth={1.5} aria-hidden="true" />
              {formatNumber(asset.views)}
            </span>
            <span className="flex items-center gap-1" aria-label={`${formatNumber(asset.likes)} likes`}>
              <Heart size={13} strokeWidth={1.5} aria-hidden="true" />
              {formatNumber(asset.likes)}
            </span>
          </div>
          {asset.displayPrice && (
            <span className="text-white text-xs font-medium" aria-label={`Price: ${asset.displayPrice}`}>
              {asset.displayPrice}
            </span>
          )}
        </div>
      </figure>

      {/* Info */}
      <div className="archive-tile__caption">
        <span className="archive-tile__index">{asset.stockId}</span>
        <h3 className="text-sm font-semibold text-primary leading-tight">
          {asset.title}
        </h3>
        <p className="mt-1 text-xs text-muted">
          {asset.categoryName}{asset.country ? ` · ${asset.country}` : ""}
        </p>
      </div>
    </article>
  );
}
