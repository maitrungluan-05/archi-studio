"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Search, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const links = [
  ["Home", "/"], ["Explore", "/explore"], ["Rooms", "/categories"],
  ["Collections", "/collections"], ["Stories", "/stories"], ["Film", "/videos"], ["About", "/about"],
] as const;

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const scrolledRef = useRef(false);
  useEffect(() => {
    const onScroll = () => {
      const nextScrolled = window.scrollY > 16;
      if (scrolledRef.current === nextScrolled) return;
      scrolledRef.current = nextScrolled;
      setScrolled(nextScrolled);
    };
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false);
    onScroll(); window.addEventListener("scroll", onScroll, { passive: true }); window.addEventListener("keydown", onKey);
    return () => { window.removeEventListener("scroll", onScroll); window.removeEventListener("keydown", onKey); };
  }, []);
  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/admin/auth-check", { signal: controller.signal, cache: "no-store" })
      .then((response) => setAuthenticated(response.ok))
      .catch(() => setAuthenticated(false));
    return () => controller.abort();
  }, [pathname]);
  if (pathname.startsWith("/admin")) return null;
  const active = (href: string) => href === "/" ? pathname === "/" : pathname.startsWith(href);
  return (
    <header className={`site-header ${scrolled ? "is-scrolled" : ""}`}>
      <div className="site-header__bar container-wide">
        <Link href="/" className="site-wordmark" aria-label="ARCHI home"><strong>ARCHI</strong><span>Visual Archive / 2015</span></Link>
        <nav className="site-nav" aria-label="Primary navigation">
          {links.map(([label, href]) => <Link key={href} href={href} className={active(href) ? "active" : ""} aria-current={active(href) ? "page" : undefined}>{label}</Link>)}
          <Link href={authenticated ? "/admin" : "/admin/login"}>{authenticated ? "Quản trị" : "Login"}</Link>
        </nav>
        <div className="site-tools">
          <Link href="/search" className="search-trigger"><Search size={17} /><span>Research archive</span></Link>
          <button className="menu-trigger" onClick={() => setOpen(!open)} aria-expanded={open} aria-controls="mobile-menu" aria-label={open ? "Close menu" : "Open menu"}>{open ? <X /> : <Menu />}</button>
        </div>
      </div>
      {open && <nav id="mobile-menu" className="mobile-menu" aria-label="Mobile navigation">{links.map(([label, href], i) => <Link key={href} href={href} onClick={() => setOpen(false)}><span>0{i + 1}</span>{label}</Link>)}<Link href={authenticated ? "/admin" : "/admin/login"} onClick={() => setOpen(false)}><span>07</span>{authenticated ? "Quản trị" : "Đăng nhập"}</Link><Link href="/search" onClick={() => setOpen(false)}><span>08</span>Search</Link></nav>}
    </header>
  );
}
