import type { Metadata } from "next";
import { cache } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Eye, Heart, Download, Bookmark, ShieldCheck,
  Camera, MapPin, Calendar, Hash, ChevronRight, ExternalLink,
} from "lucide-react";
import { getMockAssetBySlug, getMockAssets, type MockAsset, type MockRightsHolderRole } from "@/lib/mock-data";
import { getPrisma } from "@/lib/prisma";
import { AssetCard } from "@/components/asset-card";
import { formatNumber, formatDate, formatUsd, slugify } from "@/lib/utils";
import { SITE, LICENSE_TYPES } from "@/lib/constants";
import { generateImageMetadata } from "@/lib/asset-utils";
import { MediaWatermark } from "@/components/media-watermark";

async function getGalleryAsset(slug: string): Promise<MockAsset | undefined> {
  const prisma = getPrisma();

  if (prisma) {
    const findAsset = () => prisma.asset.findUnique({
        where: { slug },
        include: {
          category: true,
          collection: true,
          tags: { include: { tag: true } },
          rightsHolders: { where: { isPublic: true }, orderBy: { displayOrder: "asc" } },
        },
      });
    let asset: Awaited<ReturnType<typeof findAsset>> = null;

    for (let attempt = 1; attempt <= 3; attempt += 1) {
      try {
        asset = await findAsset();
        break;
      } catch (error) {
        console.error(`Gallery asset database lookup failed (attempt ${attempt}/3):`, error);
        if (attempt < 3) await new Promise((resolve) => setTimeout(resolve, attempt * 120));
      }
    }

    if (asset) {
        const previewUrl = asset.previewUrl ?? asset.thumbnailUrl ?? asset.originalUrl ?? "";
        const generatedMetadata = asset.type === "IMAGE" ? generateImageMetadata(asset.id) : null;
        const copyrightOwner = asset.rightsHolders.find((holder) => holder.role === "COPYRIGHT_OWNER")?.name ?? "ARCHI";
        const visibleRoles: MockRightsHolderRole[] = ["COPYRIGHT_OWNER", "AUTHORIZED_REPRESENTATIVE", "ARCHIVE_CUSTODIAN"];

        return {
          id: asset.id,
          publicId: asset.publicId,
          stockId: asset.stockId,
          slug: asset.slug ?? slug,
          type: asset.type,
          status: asset.status,
          title: asset.title,
          subtitle: asset.subtitle ?? undefined,
          description: asset.description ?? "",
          story: asset.story ?? undefined,
          imageContent: asset.imageContent ?? undefined,
          seoTitle: asset.seoTitle ?? undefined,
          seoDescription: asset.seoDescription ?? undefined,
          displayPrice: asset.displayPrice ?? "",
          thumbnailUrl: asset.thumbnailUrl ?? previewUrl,
          previewUrl,
          width: asset.width ?? generatedMetadata?.width ?? 1600,
          height: asset.height ?? generatedMetadata?.height ?? 1200,
          resolution: asset.resolution ?? (asset.width && asset.height ? `${asset.width} x ${asset.height}` : generatedMetadata?.resolution ?? "Not specified"),
          camera: asset.camera ?? generatedMetadata?.camera,
          lens: asset.lens ?? generatedMetadata?.lens,
          iso: asset.iso ?? generatedMetadata?.iso,
          aperture: asset.aperture ?? generatedMetadata?.aperture,
          focalLength: asset.focalLength ?? generatedMetadata?.focalLength,
          shutterSpeed: asset.shutterSpeed ?? generatedMetadata?.shutterSpeed,
          country: asset.country ?? undefined,
          city: asset.city ?? undefined,
          location: asset.location ?? undefined,
          copyrightOwner,
          copyrightYear: asset.createdAt.getUTCFullYear(),
          licenseType: asset.licenseType,
          publicContactEmail: asset.publicContactEmail ?? undefined,
          publicContactWebsite: asset.publicContactWebsite ?? undefined,
          rightsHolders: asset.rightsHolders
            .filter((holder) => visibleRoles.includes(holder.role as MockRightsHolderRole))
            .map((holder) => ({
              name: holder.name,
              role: holder.role as MockRightsHolderRole,
              organization: holder.organization ?? undefined,
              email: holder.email ?? undefined,
              website: holder.website ?? undefined,
            })),
          views: asset.views,
          likes: asset.likes,
          downloads: asset.downloads,
          favorites: asset.favorites,
          popularity: asset.popularity,
          shootDate: asset.shootDate?.toISOString() ?? "",
          publishDate: asset.publishDate?.toISOString() ?? asset.createdAt.toISOString(),
          createdAt: asset.createdAt,
          updatedAt: asset.updatedAt,
          categoryName: asset.category?.name ?? "Uncategorized",
          collectionName: asset.collection?.name ?? undefined,
          tags: asset.tags.map(({ tag }) => tag.name),
          duration: asset.duration ?? undefined,
          fps: asset.fps ?? undefined,
          codec: asset.codec ?? undefined,
        };
    }
  }

  return getMockAssetBySlug(slug);
}

const getCachedGalleryAsset = cache(getGalleryAsset);

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const asset = await getCachedGalleryAsset(slug);
  if (!asset) return { title: "Not Found" };
  return {
    title: asset.seoTitle || asset.title,
    description: asset.seoDescription || asset.description,
    openGraph: {
      title: asset.title,
      description: asset.description,
      images: [{ url: asset.previewUrl, width: asset.width, height: asset.height }],
    },
    alternates: { canonical: `/gallery/${asset.slug}` },
  };
}

export default async function GalleryDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const asset = await getCachedGalleryAsset(slug);

  if (!asset) {
    notFound();
  }

  const allAssets = getMockAssets();
  const related = allAssets.filter(
    (a) => a.id !== asset.id && a.categoryName === asset.categoryName
  ).slice(0, 4);
  const moreFromCollection = asset.collectionName
    ? allAssets.filter((a) => a.id !== asset.id && a.collectionName === asset.collectionName).slice(0, 4)
    : [];

  const licenseLabel = LICENSE_TYPES[asset.licenseType as keyof typeof LICENSE_TYPES] || asset.licenseType;
  const permanentUrl = `${SITE.url}/gallery/${asset.slug}`;
  const rightsHolders = asset.rightsHolders ?? [];
  const copyrightOwner = rightsHolders.find((holder) => holder.role === "COPYRIGHT_OWNER")?.name
    ?? asset.copyrightOwner;
  const rightsRoleLabels = {
    COPYRIGHT_OWNER: "Copyright Owner",
    AUTHORIZED_REPRESENTATIVE: "Authorized Representative",
    ARCHIVE_CUSTODIAN: "Archive Custodian",
  } as const;
  return (
    <main className={asset.type === "VIDEO" ? "screening-record archive-dark bg-natural-black text-white" : "museum-record"}>
      {/* Breadcrumbs */}
      <nav className="container-wide border-b border-border pt-6 pb-4" aria-label="Breadcrumb">
        <ol className="flex items-center gap-1.5 text-xs text-muted">
          <li><Link href="/" className="hover:text-primary transition-colors no-underline">Home</Link></li>
          <li><ChevronRight size={12} aria-hidden="true" /></li>
          <li><Link href="/explore" className="hover:text-primary transition-colors no-underline">Explore</Link></li>
          <li><ChevronRight size={12} aria-hidden="true" /></li>
          <li><Link href={`/categories/${slugify(asset.categoryName)}`} className="hover:text-primary transition-colors no-underline">
            {asset.categoryName}
          </Link></li>
          <li><ChevronRight size={12} aria-hidden="true" /></li>
          <li className="text-primary">{asset.title}</li>
        </ol>
      </nav>

      <div className="container-wide py-10 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.7fr)_minmax(280px,.55fr)] gap-10 lg:gap-16">
          {/* ============================================================
              Left: Image Preview & Details
              ============================================================ */}
          <article>
            <header className="mb-8 border-b border-border pb-7 md:mb-10 md:pb-9">
              <p className="text-caption mb-3">Copyright owner / {copyrightOwner}</p>
              <h1 className="font-editorial max-w-5xl text-5xl font-normal leading-[0.95] md:text-7xl">
                {asset.title}
              </h1>
              {asset.subtitle && <p className="mt-4 text-sm font-medium text-muted">{asset.subtitle}</p>}
            </header>

            <div id="preview" className="relative aspect-[4/3] overflow-hidden bg-border-light">
              <Image
                src={asset.previewUrl}
                alt={asset.imageContent || asset.title}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 66vw"
                loading="eager"
              />
              <MediaWatermark />
            </div>

            {/* Stats bar */}
            <div className="flex items-center gap-6 mt-4 py-3 border-b border-border">
              <span className="flex items-center gap-1.5 text-sm text-secondary">
                <Eye size={15} strokeWidth={1.5} /> {formatNumber(asset.views)} views
              </span>
              <span className="flex items-center gap-1.5 text-sm text-secondary">
                <Heart size={15} strokeWidth={1.5} /> {formatNumber(asset.likes)} likes
              </span>
              <span className="flex items-center gap-1.5 text-sm text-secondary">
                <Download size={15} strokeWidth={1.5} /> {formatNumber(asset.downloads)} downloads
              </span>
              <span className="flex items-center gap-1.5 text-sm text-secondary">
                <Bookmark size={15} strokeWidth={1.5} /> {formatNumber(asset.favorites)} favorites
              </span>
            </div>

            {/* Description */}
            <div className="mt-6">
              <p className="mt-3 text-body text-secondary leading-relaxed">
                {asset.description}
              </p>
            </div>

            {asset.imageContent && (
              <section className="mt-8 border-l-2 border-burnt-orange pl-5">
                <h2 className="text-caption mb-2">Visual Record</h2>
                <p className="text-sm leading-6 text-secondary">{asset.imageContent}</p>
              </section>
            )}

            {asset.story && (
              <section className="mt-10 border-t border-border pt-8">
                <p className="text-caption mb-2">Archive Note</p>
                <h2 className="text-h3">Behind the record</h2>
                <p className="mt-4 max-w-2xl text-body leading-7 text-secondary">{asset.story}</p>
              </section>
            )}

            {/* Tags */}
            {asset.tags.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-2">
                {asset.tags.map((tag) => (
                  <Link
                    key={tag}
                    href={`/search?q=${tag}`}
                    className="px-3 py-1.5 rounded-full text-xs font-medium border border-border text-secondary hover:text-primary hover:border-primary transition-colors no-underline"
                  >
                    {tag}
                  </Link>
                ))}
              </div>
            )}
          </article>

          {/* ============================================================
              Right: Metadata Sidebar
              ============================================================ */}
          <aside className="space-y-6">
            {/* Price & Actions */}
            <div className="rounded-lg border border-border bg-surface p-6">
              {asset.displayPrice && (
                <div className="mb-4">
                  <p className="text-caption mb-1">Display Price</p>
                  <p className="text-2xl font-bold text-primary">{formatUsd(asset.displayPrice)}</p>
                </div>
              )}
              <div className="flex gap-2">
                <a href={asset.previewUrl} target="_blank" rel="noreferrer" className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-md bg-primary text-surface text-sm font-semibold no-underline hover:opacity-90 transition-opacity">
                  <ExternalLink size={15} /> Focus preview
                </a>
              </div>
            </div>

            {/* Copyright Section */}
            <div className="rounded-lg border border-burnt-orange/20 bg-burnt-orange/5 p-6">
              <div className="flex items-center gap-2 mb-4">
                <ShieldCheck size={18} className="text-burnt-orange" />
                <h3 className="text-sm font-semibold text-primary">Copyright & License</h3>
              </div>
              <dl className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted">Status</dt>
                  <dd className="font-medium text-olive-green flex items-center gap-1">
                    <svg width="6" height="6" viewBox="0 0 6 6" fill="currentColor"><circle cx="3" cy="3" r="3"/></svg>
                    Verified Original
                  </dd>
                </div>
                {rightsHolders.length > 0 ? rightsHolders.map((holder) => (
                  <div key={`${holder.role}-${holder.name}`} className="border-t border-burnt-orange/15 pt-3 first:border-0 first:pt-0">
                    <dt className="text-muted">{rightsRoleLabels[holder.role]}</dt>
                    <dd className="mt-1 font-medium text-primary">{holder.name}</dd>
                    {holder.organization && <dd className="text-xs text-secondary">{holder.organization}</dd>}
                    {holder.email && <dd className="mt-1 text-xs"><a href={`mailto:${holder.email}`}>{holder.email}</a></dd>}
                    {holder.website && <dd className="text-xs"><a href={holder.website} rel="noreferrer">{holder.website}</a></dd>}
                  </div>
                )) : (
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted">Copyright Owner</dt>
                    <dd className="font-medium text-primary">{asset.copyrightOwner}</dd>
                  </div>
                )}
                <div className="flex justify-between">
                  <dt className="text-muted">Copyright</dt>
                  <dd className="font-medium text-primary">© {asset.copyrightYear}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted">License</dt>
                  <dd className="font-medium text-primary">{licenseLabel}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted">Archive</dt>
                  <dd className="font-medium text-burnt-orange">Official Digital Archive</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted">DMCA</dt>
                  <dd className="font-medium text-primary">Protected</dd>
                </div>
                {asset.publicContactEmail && (
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted">Public Contact</dt>
                    <dd className="text-right"><a href={`mailto:${asset.publicContactEmail}`}>{asset.publicContactEmail}</a></dd>
                  </div>
                )}
                {asset.publicContactWebsite && (
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted">Public Website</dt>
                    <dd className="max-w-[60%] truncate text-right"><a href={asset.publicContactWebsite} rel="noreferrer">{asset.publicContactWebsite}</a></dd>
                  </div>
                )}
              </dl>
            </div>

            {/* Asset Info */}
            <div className="rounded-lg border border-border bg-surface p-6">
              <h3 className="text-sm font-semibold mb-4">Asset Information</h3>
              <dl className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted flex items-center gap-1.5"><Hash size={13}/> Stock ID</dt>
                  <dd className="font-mono text-xs text-primary">{asset.stockId}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted flex items-center gap-1.5"><Hash size={13}/> Public ID</dt>
                  <dd className="font-mono text-xs text-primary">{asset.publicId}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted">Resolution</dt>
                  <dd className="text-primary">{asset.resolution}</dd>
                </div>
                {asset.camera && (
                  <div className="flex justify-between">
                    <dt className="text-muted flex items-center gap-1.5"><Camera size={13}/> Camera</dt>
                    <dd className="text-primary text-right text-xs">{asset.camera}</dd>
                  </div>
                )}
                {asset.lens && (
                  <div className="flex justify-between">
                    <dt className="text-muted">Lens</dt>
                    <dd className="text-primary text-right text-xs">{asset.lens}</dd>
                  </div>
                )}
                {asset.iso && (
                  <div className="flex justify-between">
                    <dt className="text-muted">ISO</dt>
                    <dd className="text-primary">{asset.iso}</dd>
                  </div>
                )}
                {asset.aperture && (
                  <div className="flex justify-between">
                    <dt className="text-muted">Aperture</dt>
                    <dd className="text-primary">{asset.aperture}</dd>
                  </div>
                )}
                {asset.duration && (
                  <div className="flex justify-between"><dt className="text-muted">Duration</dt><dd className="text-primary">{Math.floor(asset.duration / 60)}:{String(asset.duration % 60).padStart(2, "0")}</dd></div>
                )}
                {asset.fps && <div className="flex justify-between"><dt className="text-muted">Frame Rate</dt><dd className="text-primary">{asset.fps}</dd></div>}
                {asset.codec && <div className="flex justify-between gap-4"><dt className="text-muted">Codec</dt><dd className="text-right text-primary">{asset.codec}</dd></div>}
              </dl>
            </div>

            {/* Location */}
            {(asset.country || asset.city) && (
              <div className="rounded-lg border border-border bg-surface p-6">
                <h3 className="text-sm font-semibold mb-4 flex items-center gap-1.5">
                  <MapPin size={14}/> Location
                </h3>
                <dl className="space-y-3 text-sm">
                  {asset.location && (
                    <div className="flex justify-between">
                      <dt className="text-muted">Place</dt>
                      <dd className="text-primary">{asset.location}</dd>
                    </div>
                  )}
                  {asset.city && (
                    <div className="flex justify-between">
                      <dt className="text-muted">City</dt>
                      <dd className="text-primary">{asset.city}</dd>
                    </div>
                  )}
                  {asset.country && (
                    <div className="flex justify-between">
                      <dt className="text-muted">Country</dt>
                      <dd className="text-primary">{asset.country}</dd>
                    </div>
                  )}
                </dl>
              </div>
            )}

            {/* Dates */}
            <div className="rounded-lg border border-border bg-surface p-6">
              <h3 className="text-sm font-semibold mb-4 flex items-center gap-1.5">
                <Calendar size={14}/> Dates
              </h3>
              <dl className="space-y-3 text-sm">
                {asset.shootDate && (
                  <div className="flex justify-between">
                    <dt className="text-muted">Shot</dt>
                    <dd className="text-primary">{formatDate(asset.shootDate)}</dd>
                  </div>
                )}
                <div className="flex justify-between">
                  <dt className="text-muted">Published</dt>
                  <dd className="text-primary"><time dateTime={asset.publishDate}>{formatDate(asset.publishDate)}</time></dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted">Archive Date</dt>
                  <dd className="text-primary"><time dateTime={asset.createdAt.toISOString()}>{formatDate(asset.createdAt)}</time></dd>
                </div>
              </dl>
            </div>

            {/* Permanent URL */}
            <div className="rounded-lg border border-border bg-surface p-6">
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-1.5">
                <ExternalLink size={14}/> Permanent URL
              </h3>
              <a href={permanentUrl} className="flex items-center gap-2 rounded-md bg-bg px-3 py-2 text-xs font-mono text-secondary no-underline hover:text-primary">
                <span className="truncate">{permanentUrl}</span><ExternalLink className="shrink-0" size={13}/>
              </a>
            </div>
          </aside>
        </div>

        {/* ============================================================
            Related Works
            ============================================================ */}
        {related.length > 0 && (
          <section className="mt-20 pt-10 border-t border-border">
            <div className="flex items-end justify-between mb-8">
              <div>
                <p className="text-caption mb-2">More in {asset.categoryName}</p>
                <h2 className="text-h3">Related Works</h2>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {related.map((a) => (
                <AssetCard key={a.id} asset={a} />
              ))}
            </div>
          </section>
        )}

        {/* More From Collection */}
        {moreFromCollection.length > 0 && (
          <section className="mt-16 pt-10 border-t border-border">
            <div className="flex items-end justify-between mb-8">
              <div>
                <p className="text-caption mb-2">From the Collection</p>
                <h2 className="text-h3">{asset.collectionName}</h2>
              </div>
              <Link
                href={`/collections/${asset.collectionName?.toLowerCase().replace(/\s+/g, "-")}`}
                className="text-sm text-secondary hover:text-primary transition-colors no-underline"
              >
                View collection →
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {moreFromCollection.map((a) => (
                <AssetCard key={a.id} asset={a} />
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
