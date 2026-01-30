import { redirect } from 'next/navigation';
import { MetadataRoute } from "next";

export const revalidate = 3600; // Revalidate sitemap every hour

// Redirect to new sitemap index for backward compatibility
export default function sitemap(): MetadataRoute.Sitemap {
  redirect('/sitemap-index.xml');
}
