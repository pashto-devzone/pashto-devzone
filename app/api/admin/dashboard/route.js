import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { checkAuth } from "@/lib/auth";

export async function GET(request) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const [
      totalApps,
      totalVersions,
      totalLicenses,
      totalDownloads,
      totalReceipts,
      revenueAgg,
      recentReceipts,
      recentLicenses,
      recentDownloads,
    ] = await Promise.all([
      prisma.app.count(),
      prisma.appVersion.count(),
      prisma.license.count(),
      prisma.downloadLog.count(),
      prisma.receipt.count(),
      prisma.receipt.aggregate({ _sum: { price: true } }),
      prisma.receipt.findMany({
        orderBy: { createdAt: "desc" },
        take: 6,
        include: {
          customer: { select: { id: true, name: true } },
          app: { select: { id: true, name: true, slug: true } },
          paymentAccount: true,
        },
      }),
      prisma.license.findMany({
        orderBy: { createdAt: "desc" },
        take: 6,
        include: {
          customer: { select: { id: true, name: true } },
          app: { select: { id: true, name: true, slug: true } },
        },
      }),
      prisma.downloadLog.findMany({
        orderBy: { downloadedAt: "desc" },
        take: 6,
        include: {
          customer: { select: { id: true, name: true } },
          license: { select: { id: true, code: true } },
          app: { select: { id: true, name: true, slug: true } },
        },
      }),
    ]);

    return NextResponse.json({
      totalApps,
      totalVersions,
      totalLicenses,
      totalDownloads,
      totalReceipts,
      totalRevenue: revenueAgg._sum.price || 0,
      recentReceipts,
      recentLicenses,
      recentDownloads,
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
