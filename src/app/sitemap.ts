import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: "http://127.0.0.1:3000/" },
    { url: "http://127.0.0.1:3000/products" },
    { url: "http://127.0.0.1:3000/login" },
    { url: "http://127.0.0.1:3000/register" },
    { url: "http://127.0.0.1:3000/cart" }
  ];
}
