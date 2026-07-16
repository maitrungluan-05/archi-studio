"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Menu, X, LogOut, Settings, FileText, FolderOpen, Tag, BarChart3 } from "lucide-react";
import { BrandLockup } from "@/components/brand-logo";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (pathname === "/admin/login") {
      return;
    }

    // Check authentication on mount
    const checkAuth = async () => {
      try {
        const res = await fetch("/api/admin/auth-check");
        if (res.ok) {
          setAuthenticated(true);
        } else {
          router.push("/admin/login");
        }
      } catch {
        router.push("/admin/login");
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [pathname, router]);

  if (pathname === "/admin/login") {
    return children;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-bg">
        <div className="animate-pulse">
          <div className="h-12 w-48 bg-border rounded-md mb-4" />
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-8 w-full bg-border rounded-md" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!authenticated) {
    return null;
  }

  const navItems = [
    { label: "Tổng quan", href: "/admin", icon: BarChart3 },
    { label: "Tài sản", href: "/admin/assets", icon: FileText },
    { label: "Bộ sưu tập", href: "/admin/collections", icon: FolderOpen },
    { label: "Thẻ", href: "/admin/tags", icon: Tag },
    { label: "Cài đặt", href: "/admin/settings", icon: Settings },
  ];

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
  };

  return (
    <div className="flex h-screen bg-bg overflow-hidden">
      {sidebarOpen && <button type="button" aria-label="Close navigation" onClick={() => setSidebarOpen(false)} className="fixed inset-0 z-30 bg-black/35 md:hidden" />}
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? "translate-x-0 md:w-64" : "-translate-x-full md:translate-x-0 md:w-20"
        } fixed inset-y-0 left-0 z-40 w-64 bg-surface border-r border-border transition-all duration-300 flex flex-col md:relative`}
      >
        {/* Logo */}
        <div className="p-4 border-b border-border">
          <Link
            href="/"
            className="flex items-center gap-2 no-underline hover:opacity-80 transition-opacity"
          >
            <BrandLockup compact={!sidebarOpen} />
          </Link>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors no-underline ${
                  isActive
                    ? "bg-burnt-orange text-white"
                    : "text-secondary hover:text-primary hover:bg-border-light"
                }`}
                title={item.label}
              >
                <Icon size={18} strokeWidth={1.5} />
                {sidebarOpen && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-border space-y-2">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-secondary hover:text-primary hover:bg-border-light transition-colors"
            title="Đăng xuất"
          >
            <LogOut size={18} strokeWidth={1.5} />
            {sidebarOpen && <span>Đăng xuất</span>}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <div className="h-16 border-b border-border bg-surface flex items-center px-6">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-border-light rounded-md transition-colors"
            aria-label={sidebarOpen ? "Collapse navigation" : "Open navigation"}
            aria-expanded={sidebarOpen}
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
