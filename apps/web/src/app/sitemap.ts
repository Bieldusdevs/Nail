import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? "https://lumeatelier.pt";
  const pages = ["", "/reservar", "/privacidade", "/termos", "/acessibilidade"];
  return pages.map((path, index) => ({
    url: `${origin}${path}`,
    lastModified: new Date("2026-09-04"),
    changeFrequency: index === 0 ? "weekly" : "monthly",
    priority: index === 0 ? 1 : path === "/reservar" ? 0.9 : 0.3,
  }));
}
