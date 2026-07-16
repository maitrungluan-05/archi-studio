"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Plus, Edit, Trash2, Eye, Database, LoaderCircle } from "lucide-react";
import { formatDateVi } from "@/lib/utils";
import { getCategoryLabelVi } from "@/lib/constants";

interface AdminAsset {
  id: string;
  stockId: string;
  slug: string | null;
  title: string;
  type: "IMAGE" | "VIDEO";
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  thumbnailUrl: string | null;
  categoryName: string;
  views: number;
  publishDate: string | null;
}

export default function AdminAssetsPage() {
  const [assets, setAssets] = useState<AdminAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);
  const [deleteAsset, setDeleteAsset] = useState<AdminAsset | null>(null);
  const [error, setError] = useState("");

  const loadAssets = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/assets?pageSize=100");
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "Không thể tải danh sách tài sản");
      setAssets(body.data);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Không thể tải danh sách tài sản");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/admin/assets?pageSize=100", { signal: controller.signal })
      .then(async (response) => {
        const body = await response.json();
        if (!response.ok) throw new Error(body.error || "Không thể tải danh sách tài sản");
        setAssets(body.data);
      })
      .catch((loadError) => {
        if (loadError instanceof Error && loadError.name === "AbortError") return;
        setError(loadError instanceof Error ? loadError.message : "Không thể tải danh sách tài sản");
      })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, []);

  const importFixtures = async () => {
    setWorking(true); setError("");
    try {
      const response = await fetch("/api/admin/assets/import", { method: "POST" });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "Không thể nhập tài sản mẫu");
      await loadAssets();
    } catch (importError) {
      setError(importError instanceof Error ? importError.message : "Không thể nhập tài sản mẫu");
    } finally { setWorking(false); }
  };

  const confirmDelete = async () => {
    if (!deleteAsset) return;
    setWorking(true); setError("");
    try {
      const response = await fetch(`/api/admin/assets/${deleteAsset.id}`, { method: "DELETE" });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "Không thể xóa tài sản");
      setDeleteAsset(null);
      await loadAssets();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Không thể xóa tài sản");
    } finally { setWorking(false); }
  };

  return <div className="p-6">
    <div className="mb-6 flex items-center justify-between gap-4">
      <div><h1 className="mb-1 text-3xl font-bold text-primary">Tài sản</h1><p className="text-sm text-secondary">Quản lý {assets.length} mục trong kho lưu trữ</p></div>
      <Link href="/admin/assets/new" className="inline-flex items-center gap-2 rounded-md bg-burnt-orange px-4 py-2.5 text-sm font-semibold text-white no-underline hover:opacity-90"><Plus size={18}/>Tải tài sản lên</Link>
    </div>
    {error && <p role="alert" className="mb-4 rounded-md border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-600">{error}</p>}
    {loading ? <div className="flex min-h-64 items-center justify-center"><LoaderCircle className="animate-spin text-muted"/></div> : assets.length === 0 ?
      <div className="grid min-h-80 place-items-center rounded-lg border border-dashed border-border bg-surface text-center"><div><Database className="mx-auto mb-4 text-muted"/><h2 className="text-lg font-semibold">Cơ sở dữ liệu đã sẵn sàng</h2><p className="mt-2 text-sm text-secondary">Nhập kho dữ liệu mẫu để quản lý trong PostgreSQL.</p><button onClick={importFixtures} disabled={working} className="mt-5 rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-surface disabled:opacity-50">{working ? "Đang nhập..." : "Nhập tài sản mẫu"}</button></div></div>
      : <div className="overflow-hidden rounded-lg border border-border"><table className="w-full text-sm"><thead className="border-b border-border bg-surface"><tr><th className="px-4 py-3 text-left text-xs text-muted">Tài sản</th><th className="px-4 py-3 text-left text-xs text-muted">Loại</th><th className="px-4 py-3 text-left text-xs text-muted">Danh mục</th><th className="px-4 py-3 text-center text-xs text-muted">Lượt xem</th><th className="px-4 py-3 text-center text-xs text-muted">Xuất bản</th><th className="px-4 py-3 text-right text-xs text-muted">Thao tác</th></tr></thead><tbody>{assets.map(asset=><tr key={asset.id} className="border-b border-border hover:bg-surface/50"><td className="px-4 py-3"><div className="flex items-center gap-3"><div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md bg-border-light"><Image src={asset.thumbnailUrl || "/archi-mark.svg"} alt="" fill sizes="40px" className="object-cover"/></div><div><p className="font-medium text-primary">{asset.title}</p><p className="text-xs text-muted">{asset.stockId}</p></div></div></td><td className="px-4 py-3 text-xs text-secondary">{asset.type === "IMAGE" ? "Ảnh" : "Video"}</td><td className="px-4 py-3 text-xs text-secondary">{getCategoryLabelVi(asset.categoryName)}</td><td className="px-4 py-3 text-center text-secondary">{asset.views.toLocaleString("vi-VN")}</td><td className="px-4 py-3 text-center text-secondary">{asset.publishDate ? formatDateVi(asset.publishDate) : "Chưa xuất bản"}</td><td className="px-4 py-3"><div className="flex justify-end gap-2">{asset.slug && <Link href={`/gallery/${asset.slug}`} className="rounded-md p-2 hover:bg-border-light" title="Xem"><Eye size={16} className="text-muted"/></Link>}<Link href={`/admin/assets/${asset.id}/edit`} className="rounded-md p-2 hover:bg-border-light" title="Chỉnh sửa"><Edit size={16} className="text-muted"/></Link><button onClick={()=>setDeleteAsset(asset)} className="rounded-md p-2 hover:bg-red-500/10" title="Xóa"><Trash2 size={16} className="text-muted"/></button></div></td></tr>)}</tbody></table></div>}
    {deleteAsset && <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4"><div role="dialog" aria-modal="true" aria-labelledby="delete-title" className="w-full max-w-md rounded-lg bg-surface p-6 shadow-xl"><h2 id="delete-title" className="text-xl font-bold">Xóa tài sản?</h2><p className="mt-3 text-sm text-secondary">Thao tác này sẽ xóa vĩnh viễn <strong>{deleteAsset.title}</strong> khỏi cơ sở dữ liệu.</p><div className="mt-6 flex justify-end gap-3"><button onClick={()=>setDeleteAsset(null)} disabled={working} className="rounded-md border border-border px-4 py-2 text-sm">Hủy</button><button onClick={confirmDelete} disabled={working} className="rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">{working ? "Đang xóa..." : "Xóa"}</button></div></div></div>}
  </div>;
}
