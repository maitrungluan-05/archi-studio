import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { AssetCard } from "@/components/asset-card";
import { DEMO_CATEGORIES } from "@/lib/mock-data";
import { getPublishedGalleryAssets } from "@/lib/gallery-data";

export async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata> {
  const {slug}=await params;
  const category=DEMO_CATEGORIES.find((item)=>item.slug===slug);
  return category ? {title:category.name,description:category.description} : {title:"Not Found"};
}

export default async function CategoryDetailPage({params}:{params:Promise<{slug:string}>}) {
  const slug=(await params).slug;
  const category=DEMO_CATEGORIES.find((item)=>item.slug===slug);
  if(!category) notFound();
  const assets=(await getPublishedGalleryAssets()).filter((asset)=>asset.categoryName===category.name);
  const room=String(DEMO_CATEGORIES.indexOf(category)+1).padStart(2,"0");
  return <main className="page-stage"><header className="page-mast bg-natural-black text-white"><div className="container-wide"><Link href="/categories" className="mb-12 inline-flex items-center gap-2 text-xs text-white/55 no-underline"><ArrowLeft size={13}/>Museum directory</Link><div className="page-mast__grid"><div><p className="page-kicker">Museum room / {room}</p><h1 className="page-title !text-white">{category.name}</h1></div><p className="page-deck !text-white/60">{category.description}</p></div></div></header><section className="container-wide py-16 md:py-24"><div className="mb-9 flex justify-between border-b border-border pb-4 font-mono text-[10px] text-muted"><span>ON VIEW / {assets.length} WORKS</span><span>ROOM {room}</span></div>{assets.length?<div className="editorial-grid">{assets.map((asset,index)=><AssetCard key={asset.id} asset={asset} variant={index%3===0?"portrait":"standard"}/>)}</div>:<div className="research-empty"><p>This room is currently between exhibitions.</p></div>}</section></main>;
}
