import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { checkAuth } from "@/lib/auth";

export async function GET(request) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get("customerId");
    const licenseId = searchParams.get("licenseId");
    const appId = searchParams.get("appId");

    const where = {};
    if (customerId) where.customerId = parseInt(customerId);
    if (licenseId) where.licenseId = parseInt(licenseId);
    if (appId) where.appId = parseInt(appId);

    const downloads = await prisma.downloadLog.findMany({
      where,
      include: {
        customer: { select: { id: true, name: true, phone: true } },
        license: { select: { id: true, code: true } },
        app: { select: { id: true, name: true, slug: true } },
        versionModel: { select: { id: true, version: true } },
      },
      orderBy: { downloadedAt: "desc" },
    });

return NextResponse.json(downloads);
  } catch (error) {
    console.error("Failed to fetch downloads:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
