export const dynamic = "force-static";

const robots = `User-agent: *
Allow: /
Disallow: /admin
Disallow: /admin/*
Disallow: /api/admin
Disallow: /api/admin/*

Sitemap: https://pashto-devzone.vercel.app/sitemap.xml
`;

export default function GET() {
  return new Response(robots, {
    headers: { "Content-Type": "text/plain" },
  });
}
