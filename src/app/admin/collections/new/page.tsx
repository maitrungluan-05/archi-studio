"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AlertCircle, ChevronLeft, LoaderCircle } from "lucide-react";

export default function AdminCollectionNewPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/admin/collections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.error || "Không thể tạo bộ sưu tập.");
      }
      router.push("/admin/collections");
      router.refresh();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Không thể tạo bộ sưu tập.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl">
      <div className="flex items-center gap-2 mb-8">
        <Link href="/admin/collections" className="p-2 hover:bg-border-light rounded-md transition-colors">
          <ChevronLeft size={18} className="text-muted" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-primary">Tạo bộ sưu tập</h1>
          <p className="text-secondary text-sm mt-1">Tạo một nhóm tác phẩm được tuyển chọn</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-semibold text-primary mb-2">
            Tên bộ sưu tập
          </label>
          <input
            id="name"
            name="name"
            type="text"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full px-4 py-2.5 rounded-md border border-border bg-surface text-primary focus:outline-none focus:ring-2 focus:ring-olive-green/50"
          />
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-semibold text-primary mb-2">
            Mô tả
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={5}
            className="w-full px-4 py-2.5 rounded-md border border-border bg-surface text-primary focus:outline-none focus:ring-2 focus:ring-olive-green/50 resize-none"
          />
        </div>

        {/* Actions */}
        {error && <div role="alert" className="flex items-start gap-2 rounded-md border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-600"><AlertCircle className="mt-0.5 shrink-0" size={16} />{error}</div>}
        <div className="flex gap-3 pt-6 border-t border-border">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex-1 px-4 py-2.5 rounded-md border border-border text-primary font-semibold hover:bg-border-light transition-colors"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-4 py-2.5 rounded-md bg-olive-green text-white font-semibold hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            {loading ? <span className="inline-flex items-center gap-2"><LoaderCircle size={16} className="animate-spin" />Đang tạo</span> : "Tạo bộ sưu tập"}
          </button>
        </div>
      </form>
    </div>
  );
}
