"use client";
import Link from "next/link";
import { use, useEffect, useState } from "react";
import { ChevronLeft, LoaderCircle } from "lucide-react";
import { StoryForm } from "@/components/admin/story-form";

export default function EditStoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params); const [story,setStory]=useState<Parameters<typeof StoryForm>[0]["initial"]>(); const [error,setError]=useState("");
  useEffect(()=>{const controller=new AbortController();fetch(`/api/admin/stories/${id}`,{signal:controller.signal}).then(async r=>{const b=await r.json();if(!r.ok)throw new Error(b.error);setStory(b.data)}).catch(e=>{if(e.name!=="AbortError")setError(e.message)});return()=>controller.abort()},[id]);
  return <div className="mx-auto max-w-5xl p-6"><Link href="/admin/stories" className="mb-4 inline-flex items-center gap-1 text-sm text-secondary no-underline"><ChevronLeft size={16}/>Bài nhiều ảnh</Link><h1 className="mb-7 text-3xl font-bold">Chỉnh sửa bài viết</h1>{error?<p className="text-red-600">{error}</p>:story?<StoryForm initial={story}/>:<LoaderCircle className="animate-spin text-muted"/>}</div>;
}
