import prisma from "@/lib/prisma";
import Navbar from "../components/Navbar";
import End from "../components/End";
import Link from "next/link";
import {
  FaLinkedin,
  FaGithub,
  FaTiktok,
  FaWhatsapp,
  FaYoutube,
  FaHashtag,
  FaRocket,
  FaArrowRight,
  FaCalendarAlt,
  FaStar,
} from "react-icons/fa";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  return {
    title: "All Applications | Pashto DevZone",
    description: "Explore all software and applications developed by Pashto DevZone.",
    keywords: ["applications", "software", "download", "Pashto DevZone"],
  };
}

function formatDate(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return null;
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default async function AppsPage() {
  let apps = [];
  try {
    apps = await prisma.app.findMany({
      where: { active: true },
      select: {
        id: true,
        name: true,
        slug: true,
        logo: true,
        shortDescription: true,
        category: true,
        versions: {
          select: { id: true, version: true, latest: true, releaseDate: true, size: true },
          orderBy: { createdAt: "desc" },
        },
        reviews: {
          select: { id: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.error("Failed to load applications:", error);
  }

  return (
    <>
      <div className="bg-white md:max-w-6xl md:mx-auto sm:rounded-lg p-2 md:shadow-2xl min-h-screen w-screen md:mt-17.5 mb-24 text-gray-700">
        <Navbar />
        <div className="flex">
          {/* LEFT SIDEBAR - SOCIAL ICONS */}
          <div className="left hidden md:block min-h-screen md:w-[15%] items-center justify-center">
            <div className="h-[80vh] flex items-center justify-start pl-0.5">
              <ul className="social flex flex-col gap-5.5">
                <li>
                  <a target="_blank" rel="noopener noreferrer" href="https://github.com/pashto-devzone">
                    <FaGithub className="text-2xl ml-14" />
                  </a>
                </li>
                <li>
                  <a target="_blank" rel="noopener noreferrer" href="https://www.linkedin.com/in/muhammad-yaseen-arman-webdeveloper?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app">
                    <FaLinkedin className="text-2xl ml-14" />
                  </a>
                </li>
                <li>
                  <a target="_blank" rel="noopener noreferrer" href="https://www.tiktok.com/@pashto_devzone">
                    <FaTiktok className="text-2xl ml-14" />
                  </a>
                </li>
                <li>
                  <a target="_blank" rel="noopener noreferrer" href="https://youtube.com/@pashto_devzone?si=KNUxsiikRH80tKPo">
                    <FaYoutube className="text-2xl ml-14" />
                  </a>
                </li>
                <li>
                  <a target="_blank" rel="noopener noreferrer" href="https://wa.me/923245020658">
                    <FaWhatsapp className="text-2xl ml-14" />
                  </a>
                </li>
                <li>
                  <a target="_blank" rel="noopener noreferrer" href="https://pdz-blogs.hashnode.dev/">
                    <FaHashtag className="text-2xl ml-14" />
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* MAIN CONTENT */}
          <main className="public-main-content animate-fadeUp w-[98%] md:w-[85%] flex flex-col items-center justify-start">
            {/* HEADER SECTION */}
            <section className="w-full flex flex-col gap-4 ml-8 md:mx-0 mt-4 md:mt-8 mb-12 scroll-reveal-animation">
              <div className="heading flex flex-col gap-3">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-850">
                  Applications & Software
                </h1>
                <p className="text-lg text-gray-600 max-w-2xl">
                  Explore software and applications developed by Pashto DevZone.
                </p>
                <div className="divide flex items-center">
                  <div className="circle h-2 w-2 rounded-full bg-green-600"></div>
                  <div className="line h-1 w-32 bg-green-600"></div>
                </div>
              </div>
            </section>

            {/* APPLICATIONS GRID */}
            {apps.length > 0 ? (
              <div className="w-full px-4 md:px-0 md:mr-12">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6 mb-8">
                  {apps.map((app, index) => {
                    const latest =
                      app.versions.find((v) => v.latest) || app.versions[0] || null;
                    const reviewCount = app.reviews.length;

                    return (
                      <div
                        key={app.id}
                        className="app-card scroll-reveal-animation"
                        style={{ "--animation-delay": `${index * 100}ms` }}
                      >
                        <div className="bg-white hover:shadow-xl hover:-translate-y-2 shadow-lg transition-all duration-300 rounded-2xl overflow-hidden border border-gray-100">
                          <div className="flex items-center gap-4 p-5 bg-linear-to-r from-green-50 to-white">
                            {app.logo ? (
                              <img
                                src={app.logo}
                                alt={`${app.name} logo`}
                                loading="lazy"
                                className="w-16 h-16 rounded-xl object-contain bg-white p-1 shadow-sm"
                              />
                            ) : (
                              <div className="w-16 h-16 rounded-xl bg-linear-to-br from-green-500 to-emerald-600 flex items-center justify-center shrink-0">
                                <FaRocket className="text-white text-2xl" />
                              </div>
                            )}

                            <div className="min-w-0">
                              <h3 className="text-lg font-bold text-gray-900 truncate">
                                {app.name}
                              </h3>
                              {app.category && (
                                <p className="text-xs text-gray-500">{app.category}</p>
                              )}
                            </div>
                          </div>

                          {app.shortDescription && (
                            <p className="px-5 pt-3 pb-2 text-sm text-gray-600 line-clamp-2">
                              {app.shortDescription}
                            </p>
                          )}

                          <div className="px-5 py-3 flex flex-wrap gap-2 text-xs">
                            {latest && (
                              <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 font-semibold px-2.5 py-1 rounded-full">
                                v{latest.version}
                              </span>
                            )}
                            {latest?.size && (
                              <span className="inline-flex items-center gap-1 text-gray-600">
                                {latest.size}
                              </span>
                            )}
                            {reviewCount > 0 && (
                              <span className="inline-flex items-center gap-1 text-amber-600">
                                <FaStar className="text-xs" /> {reviewCount}
                              </span>
                            )}
                          </div>

                          {latest?.releaseDate && (
                            <div className="px-5 py-2 text-xs text-gray-500 flex items-center gap-1 border-t border-gray-100">
                              <FaCalendarAlt className="text-gray-400" />
                              {formatDate(latest.releaseDate)}
                            </div>
                          )}

                          <div className="px-5 pb-5 pt-3">
                            <Link
                              href={`/${app.slug}`}
                              className="group inline-flex w-full items-center justify-center gap-2 bg-linear-to-r from-green-600 to-emerald-600 text-white font-semibold py-2.5 rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-300 transform hover:scale-105"
                            >
                              View Application
                              <FaArrowRight className="text-sm group-hover:translate-x-1 transition-transform" />
                            </Link>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="w-full px-4 md:px-0 text-center py-12">
                <p className="text-gray-500 text-lg">No applications available.</p>
              </div>
            )}

            <End />
          </main>
        </div>
      </div>

      {/* Styles for .app-card are defined globally in globals.css to keep this a Server Component */}
    </>
  );
}

