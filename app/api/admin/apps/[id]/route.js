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
    const appId = parseInt(id);
    const {
      name,
      slug,
      description,
      shortDescription,
      category,
      developer,
      features,
      screenshots,
      systemRequirements,
      logo,
      active,
      licenseRequired,
    } = await request.json();

    const normalizedSlug = slug ? String(slug).trim().toLowerCase() : undefined;

    if (normalizedSlug) {
      const existing = await prisma.app.findFirst({
        where: { slug: normalizedSlug, NOT: { id: appId } },
      });
      if (existing) {
        return NextResponse.json(
          { error: "An app with this slug already exists" },
          { status: 400 }
        );
      }
    }

    const app = await prisma.app.update({
      where: { id: appId },
      data: {
        ...(name !== undefined && { name }),
        ...(normalizedSlug !== undefined && { slug: normalizedSlug }),
        ...(description !== undefined && { description }),
        ...(shortDescription !== undefined && { shortDescription }),
        ...(category !== undefined && { category }),
        ...(developer !== undefined && { developer }),
...(features !== undefined && {
          features: Array.isArray(features)
            ? JSON.stringify(features)
            : features,
        }),
        ...(screenshots !== undefined && {
          screenshots: Array.isArray(screenshots)
            ? JSON.stringify(screenshots)
            : screenshots,
        }),
        ...(systemRequirements !== undefined && {
          systemRequirements:
            systemRequirements && typeof systemRequirements === "object"
              ? JSON.stringify(systemRequirements)
              : systemRequirements,
        }),
        ...(logo !== undefined && { logo }),
        ...(active !== undefined && { active }),
        ...(licenseRequired !== undefined && { licenseRequired }),
      },
    });

    return NextResponse.json(app);
  } catch (error) {
    console.error("Failed to update app:", error);
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
    const appId = parseInt(id);

    const versionCount = await prisma.appVersion.count({
      where: { appId },
    });

    if (versionCount > 0) {
      return NextResponse.json(
        {
          error: `This app has ${versionCount} version(s). Delete them first.`,
          hasVersions: true,
          versionCount,
        },
        { status: 400 }
      );
    }

    await prisma.app.delete({ where: { id: appId } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete app:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
