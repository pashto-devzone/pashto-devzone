import prisma from "@/lib/prisma";

const baseUrl = "https://pashto-devzone.vercel.app";

export const dynamic = "force-dynamic";

export default async function GET() {
  const apps = await prisma.app.findMany({
    where: { active: true },
    select: { slug: true },
    orderBy: { createdAt: "desc" },
  });

  const routes = ["/", "/apps", "/contact", "/works", "/resume"]
    .map((path) => `  <url>\n    <loc>${baseUrl}${path}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>`)
    .join("\n");

  const appRoutes = apps
    .map(
      (app) => `  <url>\n    <loc>${baseUrl}/${app.slug}</loc>\n    <changefreq>monthly</changefreq>\n    <priority>0.7</priority>\n  </url>`
    )
    .join("\n");

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${routes}\n${appRoutes}\n</urlset>`;

  return new Response(sitemap, {
    headers: { "Content-Type": "application/xml" },
  });
}
