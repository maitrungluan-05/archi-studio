import type { Metadata } from "next";
import Link from "next/link";
import { SlidersHorizontal } from "lucide-react";
import { AssetCard } from "@/components/asset-card";
import { DEMO_CATEGORIES } from "@/lib/mock-data";
import { getPublishedGalleryAssets } from "@/lib/gallery-data";

export const metadata: Metadata = { title: "Explore", description: "Discover works across the ARCHI archive." };

export default async function ExplorePage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const params = await searchParams;
  const sort = params.sort || "newest", category = params.category, type = params.type;
  let assets = (await getPublishedGalleryAssets())
    .filter((asset) => !category || asset.categoryName.toLowerCase() === category.toLowerCase())
    .filter((asset) => type === "image" ? asset.type === "IMAGE" : type === "video" ? asset.type === "VIDEO" : true);
  assets = [...assets].sort((a,b) => sort === "oldest" ? +new Date(a.publishDate) - +new Date(b.publishDate) : sort === "popular" ? b.views-a.views : sort === "liked" ? b.likes-a.likes : +new Date(b.publishDate)-+new Date(a.publishDate));
  const href = (next: Record<string,string|undefined>) => "/explore?" + new URLSearchParams(Object.entries({...params,...next}).filter((entry): entry is [string,string] => Boolean(entry[1]))).toString();

  return <main className="page-stage explore-page">
    <header className="page-mast explore-mast bg-[#d8dde0]"><div className="container-wide page-mast__grid"><div><p className="page-kicker">Open discovery / {assets.length} visible records</p><h1 className="page-title">Follow your eye.</h1></div><p className="page-deck">Move through the archive by affinity: subject, medium, popularity, or the accident of one image beside another.</p></div></header>
    <div className="container-wide grid gap-10 py-10 lg:grid-cols-[230px_1fr]">
      <aside className="explore-filter-column self-start"><div className="explore-filter-panel"><h2 className="flex items-center gap-2 border-b border-primary pb-4 text-xs font-bold uppercase"><SlidersHorizontal size={14}/>Refine the view</h2><Filter title="Order" items={[["Newest","newest"],["Oldest","oldest"],["Most viewed","popular"],["Most liked","liked"]]} active={sort} makeHref={value=>href({sort:value})}/><Filter title="Medium" items={[["All",undefined],["Photography","image"],["Film","video"]]} active={type} makeHref={value=>href({type:value})}/><Filter title="Room" items={[["All rooms",undefined],...DEMO_CATEGORIES.map(item=>[item.name,item.name.toLowerCase()] as [string,string])]} active={category} makeHref={value=>href({category:value})}/></div></aside>
      <section><div className="mb-6 flex justify-between border-b border-border pb-4 font-mono text-[10px] text-muted"><span>RESULT SET / {String(assets.length).padStart(3,"0")}</span><span>ARCHI DISCOVERY INDEX</span></div>{assets.length?<div className="masonry-grid">{assets.map((asset,index)=><AssetCard key={asset.id} asset={asset} variant={index%6===0?"portrait":index%5===0?"wide":"standard"}/>)}</div>:<div className="research-empty"><div><h2 className="font-editorial text-3xl">No records in this intersection.</h2><Link href="/explore" className="mt-5 inline-block border-b border-primary pb-1 text-sm text-primary no-underline">Reset discovery</Link></div></div>}</section>
    </div>
  </main>;
}

function Filter({title,items,active,makeHref}:{title:string;items:readonly (readonly [string,string|undefined])[];active?:string;makeHref:(value:string|undefined)=>string}) {
  return <div className="border-b border-border py-5"><h3 className="mb-3 font-mono text-[9px] uppercase text-muted">{title}</h3><div className="flex flex-col items-start gap-2">{items.map(([label,value])=><Link key={label} href={makeHref(value)} className={`text-sm no-underline ${active===value||(!active&&!value)?"font-bold text-burnt-orange":"text-secondary hover:text-primary"}`}>{label}</Link>)}</div></div>;
}
