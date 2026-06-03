import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    background_color: "#1b1714",
    description:
      "Mobile-first party games for groups. Beerits are fictional in-game penalty points.",
    display: "standalone",
    name: "Beerit",
    short_name: "Beerit",
    start_url: "/",
    theme_color: "#f56600",
  };
}
