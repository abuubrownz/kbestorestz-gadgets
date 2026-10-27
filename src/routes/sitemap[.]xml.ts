import { createFileRoute } from "@tanstack/react-router";
import { getRouterInstance } from "@tanstack/react-start";
import { isSitemapRouteIncluded, sitemapPathForLocation, sitemapStaticPaths, sitemapXML, type SitemapEntry } from "@/lib/sitemap";
import { products } from "@/lib/data";

const BASE_URL = "https://kbestoretzgadgets.lovable.app";
export const Route = createFileRoute("/sitemap.xml")({
  staticData: { sitemap: false },
  server: { handlers: { GET: async () => {
    const router = await getRouterInstance();
    const entries: SitemapEntry[] = sitemapStaticPaths(router).map((path) => ({ path }));
    const routeId = "/products/$productId";
    if (isSitemapRouteIncluded(router.routesById[routeId])) {
      for (const product of products) {
        const location = router.buildLocation({ to: "/products/$productId", params: { productId: product.id }, search: () => ({}), hash: "" });
        const path = sitemapPathForLocation(router, location, routeId);
        if (path) entries.push({ path });
      }
    }
    if (entries.length === 0) return new Response("No public pages are included in this sitemap", { status: 404, headers: { "Cache-Control": "no-store" } });
    return new Response(sitemapXML(BASE_URL, entries), { headers: { "Content-Type": "application/xml", "Cache-Control": "public, max-age=3600" } });
  } } },
});
