import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Play, ShieldCheck } from "lucide-react";
import { AssetCard } from "@/components/asset-card";
import { DEMO_CATEGORIES } from "@/lib/mock-data";
import { getPublishedGalleryAssets } from "@/lib/gallery-data";
import { connection } from "next/server";

export default async function HomePage() {
  await connection();
  const assets = await getPublishedGalleryAssets();
  const images = assets.filter((asset) => asset.type === "IMAGE");
  const films = assets.filter((asset) => asset.type === "VIDEO");
  const hero = images[2];
  const editorial = [images[0], images[1], images[3]];
  const latest = images.slice(4, 8);
  const collections = images.slice(8, 11);
  const closing = images.slice(11, 13);

  return (
    <>
      <section className="archive-dark relative min-h-[calc(100svh-80px)] max-h-[920px] overflow-hidden bg-natural-black text-white">
        <Image
          src={hero.previewUrl}
          alt={hero.imageContent || hero.title}
          fill
          sizes="100vw"
          className="object-cover"
          preload
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(13,14,13,.9)_0%,rgba(13,14,13,.48)_48%,rgba(13,14,13,.08)_100%)]" aria-hidden="true" />
        <div className="absolute inset-x-0 bottom-0 h-48 bg-[linear-gradient(0deg,rgba(13,14,13,.72),transparent)]" aria-hidden="true" />

        <div className="container-wide relative flex min-h-[calc(100svh-80px)] max-h-[920px] flex-col justify-end pb-12 pt-28 md:pb-16">
          <div className="max-w-3xl">
            <p className="mb-5 inline-flex items-center gap-2 border-l-2 border-copper pl-3 text-[11px] font-bold uppercase text-white/75">
              <ShieldCheck size={14} aria-hidden="true" /> Official registry / Established 2015
            </p>
            <h1 className="text-[clamp(3.4rem,8vw,7.5rem)] font-bold leading-[.88] !text-white">
              ARCHI
              <span className="font-editorial mt-4 block max-w-2xl text-[clamp(2.25rem,5vw,5.5rem)] font-normal leading-[.94] text-sand">The record behind the image.</span>
            </h1>
            <div className="mt-8 flex max-w-2xl flex-col gap-6 border-t border-white/25 pt-6 md:flex-row md:items-end md:justify-between">
              <p className="max-w-lg text-base leading-7 text-white/72 md:text-lg">Original photography and film, documented with ownership, context, and a permanent public archive record.</p>
              <Link href="/explore" className="inline-flex shrink-0 items-center gap-2 text-sm font-bold text-white no-underline transition-colors hover:text-sand">
                Enter the archive <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </div>
          </div>
          <p className="absolute bottom-12 right-6 hidden text-right text-xs leading-5 text-white/55 md:block lg:right-16">
            Featured record<br /><span className="text-white">{hero.title}</span><br />{hero.subtitle}
          </p>
        </div>
      </section>

      <div className="border-y border-border bg-stone">
        <div className="container-wide flex min-h-14 flex-wrap items-center justify-between gap-x-8 gap-y-2 py-3 text-[11px] font-semibold uppercase text-secondary">
          <span>Independent visual registry</span>
          <span>{images.length} photographic records</span>
          <span>{films.length} motion records</span>
          <span>DMCA protected</span>
          <span>Public provenance</span>
        </div>
      </div>

      <section className="bg-ivory">
        <div className="container-wide py-14 md:py-20">
          <div className="grid gap-10 lg:grid-cols-[.72fr_1.7fr] lg:items-start">
            <header className="lg:sticky lg:top-28">
              <p className="text-caption mb-3">The Editorial Desk</p>
              <h2 className="font-editorial text-[clamp(2.4rem,4vw,4.4rem)] font-normal leading-[1.02]">Three ways of seeing.</h2>
              <p className="mt-5 max-w-sm text-base leading-7 text-secondary">Portrait, structure, and street life. Each record keeps the visual work and its provenance together.</p>
              <Link href="/images" className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-burnt-orange no-underline">Browse photography <ArrowRight size={15} /></Link>
            </header>
            <div className="grid gap-4 sm:grid-cols-2">
              <AssetCard asset={editorial[0]} variant="portrait" className="sm:row-span-2" />
              <AssetCard asset={editorial[1]} variant="wide" />
              <AssetCard asset={editorial[2]} variant="wide" />
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-stone">
        <div className="container-wide py-14 md:py-20">
          <div className="mb-8 flex items-end justify-between gap-6">
            <div>
              <p className="text-caption mb-2">Recently Cataloged</p>
              <h2 className="font-editorial text-[clamp(2.25rem,3.6vw,4rem)] font-normal leading-none">New records, varied scale.</h2>
            </div>
            <Link href="/explore?sort=newest" className="hidden items-center gap-2 text-sm font-bold text-secondary no-underline hover:text-primary sm:flex">View latest <ArrowRight size={15} /></Link>
          </div>
          <div className="grid auto-rows-[180px] grid-cols-2 gap-3 md:auto-rows-[240px] md:grid-cols-4">
            <AssetCard asset={latest[0]} variant="portrait" className="row-span-2 [&>figure]:h-full [&>figure]:aspect-auto [&>div:last-child]:hidden" />
            <AssetCard asset={latest[1]} variant="wide" className="col-span-1 md:col-span-2 [&>figure]:h-full [&>figure]:aspect-auto [&>div:last-child]:hidden" />
            <AssetCard asset={latest[2]} variant="portrait" className="row-span-2 [&>figure]:h-full [&>figure]:aspect-auto [&>div:last-child]:hidden" />
            <AssetCard asset={latest[3]} variant="wide" className="col-span-1 md:col-span-2 [&>figure]:h-full [&>figure]:aspect-auto [&>div:last-child]:hidden" />
          </div>
        </div>
      </section>

      <section className="archive-dark bg-natural-black text-white">
        <div className="container-wide py-14 md:py-20">
          <div className="mb-8 grid gap-5 border-b border-white/15 pb-7 md:grid-cols-[1fr_1fr] md:items-end">
            <div>
              <p className="text-caption mb-2 !text-copper">Motion Archive</p>
              <h2 className="font-editorial text-[clamp(2.4rem,4vw,4.5rem)] font-normal leading-none !text-white">Time, held in sequence.</h2>
            </div>
            <p className="max-w-lg text-sm leading-6 text-white/58 md:justify-self-end">Three studies of coast, city, and northern light. Technical details remain attached to every motion record.</p>
          </div>
          <div className="grid gap-4 lg:grid-cols-[1.65fr_1fr]">
            <div className="relative">
              <AssetCard asset={films[0]} variant="wide" className="bg-white/5 [&_h3]:!text-white [&_p]:!text-white/50" />
              <span className="pointer-events-none absolute left-5 top-5 z-20 flex h-12 w-12 items-center justify-center rounded-full border border-white/30 bg-black/35 text-white backdrop-blur-md"><Play size={18} fill="currentColor" /></span>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
              {films.slice(1).map((film) => <AssetCard key={film.id} asset={film} variant="wide" className="bg-white/5 [&_h3]:!text-white [&_p]:!text-white/50" />)}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-sand-soft">
        <div className="container-wide py-14 md:py-20">
          <header className="mb-9 max-w-2xl">
            <p className="text-caption mb-2">Curated Series</p>
            <h2 className="font-editorial text-[clamp(2.25rem,3.8vw,4.2rem)] font-normal leading-none">Stories built across frames.</h2>
          </header>
          <div className="grid gap-4 lg:grid-cols-12">
            {collections.map((asset, index) => (
              <article key={asset.id} className={`group relative min-h-[340px] overflow-hidden rounded-md ${index === 0 ? "lg:col-span-5" : index === 1 ? "lg:col-span-3" : "lg:col-span-4"}`}>
                <Image src={asset.thumbnailUrl} alt={asset.imageContent || asset.title} fill sizes="(max-width: 1024px) 100vw, 40vw" className="object-cover transition-transform duration-700 group-hover:scale-[1.025]" />
                <div className="absolute inset-0 bg-[linear-gradient(0deg,rgba(10,10,9,.78),transparent_65%)]" aria-hidden="true" />
                <Link href={`/gallery/${asset.slug}`} className="absolute inset-0 z-10 no-underline"><span className="sr-only">View {asset.title}</span></Link>
                <div className="absolute inset-x-0 bottom-0 p-6 text-white">
                  <p className="text-[10px] font-bold uppercase text-white/55">{asset.collectionName || asset.categoryName}</p>
                  <h3 className="font-editorial mt-2 text-2xl font-normal !text-white">{asset.title}</h3>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-ivory">
        <div className="grid lg:grid-cols-2">
          {closing.map((asset, index) => (
            <article key={asset.id} className="group relative min-h-[460px] overflow-hidden border-border lg:border-r last:border-r-0">
              <Image src={asset.thumbnailUrl} alt={asset.imageContent || asset.title} fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover transition-transform duration-700 group-hover:scale-[1.02]" />
              <div className="absolute inset-0 bg-black/20 transition-colors group-hover:bg-black/10" aria-hidden="true" />
              <Link href={`/gallery/${asset.slug}`} className="absolute inset-0 z-10 no-underline"><span className="sr-only">View {asset.title}</span></Link>
              <div className={`absolute bottom-0 max-w-md bg-ivory/95 p-6 backdrop-blur-sm ${index === 0 ? "left-0" : "right-0"}`}>
                <p className="text-caption">Curator&rsquo;s Note {String(index + 1).padStart(2, "0")}</p>
                <h2 className="font-editorial mt-2 text-3xl font-normal">{asset.title}</h2>
                <p className="mt-2 line-clamp-2 text-sm leading-6 text-secondary">{asset.description}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <nav className="border-y border-border bg-bronze text-white" aria-label="Browse categories">
        <div className="container-wide flex flex-wrap items-center gap-x-7 gap-y-3 py-5">
          <span className="mr-auto text-xs font-bold uppercase text-white/60">Browse by subject</span>
          {DEMO_CATEGORIES.map((category) => (
            <Link key={category.slug} href={`/categories/${category.slug}`} className="text-sm font-semibold text-white/85 no-underline transition-colors hover:text-white">{category.name}</Link>
          ))}
        </div>
      </nav>
    </>
  );
}
