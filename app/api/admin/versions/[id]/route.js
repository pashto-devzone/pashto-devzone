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

export async function PUT(request, { params }) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const versionId = parseInt(id, 10);
    const {
      version,
      downloadUrl,
      releaseDate,
      size,
      latest,
      appId,
      releaseNotes,
    } = await request.json();

    // appId comes from the client as a string; Prisma's Int field requires
    // an actual integer, otherwise the query throws and returns 500.
    const parsedAppId =
      appId !== undefined && appId !== "" && appId !== null
        ? parseInt(appId, 10)
        : undefined;
    const safeAppId = Number.isNaN(parsedAppId) ? undefined : parsedAppId;

    const existingVersion = await prisma.appVersion.findUnique({
      where: { id: versionId },
    });

    if (!existingVersion) {
      return NextResponse.json(
        { error: "Version not found" },
        { status: 404 }
      );
    }

    const targetAppId = safeAppId || existingVersion.appId;

    if (version) {
      const dup = await prisma.appVersion.findFirst({
        where: {
          appId: targetAppId,
          version,
          NOT: { id: versionId },
        },
      });
      if (dup) {
        return NextResponse.json(
          { error: "This version already exists for this app" },
          { status: 400 }
        );
      }
    }

    if (latest) {
      await prisma.appVersion.updateMany({
        where: { appId: targetAppId, latest: true },
        data: { latest: false },
      });
    }

    const updated = await prisma.appVersion.update({
      where: { id: versionId },
      data: {
        ...(version !== undefined && { version }),
        ...(downloadUrl !== undefined && { downloadUrl }),
        ...(releaseDate !== undefined && {
          releaseDate: releaseDate ? new Date(releaseDate) : null,
        }),
        ...(size !== undefined && { size }),
        ...(releaseNotes !== undefined && { releaseNotes }),
        ...(latest !== undefined && { latest }),
        ...(safeAppId !== undefined && { appId: safeAppId }),
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Failed to update version:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const versionId = parseInt(id);

    await prisma.appVersion.delete({ where: { id: versionId } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete version:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
