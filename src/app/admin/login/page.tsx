"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Eye, EyeOff, LoaderCircle } from "lucide-react";
import { SITE } from "@/lib/constants";
import { BrandMark } from "@/components/brand-logo";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    void fetch("/api/admin/auth-check", { cache: "no-store" }).then((response) => {
      if (response.ok) router.replace("/admin");
    });
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setNotice("");
    setLoading(true);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, rememberMe }),
      });

      if (res.ok) {
        router.push("/admin");
      } else {
        const data = await res.json();
        setError(data.error || "Email hoặc mật khẩu không đúng");
      }
    } catch {
      setError("Đã xảy ra lỗi. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-shell min-h-screen flex items-center justify-center p-5 sm:p-8">
      <main className="w-full max-w-md">
        {/* Logo Section */}
        <div className="text-center mb-8">
          <BrandMark className="login-mark mx-auto mb-5 h-14 w-14 text-burnt-orange shadow-lg" />
          <h1 className="text-3xl font-bold !text-white mb-2">{SITE.name}</h1>
          <p className="text-sm text-white/65">Quản trị kho lưu trữ an toàn</p>
        </div>

        {/* Card */}
        <div className="rounded-lg border border-white/20 bg-surface/80 backdrop-blur-xl p-6 sm:p-8 shadow-2xl">
          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-primary mb-2">
                Địa chỉ email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-3 rounded-lg border border-border bg-bg/50 text-primary placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-burnt-orange/50 focus:border-burnt-orange/30 transition-all"
                required
                autoComplete="email"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="password" className="block text-sm font-medium text-primary">
                  Mật khẩu
                </label>
                <button type="button" onClick={() => setNotice("Chức năng khôi phục mật khẩu chưa được cấu hình. Vui lòng liên hệ quản trị viên.")} className="text-xs font-medium text-burnt-orange transition-opacity hover:opacity-75">Quên mật khẩu?</button>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-lg border border-border bg-bg/50 text-primary placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-burnt-orange/50 focus:border-burnt-orange/30 transition-all"
                  required
                  minLength={8}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-primary transition-colors p-1"
                  aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center">
              <input
                id="remember"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border border-border bg-bg/50 text-burnt-orange focus:ring-2 focus:ring-burnt-orange/50 cursor-pointer"
              />
              <label htmlFor="remember" className="ml-2.5 text-sm text-secondary cursor-pointer select-none">
                Ghi nhớ đăng nhập
              </label>
            </div>

            {/* Error Message */}
            {error && (
              <div role="alert" aria-live="polite" className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-sm text-red-600 flex items-start gap-3">
                <AlertCircle size={18} aria-hidden="true" />
                <span>{error}</span>
              </div>
            )}

            {notice && <p role="status" className="rounded-md border border-border bg-bg/70 p-3 text-xs leading-5 text-secondary">{notice}</p>}

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-3 rounded-lg bg-burnt-orange text-white text-sm font-semibold hover:bg-burnt-orange/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors mt-6"
            >
              {loading ? <span className="inline-flex items-center gap-2"><LoaderCircle className="animate-spin" size={17} />Đang đăng nhập</span> : "Đăng nhập"}
            </button>
          </form>

        </div>

        {/* Footer */}
        <div className="mt-10 text-center text-xs text-white/55">
          <p>© 2015 {SITE.name}. All rights reserved.</p>
        </div>
      </main>
    </div>
  );
}
