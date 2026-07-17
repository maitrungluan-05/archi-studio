import { z } from "zod";

// ============================================================
// Validation Schemas
// ============================================================

// Email validation
export const emailSchema = z.string().email("Invalid email format");

// URL validation
export const urlSchema = z.string().url("Invalid URL format").optional().or(z.literal(""));

// Slug validation - lowercase alphanumeric with hyphens
export const slugSchema = z
  .string()
  .toLowerCase()
  .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Slug must be lowercase alphanumeric with hyphens only")
  .min(3, "Slug must be at least 3 characters")
  .max(100, "Slug must be less than 100 characters");

// Public ID validation - ARCH followed by 8 alphanumeric characters
export const publicIdSchema = z
  .string()
  .regex(/^ARCH[A-Z0-9]{8}$/, "Public ID must be ARCH followed by 8 alphanumeric characters")
  .optional();

// Stock ID validation - STK followed by 10 digits
export const stockIdSchema = z
  .string()
  .regex(/^STK[0-9]{10}$/, "Stock ID must be STK followed by 10 digits")
  .optional();

// Asset type validation
export const assetTypeSchema = z.enum(["IMAGE", "VIDEO"]);

// Asset status validation
export const assetStatusSchema = z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]);

// License type validation
export const licenseTypeSchema = z.enum([
  "RIGHTS_MANAGED",
  "ROYALTY_FREE",
  "EDITORIAL",
  "PERSONAL",
  "COMMERCIAL",
]);

// Rights holder role validation
export const rightsHolderRoleSchema = z.enum([
  "COPYRIGHT_OWNER",
  "AUTHORIZED_REPRESENTATIVE",
  "ARCHIVE_CUSTODIAN",
  "PHOTOGRAPHER",
  "VIDEOGRAPHER",
  "CREATOR",
  "PUBLISHER",
  "ORGANIZATION",
  "OTHER",
]);

export const assetUpdateSchema = z.object({
  title: z.string().trim().min(1).max(160).optional(),
  subtitle: z.string().trim().max(240).nullable().optional(),
  description: z.string().trim().max(5000).nullable().optional(),
  story: z.string().trim().max(10000).nullable().optional(),
  imageContent: z.string().trim().max(5000).nullable().optional(),
  displayPrice: z.string().regex(/^\d+(\.\d{0,2})?$/, "Price must be a valid USD amount").nullable().optional(),
  status: assetStatusSchema.optional(),
  publishDate: z.iso.datetime().transform((value) => new Date(value)).nullable().optional(),
  archiveDate: z.iso.datetime().transform((value) => new Date(value)).optional(),
  licenseType: licenseTypeSchema.optional(),
  publicContactEmail: emailSchema.nullable().optional(),
  publicContactWebsite: z.string().url().nullable().optional(),
  seoTitle: z.string().trim().max(160).nullable().optional(),
  seoDescription: z.string().trim().max(320).nullable().optional(),
  keywords: z.string().trim().max(2000).nullable().optional(),
  categoryId: z.string().uuid().nullable().optional(),
  collectionId: z.string().uuid().nullable().optional(),
  copyrightOwner: z.string().trim().min(1).max(160).optional(),
  views: z.number().int().min(0).optional(),
  likes: z.number().int().min(0).optional(),
  country: z.string().trim().max(120).nullable().optional(),
  city: z.string().trim().max(120).nullable().optional(),
  location: z.string().trim().max(240).nullable().optional(),
  category: z.string().trim().max(160).nullable().optional(),
  tags: z.string().trim().max(2000).nullable().optional(),
}).strict();

export const storyFieldsSchema = z.object({
  title: z.string().trim().min(1, "Tiêu đề là bắt buộc").max(160),
  subtitle: z.string().trim().max(240).optional().default(""),
  slug: slugSchema.optional().or(z.literal("")),
  excerpt: z.string().trim().max(500).optional().default(""),
  content: z.string().trim().max(10000).optional().default(""),
  category: z.string().trim().max(160).optional().default(""),
  tags: z.string().trim().max(2000).optional().default(""),
  country: z.string().trim().max(120).optional().default(""),
  city: z.string().trim().max(120).optional().default(""),
  location: z.string().trim().max(240).optional().default(""),
  status: assetStatusSchema.default("DRAFT"),
  publishedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).or(z.literal("")).optional().default(""),
  archiveDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).or(z.literal("")).optional().default(""),
  licenseType: licenseTypeSchema.default("RIGHTS_MANAGED"),
  copyrightOwner: z.string().trim().max(160).optional().default(""),
  contactEmail: z.string().trim().email().or(z.literal("")).optional().default(""),
  contactWebsite: z.string().trim().url().or(z.literal("")).optional().default(""),
  displayPrice: z.string().regex(/^\d*(\.\d{0,2})?$/).optional().default(""),
  views: z.coerce.number().int().min(0).default(0),
  likes: z.coerce.number().int().min(0).default(0),
  downloads: z.coerce.number().int().min(0).default(0),
  favorites: z.coerce.number().int().min(0).default(0),
  seoTitle: z.string().trim().max(160).optional().default(""),
  seoDescription: z.string().trim().max(320).optional().default(""),
});

export const STORY_MAX_IMAGES = 25;
export const STORY_MAX_FILE_SIZE = 10 * 1024 * 1024;
export const STORY_MAX_TOTAL_SIZE = 100 * 1024 * 1024;

// ============================================================
// Validation Functions
// ============================================================

/**
 * Validate email format
 */
export function validateEmail(email: string): boolean {
  try {
    emailSchema.parse(email);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validate URL format
 */
export function validateUrl(url: string | undefined): boolean {
  if (!url) return true; // Optional field
  try {
    urlSchema.parse(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validate slug format
 */
export function validateSlug(slug: string): { valid: boolean; error?: string } {
  try {
    slugSchema.parse(slug);
    return { valid: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { valid: false, error: error.issues[0]?.message ?? "Invalid slug format" };
    }
    return { valid: false, error: "Invalid slug format" };
  }
}

/**
 * Sanitize string input
 */
export function sanitizeInput(input: string): string {
  return input.trim().slice(0, 500); // Limit to 500 chars
}

/**
 * Validate pagination parameters
 */
export function validatePagination(page?: number, pageSize?: number) {
  const validPage = Math.max(1, page ?? 1);
  const validPageSize = Math.min(Math.max(1, pageSize ?? 20), 100); // Max 100 per page
  return { page: validPage, pageSize: validPageSize };
}
