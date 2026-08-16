import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { checkAuth } from "@/lib/auth";

// Helper to start of day for a given Date
function startOfDay(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

export async function GET(request) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const appId = searchParams.get("appId");
    const range = searchParams.get("range") || "30"; // 7 | 30 | 90 | all

    const where = {};
    if (appId) where.appId = parseInt(appId);
    const appWhere = appId ? { where: { id: parseInt(appId) } } : undefined;

    const now = new Date();

    // Totals
    const [
      totalDownloads,
      downloadsToday,
      downloadsThisWeek,
      downloadsThisMonth,
    ] = await Promise.all([
      prisma.downloadLog.count({ where }),
      prisma.downloadLog.count({
        where: { ...where, downloadedAt: { gte: startOfDay(now) } },
      }),
      prisma.downloadLog.count({
        where: {
          ...where,
          downloadedAt: {
            gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
          },
        },
      }),
      prisma.downloadLog.count({
        where: {
          ...where,
          downloadedAt: {
            gte: new Date(now.getFullYear(), now.getMonth(), 1),
          },
        },
      }),
    ]);

    // Apps (for filter dropdown)
    const apps = await prisma.app.findMany({
      where: { active: true },
      select: { id: true, name: true, slug: true, logo: true },
      orderBy: { name: "asc" },
    });

    // Graph data
    let days = [];
    let startDate = null;
    let label;
    if (range === "7") {
      days = 7;
      startDate = new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000);
      label = "Last 7 days";
    } else if (range === "90") {
      days = 90;
      startDate = new Date(now.getTime() - 89 * 24 * 60 * 60 * 1000);
      label = "Last 90 days";
    } else if (range === "all") {
      // Find earliest download
      const first = await prisma.downloadLog.findFirst({
        where,
        orderBy: { downloadedAt: "asc" },
        select: { downloadedAt: true },
      });
      days = 30;
      startDate = first ? startOfDay(first.downloadedAt) : startOfDay(now);
      label = "All time";
      // Cap the number of buckets at 90 to keep the chart readable
      const totalDays = Math.ceil(
        (now - startDate) / (24 * 60 * 60 * 1000)
      );
      if (totalDays > 90) {
        days = Math.min(90, totalDays);
        startDate = new Date(now.getTime() - (days - 1) * 24 * 60 * 60 * 1000);
        label = `Last ${days} days`;
      } else if (totalDays > 0) {
        days = Math.max(1, totalDays);
      } else {
        days = 1;
        startDate = startOfDay(now);
      }
    } else {
      days = 30;
      startDate = new Date(now.getTime() - 29 * 24 * 60 * 60 * 1000);
      label = "Last 30 days";
    }

    startDate = startOfDay(startDate);

    const downloads = await prisma.downloadLog.findMany({
      where: { ...where, downloadedAt: { gte: startDate } },
      select: { downloadedAt: true },
    });

    // Build buckets keyed by YYYY-MM-DD
    const buckets = {};
    for (let i = 0; i < days; i++) {
      const d = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
      const key = d.toISOString().slice(0, 10);
      buckets[key] = { date: key, count: 0 };
    }

    downloads.forEach((dl) => {
      const key = new Date(dl.downloadedAt).toISOString().slice(0, 10);
      if (buckets[key]) buckets[key].count += 1;
    });

    const series = Object.values(buckets);
    const max = Math.max(1, ...series.map((s) => s.count));

    // Per-app breakdown for the chart legend/total context
    const perApp = await prisma.downloadLog.groupBy({
      by: ["appId"],
      where: appId ? {} : {}, // all apps breakdown only when no specific app
      _count: true,
    });

    const appTotals = [];
    if (!appId) {
      const appIds = perApp.map((p) => p.appId).filter(Boolean);
      if (appIds.length > 0) {
        const appMap = await prisma.app.findMany({
          where: { id: { in: appIds } },
          select: { id: true, name: true, slug: true, logo: true },
        });
        const mapObj = {};
        appMap.forEach((a) => (mapObj[a.id] = a));
        perApp.forEach((p) => {
          if (p.appId && mapObj[p.appId]) {
            appTotals.push({ ...mapObj[p.appId], downloads: p._count });
          }
        });
      }
    }

    const selectedApp = appId
      ? await prisma.app.findUnique({
          where: { id: parseInt(appId) },
          select: { id: true, name: true, slug: true, logo: true },
        })
      : null;

    return NextResponse.json({
      totalDownloads,
      downloadsToday,
      downloadsThisWeek,
      downloadsThisMonth,
      apps,
      selectedApp,
      graph: {
        label,
        series,
        max,
        range,
      },
      perApp: appTotals,
    });
  } catch (error) {
    console.error("Analytics error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

