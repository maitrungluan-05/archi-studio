import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { connection } from "next/server";
import { ArrowRight } from "lucide-react";
import { AssetCard } from "@/components/asset-card";
import { DEMO_COLLECTIONS } from "@/lib/mock-data";
import { getPublishedGalleryAssets } from "@/lib/gallery-data";

export const metadata: Metadata = { title: "Collections", description: "Curated visual stories from ARCHI." };

export default async function CollectionsPage() {
  await connection();
  const assets = await getPublishedGalleryAssets();
  const unassigned = assets.filter((asset) => !asset.collectionName);
  return <main className="page-stage bg-ivory"><header className="page-mast"><div className="container-wide page-mast__grid"><div><p className="page-kicker">Curator&rsquo;s shelf / Volume I</p><h1 className="page-title">Stories across frames.</h1></div><p className="page-deck">Collections gather works that speak to one another across place and time. Read them as essays made from images.</p></div></header><div className="container-wide py-16 md:py-24">{unassigned.length>0&&<section className="mb-20 border-b border-border pb-16"><div className="mb-8"><p className="font-mono text-[10px] text-muted">NEW RECORDS / {unassigned.length}</p><h2 className="font-editorial mt-3 text-4xl font-normal">Chưa xếp bộ sưu tập</h2></div><div className="editorial-grid">{unassigned.map((asset,index)=><AssetCard key={asset.id} asset={asset} variant={index%3===0?"portrait":"standard"}/>)}</div></section>}<div className="space-y-20">{DEMO_COLLECTIONS.map((collection,index)=>{const works=assets.filter(asset=>asset.collectionName===collection.name);const image=works[0]||assets[index%assets.length];return <article key={collection.slug} className={`grid items-center gap-8 lg:grid-cols-12 ${index%2?"lg:[&>*:first-child]:order-2":""}`}><Link href={`/collections/${collection.slug}`} className="group relative min-h-[420px] overflow-hidden lg:col-span-7"><Image src={image.thumbnailUrl} alt={image.title} fill className="object-cover transition duration-700 group-hover:scale-[1.02]"/></Link><div className="lg:col-span-4 lg:col-start-auto"><p className="font-mono text-[10px] text-muted">COLLECTION {String(index+1).padStart(2,"0")} / {works.length} RECORDS</p><h2 className="font-editorial mt-4 text-4xl font-normal md:text-6xl">{collection.name}</h2><p className="mt-5 max-w-md leading-7 text-secondary">{collection.description}</p><Link href={`/collections/${collection.slug}`} className="mt-7 inline-flex items-center gap-2 border-b border-primary pb-2 text-sm font-bold text-primary no-underline">Read the collection <ArrowRight size={15}/></Link></div></article>})}</div></div></main>;
}
