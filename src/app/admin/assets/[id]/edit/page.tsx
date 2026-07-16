"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { AlertCircle, ChevronLeft, LoaderCircle, Save } from "lucide-react";
import { DEMO_CATEGORIES } from "@/lib/mock-data";
import { getCategoryLabelVi } from "@/lib/constants";

interface EditForm {
  title: string; subtitle: string; description: string; story: string;
  displayPrice: string; category: string; tags: string;
  publishDate: string; archiveDate: string;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  licenseType: "RIGHTS_MANAGED" | "ROYALTY_FREE" | "EDITORIAL" | "PERSONAL" | "COMMERCIAL";
  publicContactEmail: string; publicContactWebsite: string;
  seoTitle: string; seoDescription: string; keywords: string;
  copyrightOwner: string; views: string; likes: string;
  country: string; city: string; location: string;
}

const emptyForm: EditForm = { title:"",subtitle:"",description:"",story:"",displayPrice:"",category:"",tags:"",publishDate:"",archiveDate:"",status:"DRAFT",licenseType:"RIGHTS_MANAGED",publicContactEmail:"",publicContactWebsite:"",seoTitle:"",seoDescription:"",keywords:"",copyrightOwner:"",views:"0",likes:"0",country:"",city:"",location:"" };

export default function AdminAssetEditPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const response = await fetch(`/api/admin/assets/${id}`);
        const body = await response.json();
        if (!response.ok) throw new Error(body.error || "Không thể tải thông tin tài sản");
        const asset = body.data;
        setForm({
          title: asset.title || "", subtitle: asset.subtitle || "", description: asset.description || "", story: asset.story || "",
          displayPrice: String(asset.displayPrice || "").replace(/[$,\s]/g, ""), category: asset.category?.name || "", tags: asset.keywords || "",
          publishDate: asset.publishDate ? new Date(asset.publishDate).toISOString().slice(0, 10) : "",
          archiveDate: asset.createdAt ? new Date(asset.createdAt).toISOString().slice(0, 10) : "",
          status: asset.status || "DRAFT", licenseType: asset.licenseType || "RIGHTS_MANAGED",
          publicContactEmail: asset.publicContactEmail || "", publicContactWebsite: asset.publicContactWebsite || "",
          seoTitle: asset.seoTitle || "", seoDescription: asset.seoDescription || "", keywords: asset.keywords || "",
          copyrightOwner: asset.rightsHolders?.find((holder: { role: string }) => holder.role === "COPYRIGHT_OWNER")?.name || "",
          views: String(asset.views ?? 0), likes: String(asset.likes ?? 0),
          country: asset.country || "", city: asset.city || "", location: asset.location || "",
        });
      } catch (loadError) { setError(loadError instanceof Error ? loadError.message : "Không thể tải thông tin tài sản"); }
      finally { setLoading(false); }
    };
    void load();
  }, [id]);

  const change = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setForm(current => ({ ...current, [event.target.name]: event.target.value }));
  const submit = async (event: React.FormEvent) => {
    event.preventDefault(); setSaving(true); setError("");
    try {
      const payload = Object.fromEntries(Object.entries(form).map(([key,value]) => [
        key,
        key === "views" || key === "likes"
          ? Number(value)
          : key === "publishDate" || key === "archiveDate"
          ? (value ? new Date(`${value}T00:00:00.000Z`).toISOString() : null)
          : value.trim() || (key === "title" || key === "status" || key === "licenseType" ? value : null),
      ]));
      const response = await fetch(`/api/admin/assets/${id}`, { method:"PUT", headers:{"Content-Type":"application/json"}, body:JSON.stringify(payload) });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "Không thể lưu tài sản");
      router.push("/admin/assets"); router.refresh();
    } catch (saveError) { setError(saveError instanceof Error ? saveError.message : "Không thể lưu tài sản"); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="grid min-h-96 place-items-center"><LoaderCircle className="animate-spin text-muted"/></div>;
  return <div className="max-w-4xl p-6"><div className="mb-8 flex items-center gap-3"><Link href="/admin/assets" className="rounded-md p-2 hover:bg-border-light"><ChevronLeft size={18}/></Link><div><h1 className="text-3xl font-bold">Chỉnh sửa tài sản</h1><p className="mt-1 text-sm text-secondary">Cập nhật metadata và trạng thái xuất bản.</p></div></div>
    {error && <div role="alert" className="mb-5 flex gap-2 rounded-md border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-600"><AlertCircle size={17}/>{error}</div>}
    <form onSubmit={submit} className="space-y-8">
      <section className="grid gap-5 rounded-lg border border-border bg-surface p-6"><h2 className="text-lg font-bold">Nội dung</h2><Field label="Tiêu đề" name="title" value={form.title} onChange={change} required/><Field label="Phụ đề" name="subtitle" value={form.subtitle} onChange={change}/><TextArea label="Mô tả" name="description" value={form.description} onChange={change}/><TextArea label="Câu chuyện" name="story" value={form.story} onChange={change} rows={6}/><Field label="Giá (USD)" name="displayPrice" type="number" min="0" step="0.01" prefix="$" value={form.displayPrice} onChange={change}/></section>
      <section className="grid gap-5 rounded-lg border border-border bg-surface p-6 md:grid-cols-2"><h2 className="col-span-full text-lg font-bold">Phân loại</h2><Select label="Danh mục" name="category" value={form.category} onChange={change} options={[["","Chọn danh mục"],...DEMO_CATEGORIES.map(item=>[item.name,getCategoryLabelVi(item.name)])]}/><Field label="Thẻ (phân cách bằng dấu phẩy)" name="tags" value={form.tags} onChange={change}/></section>
      <section className="grid gap-5 rounded-lg border border-border bg-surface p-6 md:grid-cols-2"><h2 className="col-span-full text-lg font-bold">Địa điểm đăng tải</h2><Field label="Quốc gia" name="country" value={form.country} onChange={change}/><Field label="Thành phố / khu vực" name="city" value={form.city} onChange={change}/><div className="md:col-span-2"><Field label="Địa điểm cụ thể" name="location" value={form.location} onChange={change}/></div></section>
      <section className="grid gap-5 rounded-lg border border-border bg-surface p-6 md:grid-cols-2"><h2 className="col-span-full text-lg font-bold">Xuất bản và bản quyền</h2><Select label="Trạng thái" name="status" value={form.status} onChange={change} options={[["DRAFT","Bản nháp"],["PUBLISHED","Đã xuất bản"],["ARCHIVED","Đã lưu trữ"]]}/><Field label="Ngày xuất bản" name="publishDate" type="date" value={form.publishDate} onChange={change}/><Field label="Ngày lưu trữ" name="archiveDate" type="date" value={form.archiveDate} onChange={change} required/><Select label="Giấy phép" name="licenseType" value={form.licenseType} onChange={change} options={[["RIGHTS_MANAGED","Quản lý quyền"],["ROYALTY_FREE","Miễn phí bản quyền"],["EDITORIAL","Biên tập"],["PERSONAL","Cá nhân"],["COMMERCIAL","Thương mại"]]}/><Field label="Chủ sở hữu bản quyền" name="copyrightOwner" value={form.copyrightOwner} onChange={change} required/><Field label="Email liên hệ công khai" name="publicContactEmail" type="email" value={form.publicContactEmail} onChange={change}/><Field label="Website công khai" name="publicContactWebsite" type="url" value={form.publicContactWebsite} onChange={change}/></section>
      <section className="grid gap-5 rounded-lg border border-border bg-surface p-6 md:grid-cols-2"><h2 className="col-span-full text-lg font-bold">Thống kê</h2><Field label="Lượt xem" name="views" type="number" min="0" value={form.views} onChange={change} required/><Field label="Lượt thích" name="likes" type="number" min="0" value={form.likes} onChange={change} required/></section>
      <section className="grid gap-5 rounded-lg border border-border bg-surface p-6"><h2 className="text-lg font-bold">Tìm kiếm và SEO</h2><Field label="Từ khóa" name="keywords" value={form.keywords} onChange={change}/><Field label="Tiêu đề SEO" name="seoTitle" value={form.seoTitle} onChange={change}/><TextArea label="Mô tả SEO" name="seoDescription" value={form.seoDescription} onChange={change} rows={3}/></section>
      <div className="flex justify-end gap-3 border-t border-border pt-6"><Link href="/admin/assets" className="rounded-md border border-border px-5 py-2.5 text-sm font-semibold text-primary no-underline">Hủy</Link><button disabled={saving} className="inline-flex items-center gap-2 rounded-md bg-burnt-orange px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50">{saving?<LoaderCircle size={16} className="animate-spin"/>:<Save size={16}/>}Lưu thay đổi</button></div>
    </form>
  </div>;
}

type ChangeHandler = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
function Field({label,name,value,onChange,type="text",required=false,min,step,prefix}:{label:string;name:string;value:string;onChange:ChangeHandler;type?:string;required?:boolean;min?:string;step?:string;prefix?:string}){return <label className="grid gap-2 text-sm font-semibold">{label}<span className="flex overflow-hidden rounded-md border border-border bg-bg focus-within:ring-2 focus-within:ring-burnt-orange/40">{prefix&&<span className="grid place-items-center border-r border-border px-3 font-semibold text-secondary">{prefix}</span>}<input name={name} type={type} min={min} step={step} value={value} onChange={onChange} required={required} className="min-w-0 flex-1 bg-transparent px-4 py-2.5 font-normal outline-none"/></span></label>}
function TextArea({label,name,value,onChange,rows=4}:{label:string;name:string;value:string;onChange:ChangeHandler;rows?:number}){return <label className="grid gap-2 text-sm font-semibold">{label}<textarea name={name} value={value} onChange={onChange} rows={rows} className="resize-y rounded-md border border-border bg-bg px-4 py-2.5 font-normal outline-none focus:ring-2 focus:ring-burnt-orange/40"/></label>}
function Select({label,name,value,onChange,options}:{label:string;name:string;value:string;onChange:ChangeHandler;options:string[][]}){return <label className="grid gap-2 text-sm font-semibold">{label}<select name={name} value={value} onChange={onChange} className="rounded-md border border-border bg-bg px-4 py-2.5 font-normal outline-none focus:ring-2 focus:ring-burnt-orange/40">{options.map(([option,label])=><option key={option} value={option}>{label}</option>)}</select></label>}
