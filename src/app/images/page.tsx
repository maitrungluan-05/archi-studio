import type { Metadata } from "next";
import { connection } from "next/server";
import { AssetCard } from "@/components/asset-card";
import { getPublishedGalleryAssets } from "@/lib/gallery-data";

export const metadata: Metadata = {
  title: "Gallery",
  description: "The complete ARCHI photography gallery.",
};

export default async function ImagesPage() {
  await connection();
  const assets = (await getPublishedGalleryAssets()).filter((asset) => asset.type === "IMAGE");
  return (
    <main className="page-stage">
      <header className="page-mast bg-stone">
        <div className="container-wide page-mast__grid">
          <div><p className="page-kicker">Photography / Contact sheet 01</p><h1 className="page-title">The gallery.</h1></div>
          <p className="page-deck">A working wall of authored photographs, arranged by visual rhythm rather than chronology.</p>
        </div>
      </header>
      <section className="container-wide py-14 md:py-20">
        <div className="editorial-grid">
          {assets.map((asset, index) => <AssetCard key={asset.id} asset={asset} variant={index % 5 === 0 ? "portrait" : index % 4 === 0 ? "wide" : "standard"} />)}
        </div>
      </section>
    </main>
  );
}
