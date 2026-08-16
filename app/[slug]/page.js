import prisma from "@/lib/prisma";
import AppPage from "../components/app/AppPage";
import Navbar from "../components/Navbar";
import End from "../components/End";
import { notFound } from "next/navigation";
import {
  FaLinkedin,
  FaGithub,
  FaTiktok,
  FaWhatsapp,
  FaYoutube,
  FaHashtag,
} from "react-icons/fa";

export const dynamic = "force-dynamic";

function normalizeSlug(slug) {
  return String(slug || "").trim().toLowerCase();
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const normalized = normalizeSlug(slug);

  let app = null;
  try {
    app = await prisma.app.findFirst({
      where: { slug: normalized, active: true },
      include: {
        versions: {
          select: { version: true, releaseDate: true, latest: true },
          orderBy: { createdAt: "desc" },
        },
      },
    });
  } catch {
    app = null;
  }

  if (!app) {
    return {
      title: "Application Not Found | Pashto DevZone",
      description:
        "The requested application could not be found. Explore available software from Pashto DevZone.",
    };
  }

  const latestVersion = app.versions?.find((v) => v.latest) || app.versions?.[0];
  const baseUrl = "https://pashto-devzone.vercel.app";
  const title = `${app.name} | Pashto DevZone`;
  const description =
    app.shortDescription ||
    app.description?.replace(/[#*`>\[\]()]/g, " ").slice(0, 160) ||
    `Download ${app.name} from Pashto DevZone.`;
  const canonical = `${baseUrl}/${app.slug}`;

  return {
    title,
    description,
    keywords: [
      app.name,
      app.category,
      "download",
      "software",
      "Pashto DevZone",
    ].filter(Boolean),
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: "Pashto DevZone",
      images: [
        {
          url: app.logo || "/og_img.png",
          width: 1200,
          height: 630,
          alt: `${app.name} logo`,
        },
      ],
      locale: "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [app.logo || "/og_img.png"],
    },
    alternates: {
      canonical,
    },
  };
}

export default async function DynamicPage({ params }) {
  const { slug } = await params;
  const normalized = normalizeSlug(slug);

  let app = null;
  let related = [];
  try {
    app = await prisma.app.findFirst({
      where: { slug: normalized, active: true },
      include: {
        versions: {
          select: {
            id: true,
            version: true,
            releaseDate: true,
            size: true,
            releaseNotes: true,
            latest: true,
            createdAt: true,
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!app) {
      notFound();
    }

    related = await prisma.app.findMany({
      where: { active: true, NOT: { id: app.id } },
      select: {
        id: true,
        name: true,
        slug: true,
        logo: true,
        shortDescription: true,
        category: true,
        versions: {
          select: { version: true, latest: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 3,
    });
  } catch (error) {
    console.error("Error loading app:", error);
    notFound();
  }

  const latestVersion = app.versions.find((version) => version.latest) || app.versions[0];
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: app.name,
    url: `https://pashto-devzone.vercel.app/${app.slug}`,
    description: app.shortDescription || app.description || `${app.name} by Pashto DevZone`,
    softwareVersion: latestVersion?.version || undefined,
    applicationCategory: app.category || "SoftwareApplication",
    operatingSystem: "Windows, macOS, Linux",
    author: {
      "@type": "Person",
      name: app.developer || "Pashto DevZone",
    },
    image: app.logo || "https://pashto-devzone.vercel.app/og_img.png",
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="bg-white md:max-w-6xl md:mx-auto sm:rounded-lg p-2 md:shadow-2xl min-h-screen w-screen md:mt-17.5 mb-24 text-gray-700">
        <Navbar />
        <div className="flex">
          <div className="left hidden md:block min-h-screen md:w-[15%] items-center justify-center">
            <div className="h-[80vh] flex items-center justify-start pl-0.5">
              <ul className="social flex flex-col gap-5.5">
                <li>
                  <a target="_blank" href="https://github.com/pashto-devzone">
                    <FaGithub className="text-2xl ml-14" />
                  </a>
                </li>
                <li>
                  <a
                    target="_blank"
                    href="https://www.linkedin.com/in/muhammad-yaseen-arman-webdeveloper?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app"
                  >
                    <FaLinkedin className="text-2xl ml-14" />
                  </a>
                </li>
                <li>
                  <a target="_blank" href="https://www.tiktok.com/@pashto_devzone">
                    <FaTiktok className="text-2xl ml-14" />
                  </a>
                </li>
                <li>
                  <a
                    target="_blank"
                    href="https://youtube.com/@pashto_devzone?si=KNUxsiikRH80tKPo"
                  >
                    <FaYoutube className="text-2xl ml-14" />
                  </a>
                </li>
                <li>
                  <a target="_blank" href="https://wa.me/923245020658">
                    <FaWhatsapp className="text-2xl ml-14" />
                  </a>
                </li>
                <li>
                  <a target="_blank" href="https://pdz-blogs.hashnode.dev/">
                    <FaHashtag className="text-2xl ml-14" />
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <main className="public-main-content animate-fadeUp w-[98%] md:w-[85%] flex flex-col items-center justify-center">
            <AppPage app={app} related={related} />
            <End />
          </main>
        </div>
      </div>
    </>
  );
}
