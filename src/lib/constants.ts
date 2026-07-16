export const SITE = {
  name: "ARCHI",
  tagline: "Digital Copyright Archive",
  description:
    "Official digital archive of original photographs and videos. Every asset is an original copyrighted work, professionally archived and permanently protected.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  copyrightOwner: process.env.NEXT_PUBLIC_COPYRIGHT_OWNER || "ARCHI",
  copyrightYear: 2015,
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL || "archive@example.com",
} as const;

export const NAV_LINKS = [
  { label: "Explore", href: "/explore" },
  { label: "Images", href: "/images" },
  { label: "Videos", href: "/videos" },
  { label: "Collections", href: "/collections" },
  { label: "Categories", href: "/categories" },
] as const;

export const FOOTER_LINKS = {
  archive: [
    { label: "Explore", href: "/explore" },
    { label: "Images", href: "/images" },
    { label: "Videos", href: "/videos" },
    { label: "Collections", href: "/collections" },
    { label: "Categories", href: "/categories" },
  ],
  legal: [
    { label: "About", href: "/about" },
    { label: "License", href: "/license" },
    { label: "Copyright", href: "/copyright" },
    { label: "DMCA", href: "/dmca" },
    { label: "Terms of Use", href: "/terms" },
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Contact", href: "/contact" },
  ],
} as const;

export const LICENSE_TYPES = {
  RIGHTS_MANAGED: "Rights Managed",
  ROYALTY_FREE: "Royalty Free",
  EDITORIAL: "Editorial Use Only",
  PERSONAL: "Personal Use",
  COMMERCIAL: "Commercial License",
} as const;

export const CATEGORY_LABELS_VI: Record<string, string> = {
  Portraits: "Chân dung",
  Architecture: "Kiến trúc",
  Landscapes: "Phong cảnh",
  Street: "Đường phố",
  Urban: "Đô thị",
  Documentary: "Tư liệu",
  "Fine Art": "Mỹ thuật",
  Travel: "Du lịch",
  Wildlife: "Động vật hoang dã",
  Macro: "Cận cảnh",
  "Food & Culture": "Ẩm thực và văn hóa",
  Drone: "Ảnh trên cao",
  Uncategorized: "Chưa phân loại",
};

export function getCategoryLabelVi(category: string): string {
  return CATEGORY_LABELS_VI[category] ?? category;
}
