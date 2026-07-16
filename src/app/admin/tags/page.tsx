"use client";

import { useEffect, useState } from "react";
import { AlertCircle, LoaderCircle, Plus, Trash2 } from "lucide-react";

interface TagRecord { id: string; name: string; slug: string; usageCount: number }

export default function AdminTagsPage() {
  const [tags, setTags] = useState<TagRecord[]>([]);
  const [newTag, setNewTag] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadTags = async () => {
    const response = await fetch("/api/admin/tags?pageSize=100");
    if (!response.ok) throw new Error("Không thể tải danh sách thẻ.");
    const data = await response.json();
    setTags(data.data ?? []);
  };

  useEffect(() => {
    void fetch("/api/admin/tags?pageSize=100")
      .then((response) => {
        if (!response.ok) throw new Error("Không thể tải danh sách thẻ.");
        return response.json();
      })
      .then((data) => setTags(data.data ?? []))
      .catch((loadError: Error) => setError(loadError.message))
      .finally(() => setLoading(false));
  }, []);

  const handleAddTag = async () => {
    if (!newTag.trim()) return;
    setError("");
    const response = await fetch("/api/admin/tags", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: newTag }) });
    if (!response.ok) {
      const data = await response.json().catch(() => null);
      setError(data?.error || "Không thể tạo thẻ.");
      return;
    }
    setNewTag("");
    await loadTags();
  };

  const handleDeleteTag = async (tag: TagRecord) => {
    setError("");
    const response = await fetch(`/api/admin/tags/${tag.id}`, { method: "DELETE" });
    if (!response.ok) {
      const data = await response.json().catch(() => null);
      setError(data?.error || "Không thể xóa thẻ.");
      return;
    }
    await loadTags();
  };

  return (
    <div className="p-6 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-primary mb-1">Thẻ</h1>
        <p className="text-secondary text-sm">Quản lý thẻ trong kho lưu trữ ({tags.length})</p>
      </div>

      {/* Add Tag Form */}
      <div className="mb-8 p-6 rounded-lg border border-border bg-surface">
        <label htmlFor="newTag" className="block text-sm font-semibold text-primary mb-3">
          Thêm thẻ mới
        </label>
        <div className="flex gap-2">
          <input
            id="newTag"
            type="text"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); void handleAddTag(); } }}
            placeholder="Nhập tên thẻ..."
            className="flex-1 px-4 py-2.5 rounded-md border border-border bg-bg text-primary placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-olive-green/50 transition-ring"
          />
          <button
            onClick={() => void handleAddTag()}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md bg-olive-green text-white text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            <Plus size={16} />
            Thêm
          </button>
        </div>
      </div>

      {error && <div role="alert" className="mb-5 flex items-start gap-2 rounded-md border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-600"><AlertCircle className="mt-0.5" size={16} />{error}</div>}
      {loading && <div className="flex items-center gap-2 text-sm text-muted"><LoaderCircle className="animate-spin" size={16} />Đang tải thẻ</div>}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {tags.map((tag) => (
          <div
            key={tag.id}
            className="flex items-center justify-between px-4 py-3 rounded-md border border-border bg-surface hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-olive-green" />
              <span className="text-sm font-medium text-primary capitalize">{tag.name}</span>
            </div>
            <button
              onClick={() => void handleDeleteTag(tag)}
              className="p-1.5 hover:bg-red-500/10 rounded-md transition-colors"
              title="Xóa thẻ"
              aria-label={`Xóa ${tag.name}`}
            >
              <Trash2 size={14} className="text-muted hover:text-red-500" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
