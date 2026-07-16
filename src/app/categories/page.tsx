import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { connection } from "next/server";
import { DEMO_CATEGORIES } from "@/lib/mock-data";
import { getPublishedGalleryAssets } from "@/lib/gallery-data";
export const metadata: Metadata = { title: "Museum Rooms", description: "Enter the thematic rooms of the ARCHI collection." };
export default async function CategoriesPage() {
  await connection();
  const assets=await getPublishedGalleryAssets();
  return <main className="page-stage bg-natural-black text-white">
    <header className="page-mast border-white/15"><div className="container-wide page-mast__grid"><div><p className="page-kicker">Museum directory / {DEMO_CATEGORIES.length} rooms</p><h1 className="page-title !text-white">Rooms for looking.</h1></div><p className="page-deck !text-white/60">The archive is organized as a museum visit: each room holds a subject, a mood, and a way of seeing.</p></div></header>
    <div className="container-wide py-16 md:py-24"><ol className="grid gap-px bg-white/15 lg:grid-cols-2">{DEMO_CATEGORIES.map((cat,i)=>{const works=assets.filter(a=>a.categoryName===cat.name);const image=works[0]||assets[i%assets.length];return <li key={cat.slug} className="group relative min-h-[420px] overflow-hidden bg-black"><Image src={image.thumbnailUrl} alt="" fill className="object-cover opacity-45 transition duration-700 group-hover:scale-[1.03] group-hover:opacity-65"/><div className="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-transparent"/><Link href={`/categories/${cat.slug}`} className="absolute inset-0 z-10 flex flex-col justify-between p-7 text-white no-underline md:p-10"><span className="font-mono text-[10px] text-white/55">ROOM {String(i+1).padStart(2,"0")} / {works.length} WORKS</span><div><h2 className="font-editorial text-4xl font-normal !text-white md:text-6xl">{cat.name}</h2><p className="mt-4 max-w-md text-sm leading-6 text-white/65">{cat.description}</p><ArrowUpRight className="mt-6"/></div></Link></li>})}</ol></div>
  </main>;
}
