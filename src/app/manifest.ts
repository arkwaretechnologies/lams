import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "LAMS — Letran Athlete Meal System",
    short_name: "LAMS",
    description: "Manage meal allowances for student-athletes",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#8B0000",
    orientation: "portrait-primary",
    icons: [
      {
        src: "/icons/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
  };
}
