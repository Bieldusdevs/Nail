import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Lume Atelier",
    short_name: "Lume",
    description: "Nail artistry, cuidado e expressão em Almada.",
    start_url: "/",
    display: "standalone",
    background_color: "#fffef7",
    theme_color: "#fffef7",
    lang: "pt-PT",
  };
}
