# ARCHI - Digital Copyright Archive

A digital copyright archive built with Next.js 16, TypeScript, Prisma, PostgreSQL, and Supabase Storage.

## Features

- Public image and film archive with search, categories, and curated collections
- Official record pages with provenance, rights holders, IDs, and licensing details
- Authenticated administration for assets and collections
- PostgreSQL persistence through Prisma and media storage through Supabase
- Responsive layouts, structured metadata, and optimized remote images

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Database**: Supabase PostgreSQL (optional)
- **Storage**: Supabase Storage for media files
- **Auth**: JWT-based admin authentication
- **Icons**: Lucide React
- **Forms**: React Hook Form + Zod

## Getting Started

### Prerequisites

- Node.js 20.19 or newer
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables (`.env.local`):
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_key
   SUPABASE_STORAGE_BUCKET=archive-media
   DATABASE_URL=your_postgres_url
   JWT_SECRET=your_jwt_secret
   ADMIN_EMAIL=your_admin_email
   ADMIN_PASSWORD_HASH=your_bcrypt_password_hash
   NEXT_PUBLIC_SITE_URL=https://your-domain.example
   ```

4. Start development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000)

The application does not ship with default credentials. Authentication fails closed until `JWT_SECRET`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD_HASH` are configured.

Public pages use editorial fixtures when no database is configured. Durable admin uploads require both `DATABASE_URL` and the Supabase variables above.

## Project Structure

```
src/
├── app/
│   ├── admin/            # Admin panel
│   ├── api/              # API routes
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Homepage
├── components/
│   ├── asset-card.tsx    # Asset display component
│   ├── header.tsx        # Navigation header
│   ├── footer.tsx        # Footer
│   └── theme-provider.tsx
├── lib/
│   ├── constants.ts
│   ├── utils.ts
│   ├── mock-data.ts
│   └── supabase.ts
└── prisma/
    └── schema.prisma
```

## Pages

### Public
- `/` — Homepage
- `/explore` — Browse archive
- `/categories` — Category browser
- `/collections` — Collections
- `/gallery/[slug]` — Asset detail
- `/search` — Search
- `/about` — About
- `/copyright` — Copyright info
- `/dmca` — DMCA notice
- `/privacy` — Privacy policy
- `/terms` — Terms of service

### Admin
- `/admin/login` — Login
- `/admin` — Dashboard
- `/admin/assets` — Asset management
- `/admin/collections` — Collections
- `/admin/tags` — Tags
- `/admin/settings` — Settings

## Building for Production

```bash
npm run build
npm start
```

## License

All content protected under DMCA provisions.
