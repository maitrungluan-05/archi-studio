import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { StoryForm } from "@/components/admin/story-form";

export default function NewStoryPage() {
  return <div className="mx-auto max-w-5xl p-6"><header className="mb-7"><Link href="/admin/stories" className="mb-4 inline-flex items-center gap-1 text-sm text-secondary no-underline"><ChevronLeft size={16}/>Bài nhiều ảnh</Link><h1 className="text-3xl font-bold">Tạo bài nhiều ảnh</h1><p className="mt-1 text-sm text-secondary">Một đường dẫn, tối đa 25 ảnh theo thứ tự.</p></header><StoryForm/></div>;
}
