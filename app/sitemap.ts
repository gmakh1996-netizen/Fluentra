import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteConfig.url;
  const now = new Date();

  return [
    { url: base,                          lastModified: now, changeFrequency: "weekly",  priority: 1.0 },
    { url: `${base}/pricing`,             lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/languages`,           lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/reviews`,             lastModified: now, changeFrequency: "weekly",  priority: 0.8 },
    { url: `${base}/register`,            lastModified: now, changeFrequency: "yearly",  priority: 0.7 },
    { url: `${base}/login`,               lastModified: now, changeFrequency: "yearly",  priority: 0.5 },
    { url: `${base}/forgot-password`,     lastModified: now, changeFrequency: "yearly",  priority: 0.2 },
  ];
}
