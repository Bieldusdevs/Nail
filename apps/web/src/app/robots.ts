import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? "https://lumeatelier.pt";
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/conta", "/admin", "/entrar", "/recuperar", "/criar-conta"],
      },
    ],
    sitemap: `${origin}/sitemap.xml`,
  };
}
