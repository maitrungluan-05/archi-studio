/**
 * Generate a 13-digit numeric Public ID
 * Format: Random 13 digits
 * Example: 7391826415028
 */
export function generatePublicId(): string {
  // Generate 13 random digits
  let publicId = "";
  for (let i = 0; i < 13; i++) {
    publicId += Math.floor(Math.random() * 10);
  }
  return publicId;
}

/**
 * Generate a URL-safe slug
 * Handles duplicate slug resolution with suffix
 */
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") // Remove special characters
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Replace multiple hyphens with single
    .replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens
}

const IMAGE_METADATA_PRESETS = [
  { camera: "Canon EOS R5", lens: "RF 24-70mm F2.8 L IS USM", iso: "100", aperture: "f/5.6", focalLength: "50mm", shutterSpeed: "1/250s", width: 8192, height: 5464, resolution: "8192 x 5464" },
  { camera: "Sony Alpha 7R IV", lens: "FE 35mm F1.4 GM", iso: "200", aperture: "f/2.8", focalLength: "35mm", shutterSpeed: "1/500s", width: 9504, height: 6336, resolution: "9504 x 6336" },
  { camera: "Nikon Z8", lens: "NIKKOR Z 24-120mm f/4 S", iso: "64", aperture: "f/8", focalLength: "70mm", shutterSpeed: "1/160s", width: 8256, height: 5504, resolution: "8256 x 5504" },
  { camera: "Fujifilm GFX 100S", lens: "GF 45mm F2.8 R WR", iso: "100", aperture: "f/4", focalLength: "45mm", shutterSpeed: "1/320s", width: 11648, height: 8736, resolution: "11648 x 8736" },
  { camera: "Leica Q3", lens: "Summilux 28mm f/1.7 ASPH.", iso: "400", aperture: "f/2", focalLength: "28mm", shutterSpeed: "1/800s", width: 9520, height: 6336, resolution: "9520 x 6336" },
] as const;

export function generateImageMetadata(seed?: string) {
  const index = seed
    ? [...seed].reduce((hash, character) => (hash * 31 + character.charCodeAt(0)) >>> 0, 0) % IMAGE_METADATA_PRESETS.length
    : Math.floor(Math.random() * IMAGE_METADATA_PRESETS.length);
  return IMAGE_METADATA_PRESETS[index];
}
