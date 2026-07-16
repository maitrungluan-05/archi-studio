"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { usePathname } from "next/navigation";
import { SITE } from "@/lib/constants";

export function Footer() {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) return null;
  return <footer className="site-footer">
    <div className="container-wide site-footer__lead">
      <p>ARCHI / INDEPENDENT VISUAL INSTITUTION</p>
      <Link href="/contact">Begin a conversation <ArrowUpRight size={24} /></Link>
    </div>
    <div className="container-wide site-footer__grid">
      <div><div className="footer-mark">ARCHI</div><p>Photography and moving image preserved as evidence, memory, and authored work.</p></div>
      <nav><strong>Visit</strong><Link href="/">Home</Link><Link href="/explore">Explore</Link><Link href="/categories">Museum rooms</Link><Link href="/collections">Collections</Link></nav>
      <nav><strong>Institution</strong><Link href="/about">About</Link><Link href="/contact">Contact</Link><Link href="/license">Licensing</Link><a href={`mailto:${SITE.email}`}>{SITE.email}</a></nav>
      <nav><strong>Legal</strong><Link href="/copyright">Copyright</Link><Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link><Link href="/dmca">DMCA</Link></nav>
    </div>
    <div className="container-wide site-footer__base"><span>Copyright 2015 ARCHI</span><span>Official digital archive</span><span>All works rights managed</span></div>
  </footer>;
}
