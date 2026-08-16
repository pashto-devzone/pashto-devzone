import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "portfolio-admin-secret-key-2024";

function checkAuth(request) {
  const token = request.cookies.get("admin_token")?.value;
  if (!token) return false;
  try {
    jwt.verify(token, JWT_SECRET);
    return true;
  } catch {
    return false;
  }
}

export async function GET(request) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const appId = searchParams.get("appId");

    const where = appId ? { appId: parseInt(appId) } : {};

    const versions = await prisma.appVersion.findMany({
      where,
      include: {
        app: {
          select: { id: true, name: true, slug: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(versions);
  } catch (error) {
    console.error("Failed to fetch versions:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const {
      appId,
      version,
      downloadUrl,
      releaseDate,
      size,
      latest,
      releaseNotes,
    } = await request.json();

    if (!appId || !version) {
      return NextResponse.json(
        { error: "App ID and version are required" },
        { status: 400 }
      );
    }

    const existing = await prisma.appVersion.findFirst({
      where: { appId: parseInt(appId), version },
    });
    if (existing) {
      return NextResponse.json(
        { error: "This version already exists for this app" },
        { status: 400 }
      );
    }

    if (latest) {
      await prisma.appVersion.updateMany({
        where: { appId: parseInt(appId), latest: true },
        data: { latest: false },
      });
    }

    const newVersion = await prisma.appVersion.create({
      data: {
        appId: parseInt(appId),
        version,
        downloadUrl: downloadUrl || null,
        releaseDate: releaseDate ? new Date(releaseDate) : null,
        size: size || null,
        releaseNotes: releaseNotes || null,
        latest: latest || false,
      },
    });

    return NextResponse.json(newVersion, { status: 201 });
  } catch (error) {
    console.error("Failed to create version:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
