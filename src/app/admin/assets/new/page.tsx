"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AlertCircle, CheckCircle2, ChevronLeft, LoaderCircle, Upload } from "lucide-react";
import { DEMO_CATEGORIES } from "@/lib/mock-data";
import { getCategoryLabelVi } from "@/lib/constants";
import { uploadToCloudinary } from "@/lib/cloudinary-client";

const initialForm = {
  title:"", subtitle:"", description:"", story:"", category:"", tags:"", displayPrice:"",
  licenseType:"RIGHTS_MANAGED", status:"PUBLISHED", publishDate:new Date().toISOString().slice(0,10), archiveDate:new Date().toISOString().slice(0,10),
  copyrightOwner:"", publicContactEmail:"", publicContactWebsite:"", views:"0", likes:"0",
  seoTitle:"", seoDescription:"", country:"", city:"", location:"",
};

export default function AdminAssetNewPage() {
  const router=useRouter();
  const [form,setForm]=useState(initialForm);
  const [file,setFile]=useState<File|null>(null);
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState("");
  const change=(event:React.ChangeEvent<HTMLInputElement|HTMLTextAreaElement|HTMLSelectElement>)=>setForm(current=>({...current,[event.target.name]:event.target.value}));

  const submit=async(event:React.FormEvent)=>{
    event.preventDefault(); setError("");
    if(!file){setError("Vui lòng chọn ảnh hoặc video.");return;}
    setLoading(true);
    try{
      const uploaded=await uploadToCloudinary(file,"archi/assets");
      const payload=new FormData(); payload.set("remoteMedia",JSON.stringify(uploaded));
      Object.entries(form).forEach(([key,value])=>payload.set(key,value));
      const response=await fetch("/api/admin/assets",{method:"POST",body:payload});
      const body=await response.json().catch(()=>null);
      if(!response.ok)throw new Error(body?.error||"Không thể tải tài sản lên.");
      router.push("/admin/assets"); router.refresh();
    }catch(uploadError){setError(uploadError instanceof Error?uploadError.message:"Không thể tải tài sản lên.");}
    finally{setLoading(false);}
  };

  return <div className="max-w-4xl p-6"><div className="mb-8 flex items-center gap-3"><Link href="/admin/assets" className="rounded-md p-2 hover:bg-border-light"><ChevronLeft size={18}/></Link><div><h1 className="text-3xl font-bold">Tải tài sản lên</h1><p className="mt-1 text-sm text-secondary">Tạo hồ sơ đầy đủ cho ảnh hoặc video ngay khi tải lên.</p></div></div>
    {error&&<div role="alert" className="mb-5 flex gap-2 rounded-md border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-600"><AlertCircle size={17}/>{error}</div>}
    <form onSubmit={submit} className="space-y-8">
      <section className="rounded-lg border border-border bg-surface p-6"><h2 className="mb-4 text-lg font-bold">Tệp nội dung</h2><label htmlFor="file" className="block cursor-pointer rounded-lg border-2 border-dashed border-border p-8 text-center hover:border-burnt-orange/50"><Upload size={32} className="mx-auto mb-2 text-muted"/><p className="text-sm font-medium">{file?file.name:"Chọn ảnh hoặc video"}</p><p className="mt-1 text-xs text-muted">Tệp được tải trực tiếp lên Cloudinary · JPEG, PNG, WebP, MP4 hoặc WebM</p>{file&&<span className="mt-3 inline-flex items-center gap-1 text-xs text-olive-green"><CheckCircle2 size={13}/>{(file.size/1024/1024).toFixed(1)} MB</span>}<input id="file" type="file" accept="image/jpeg,image/png,image/webp,video/mp4,video/webm" className="sr-only" onChange={event=>setFile(event.target.files?.[0]??null)} required/></label></section>
      <section className="grid gap-5 rounded-lg border border-border bg-surface p-6"><h2 className="text-lg font-bold">Nội dung</h2><Field label="Tiêu đề" name="title" value={form.title} onChange={change} required/><Field label="Phụ đề" name="subtitle" value={form.subtitle} onChange={change}/><TextArea label="Mô tả" name="description" value={form.description} onChange={change}/><TextArea label="Câu chuyện" name="story" value={form.story} onChange={change} rows={6}/><Field label="Giá (USD)" name="displayPrice" type="number" min="0" step="0.01" prefix="$" value={form.displayPrice} onChange={change}/></section>
      <section className="grid gap-5 rounded-lg border border-border bg-surface p-6 md:grid-cols-2"><h2 className="col-span-full text-lg font-bold">Phân loại</h2><Select label="Danh mục" name="category" value={form.category} onChange={change} options={[["","Chọn danh mục"],...DEMO_CATEGORIES.map(item=>[item.name,getCategoryLabelVi(item.name)])]}/><Field label="Thẻ (phân cách bằng dấu phẩy)" name="tags" value={form.tags} onChange={change}/></section>
      <section className="grid gap-5 rounded-lg border border-border bg-surface p-6 md:grid-cols-2"><h2 className="col-span-full text-lg font-bold">Địa điểm đăng tải</h2><Field label="Quốc gia" name="country" value={form.country} onChange={change}/><Field label="Thành phố / khu vực" name="city" value={form.city} onChange={change}/><div className="md:col-span-2"><Field label="Địa điểm cụ thể" name="location" value={form.location} onChange={change}/></div></section>
      <section className="grid gap-5 rounded-lg border border-border bg-surface p-6 md:grid-cols-2"><h2 className="col-span-full text-lg font-bold">Xuất bản và bản quyền</h2><Select label="Trạng thái" name="status" value={form.status} onChange={change} options={[["PUBLISHED","Đã xuất bản"],["DRAFT","Bản nháp"]]}/><Field label="Ngày xuất bản" name="publishDate" type="date" value={form.publishDate} onChange={change} required={form.status==="PUBLISHED"}/><Field label="Ngày lưu trữ" name="archiveDate" type="date" value={form.archiveDate} onChange={change} required/><Select label="Giấy phép" name="licenseType" value={form.licenseType} onChange={change} options={[["RIGHTS_MANAGED","Quản lý quyền"],["ROYALTY_FREE","Miễn phí bản quyền"],["EDITORIAL","Biên tập"],["PERSONAL","Cá nhân"],["COMMERCIAL","Thương mại"]]}/><Field label="Tên chủ sở hữu bản quyền" name="copyrightOwner" value={form.copyrightOwner} onChange={change} required/><Field label="Email liên hệ công khai" name="publicContactEmail" type="email" value={form.publicContactEmail} onChange={change}/><Field label="Website công khai" name="publicContactWebsite" type="url" value={form.publicContactWebsite} onChange={change}/></section>
      <section className="grid gap-5 rounded-lg border border-border bg-surface p-6 md:grid-cols-2"><h2 className="col-span-full text-lg font-bold">Thống kê</h2><Field label="Lượt xem" name="views" type="number" min="0" value={form.views} onChange={change} required/><Field label="Lượt thích" name="likes" type="number" min="0" value={form.likes} onChange={change} required/></section>
      <section className="grid gap-5 rounded-lg border border-border bg-surface p-6"><h2 className="text-lg font-bold">Tìm kiếm và SEO</h2><Field label="Tiêu đề SEO" name="seoTitle" value={form.seoTitle} onChange={change}/><TextArea label="Mô tả SEO" name="seoDescription" value={form.seoDescription} onChange={change} rows={3}/></section>
      <div className="flex justify-end gap-3 border-t border-border pt-6"><button type="button" onClick={()=>router.back()} className="rounded-md border border-border px-5 py-2.5 text-sm font-semibold">Hủy</button><button disabled={loading} className="inline-flex items-center gap-2 rounded-md bg-burnt-orange px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50">{loading?<LoaderCircle size={16} className="animate-spin"/>:<Upload size={16}/>}Tải lên và lưu</button></div>
    </form>
  </div>;
}

type ChangeHandler=(event:React.ChangeEvent<HTMLInputElement|HTMLTextAreaElement|HTMLSelectElement>)=>void;
function Field({label,name,value,onChange,type="text",required=false,min,step,prefix}:{label:string;name:string;value:string;onChange:ChangeHandler;type?:string;required?:boolean;min?:string;step?:string;prefix?:string}){return <label className="grid gap-2 text-sm font-semibold">{label}<span className="flex overflow-hidden rounded-md border border-border bg-bg focus-within:ring-2 focus-within:ring-burnt-orange/40">{prefix&&<span className="grid place-items-center border-r border-border px-3 font-semibold text-secondary">{prefix}</span>}<input name={name} type={type} min={min} step={step} value={value} onChange={onChange} required={required} className="min-w-0 flex-1 bg-transparent px-4 py-2.5 font-normal outline-none"/></span></label>}
function TextArea({label,name,value,onChange,rows=4}:{label:string;name:string;value:string;onChange:ChangeHandler;rows?:number}){return <label className="grid gap-2 text-sm font-semibold">{label}<textarea name={name} value={value} onChange={onChange} rows={rows} className="resize-y rounded-md border border-border bg-bg px-4 py-2.5 font-normal outline-none focus:ring-2 focus:ring-burnt-orange/40"/></label>}
function Select({label,name,value,onChange,options}:{label:string;name:string;value:string;onChange:ChangeHandler;options:string[][]}){return <label className="grid gap-2 text-sm font-semibold">{label}<select name={name} value={value} onChange={onChange} className="rounded-md border border-border bg-bg px-4 py-2.5 font-normal outline-none focus:ring-2 focus:ring-burnt-orange/40">{options.map(([option,text])=><option key={option} value={option}>{text}</option>)}</select></label>}
