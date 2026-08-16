import prisma from "@/lib/prisma";
import Link from "next/link";
import { FaDownload, FaRocket, FaCalendarAlt, FaArrowRight } from "react-icons/fa";

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

/**
 * Server component that lists the top 2 active applications by review count.
 * Each card shows the app Logo, Name, Description, Latest Version and a
 * "View & Download" button linking to /{slug}.
 * Below the cards, displays a "View All Applications" link to /apps.
 */
export default async function SoftwareSection() {
  let apps = [];
  try {
    // Fetch top 2 active apps by review count, plus required fields for cards.
    const allApps = await prisma.app.findMany({
      where: { active: true },
      select: {
        id: true,
        name: true,
        slug: true,
        logo: true,
        shortDescription: true,
        category: true,
        versions: {
          select: { id: true, version: true, latest: true, releaseDate: true },
          orderBy: { createdAt: "desc" },
        },
        _count: {
          select: { reviews: true },
        },
      },
    });

    // Sort by review count (descending) and take top 2
    // Sort by review count and take top 2 apps for homepage
    apps = allApps
      .sort((a, b) => (b._count?.reviews || 0) - (a._count?.reviews || 0))
      .slice(0, 2)
      .map(({ _count, ...app }) => app);
  } catch (error) {
    console.error("Failed to load software section:", error);
    return null;
  }

  if (apps.length === 0) {
    return null;
  }

  return (
    <section className="work mx-4 md:mx-0 flex flex-col gap-4 mt-16">
      <div className="heading flex flex-col gap-3 scroll-reveal-animation">
        <h2 className="text-2xl md:text-3xl font-bold">SOFTWARE</h2>
        <h3>Featured applications built by Pashto DevZone</h3>
        <div className="divide flex items-center">
          <div className="circle h-2 w-2 rounded-full bg-green-600"></div>
          <div className="line h-1 w-32 bg-green-600"></div>
        </div>
      </div>

      <div className="projects grid grid-cols-1 sm:grid-cols-2 gap-6 md:mr-12 mt-4">
        {apps.map((app, index) => {
          const latest =
            app.versions.find((v) => v.latest) || app.versions[0] || null;
          return (
            <div
              key={app.id}
              className="project_card scroll-reveal-animation"
              style={{ "--animation-delay": `${index * 100}ms` }}
            >
              <div className="bg-white hover:-translate-y-2 shadow-2xl transition-all duration-300 rounded-2xl overflow-hidden border border-gray-100">
                <div className="flex items-center gap-4 p-5 bg-gradient-to-r from-green-50 to-white">
                  {app.logo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={app.logo}
                      alt={`${app.name} logo`}
                      loading="lazy"
                      className="w-16 h-16 rounded-xl object-contain bg-white p-1 shadow-sm"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center flex-shrink-0">
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

                <div className="px-5 py-3 flex items-center justify-between flex-wrap gap-2">
                  <div className="text-xs text-gray-500">
                    {latest ? (
                      <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 font-semibold px-2.5 py-1 rounded-full">
                        Latest v{latest.version}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-700 font-semibold px-2.5 py-1 rounded-full">
                        Coming Soon
                      </span>
                    )}
                    {latest?.releaseDate && (
                      <span className="inline-flex items-center gap-1 ml-2">
                        <FaCalendarAlt className="text-green-600" />
                        {formatDate(latest.releaseDate)}
                      </span>
                    )}
                  </div>
                </div>

                <div className="px-5 pb-5">
                  <Link
                    href={`/${app.slug}`}
                    className="group inline-flex w-full items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold py-2.5 rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-300 transform hover:scale-105"
                  >
                    <FaDownload /> View & Download
                    <FaArrowRight className="text-sm group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* VIEW ALL APPLICATIONS LINK */}
      <div className="flex justify-center mt-8 mb-4 scroll-reveal-animation">
        <Link
          href="/apps"
          className="text-green-600 hover:text-green-700 font-semibold text-sm flex items-center gap-2 hover:gap-3 transition-all duration-300"
        >
          View All Applications
          <FaArrowRight className="text-xs" />
        </Link>
      </div>
    </section>
  );
}
