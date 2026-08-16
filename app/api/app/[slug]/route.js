import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  const { slug: rawSlug } = await params;
  const slug = String(rawSlug || "").trim().toLowerCase();

  try {
    const app = await prisma.app.findUnique({
      where: { slug, active: true },
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
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      );
    }

    // Fetch related applications, excluding current app, max 3
    const related = await prisma.app.findMany({
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

    return NextResponse.json({ ...app, related });
  } catch (error) {
    console.error("Failed to fetch app:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
