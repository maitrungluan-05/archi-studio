"use client";

import Link from "next/link";
import { ExternalLink, Plus } from "lucide-react";
import { DEMO_COLLECTIONS } from "@/lib/mock-data";

export default function AdminCollectionsPage() {
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-primary mb-1">Bộ sưu tập</h1>
          <p className="text-secondary text-sm">
            Quản lý {DEMO_COLLECTIONS.length} bộ sưu tập tuyển chọn
          </p>
        </div>
        <Link
          href="/admin/collections/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md bg-olive-green text-white text-sm font-semibold hover:opacity-90 transition-opacity no-underline"
        >
          <Plus size={18} />
          Tạo bộ sưu tập
        </Link>
      </div>

      {/* Collections Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {DEMO_COLLECTIONS.map((collection) => (
          <div
            key={collection.slug}
            className="rounded-lg border border-border bg-surface p-4 hover:shadow-md transition-shadow"
          >
            <h3 className="text-lg font-semibold text-primary mb-1">
              {collection.name}
            </h3>
            <p className="text-sm text-secondary mb-3 line-clamp-2">
              {collection.description}
            </p>
            <p className="text-xs text-muted mb-4">
              {collection.count} tác phẩm
            </p>
            <Link href={`/collections/${collection.slug}`} className="inline-flex items-center gap-2 border-b border-border pb-1 text-sm font-medium text-secondary no-underline hover:border-primary hover:text-primary">
              <ExternalLink size={14} /> Xem bộ sưu tập
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
