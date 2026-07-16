"use client";

import { useState } from "react";
import { Save } from "lucide-react";
import { SITE } from "@/lib/constants";

export default function AdminSettingsPage() {
  const [formData, setFormData] = useState({
    siteName: SITE.name,
    copyrightOwner: SITE.copyrightOwner,
    siteDescription: SITE.description,
    email: SITE.email,
  });
  const [notice, setNotice] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setNotice(true);
  };

  return (
    <div className="p-6 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-primary mb-1">Cài đặt</h1>
        <p className="text-secondary text-sm">Cấu hình thông tin kho lưu trữ</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Site Name */}
        <div>
          <label htmlFor="siteName" className="block text-sm font-semibold text-primary mb-2">
            Tên website
          </label>
          <input
            id="siteName"
            name="siteName"
            type="text"
            value={formData.siteName}
            onChange={handleChange}
            className="w-full px-4 py-2.5 rounded-md border border-border bg-surface text-primary focus:outline-none focus:ring-2 focus:ring-burnt-orange/50 transition-ring"
          />
        </div>

        {/* Copyright Owner */}
        <div>
          <label htmlFor="copyrightOwner" className="block text-sm font-semibold text-primary mb-2">
            Chủ sở hữu bản quyền mặc định
          </label>
          <input
            id="copyrightOwner"
            name="copyrightOwner"
            type="text"
            value={formData.copyrightOwner}
            onChange={handleChange}
            className="w-full px-4 py-2.5 rounded-md border border-border bg-surface text-primary focus:outline-none focus:ring-2 focus:ring-burnt-orange/50 transition-ring"
          />
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-semibold text-primary mb-2">
            Email liên hệ
          </label>
          <input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-4 py-2.5 rounded-md border border-border bg-surface text-primary focus:outline-none focus:ring-2 focus:ring-burnt-orange/50 transition-ring"
          />
        </div>

        {/* Description */}
        <div>
          <label htmlFor="siteDescription" className="block text-sm font-semibold text-primary mb-2">
            Mô tả website
          </label>
          <textarea
            id="siteDescription"
            name="siteDescription"
            rows={5}
            value={formData.siteDescription}
            onChange={handleChange}
            className="w-full px-4 py-2.5 rounded-md border border-border bg-surface text-primary focus:outline-none focus:ring-2 focus:ring-burnt-orange/50 transition-ring resize-none"
          />
        </div>

        {/* Save Status */}
        {notice && (
          <div role="status" className="p-3 rounded-md bg-copper/10 border border-copper/20 text-sm text-secondary">
            Cài đặt hiện được quản lý bằng biến môi trường cho đến khi chức năng lưu vào cơ sở dữ liệu được bật.
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-md bg-burnt-orange text-white text-sm font-semibold hover:opacity-90 transition-opacity"
        >
          <Save size={16} />
          Lưu cài đặt
        </button>
      </form>
    </div>
  );
}
