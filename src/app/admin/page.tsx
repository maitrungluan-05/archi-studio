"use client";

import { useEffect, useState } from "react";
import { BarChart3, FileText, FolderOpen, Eye } from "lucide-react";
import { formatNumber } from "@/lib/utils";

interface Stats {
  totalAssets: number;
  totalCollections: number;
  totalViews: number;
  averageViews: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalAssets: 0,
    totalCollections: 0,
    totalViews: 0,
    averageViews: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/admin/stats");
        if (res.ok) {
          const response = await res.json();
          setStats(response.data);
        }
      } catch (err) {
        console.error("Không thể tải thống kê:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const cards = [
    {
      label: "Tổng tài sản",
      value: stats.totalAssets,
      icon: FileText,
      color: "burnt-orange",
    },
    {
      label: "Bộ sưu tập",
      value: stats.totalCollections,
      icon: FolderOpen,
      color: "olive-green",
    },
    {
      label: "Tổng lượt xem",
      value: stats.totalViews,
      icon: Eye,
      color: "copper",
    },
    {
      label: "Lượt xem trung bình",
      value: Math.round(stats.averageViews),
      icon: BarChart3,
      color: "slate-blue",
    },
  ];

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-primary mb-2">Tổng quan</h1>
        <p className="text-secondary">Chào mừng bạn đến trang quản trị ARCHI.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="rounded-lg border border-border bg-surface p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted font-medium mb-1">
                    {card.label}
                  </p>
                  <p className="text-3xl font-bold text-primary">
                    {loading ? "—" : formatNumber(card.value)}
                  </p>
                </div>
                <div
                  className={`w-12 h-12 rounded-lg flex items-center justify-center bg-${card.color}/10 text-${card.color}`}
                >
                  <Icon size={24} strokeWidth={1.5} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="mt-10">
        <h2 className="text-lg font-bold text-primary mb-4">Thao tác nhanh</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a
            href="/admin/assets/new"
            className="p-4 rounded-lg border border-border bg-surface hover:bg-burnt-orange/5 hover:border-burnt-orange/30 transition-colors no-underline"
          >
            <div className="text-sm font-semibold text-primary mb-1">
              Tải tài sản lên
            </div>
            <p className="text-xs text-secondary">
              Thêm ảnh hoặc video mới vào kho lưu trữ.
            </p>
          </a>
          <a
            href="/admin/collections/new"
            className="p-4 rounded-lg border border-border bg-surface hover:bg-olive-green/5 hover:border-olive-green/30 transition-colors no-underline"
          >
            <div className="text-sm font-semibold text-primary mb-1">
              Tạo bộ sưu tập
            </div>
            <p className="text-xs text-secondary">
              Tạo một nhóm tác phẩm được tuyển chọn.
            </p>
          </a>
          <a
            href="/admin/settings"
            className="p-4 rounded-lg border border-border bg-surface hover:bg-copper/5 hover:border-copper/30 transition-colors no-underline"
          >
            <div className="text-sm font-semibold text-primary mb-1">
              Cài đặt website
            </div>
            <p className="text-xs text-secondary">
              Cấu hình thông tin kho lưu trữ.
            </p>
          </a>
        </div>
      </div>
    </div>
  );
}
