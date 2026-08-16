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
    const includeInactive = searchParams.get("all") === "true";

    const apps = await prisma.app.findMany({
      where: includeInactive ? {} : { active: true },
      include: {
        _count: {
          select: { versions: true, licenses: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(apps);
  } catch (error) {
    console.error("Failed to fetch apps:", error);
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

    const normalizedSlug = String(slug || "").trim().toLowerCase();
    if (!name || !normalizedSlug) {
      return NextResponse.json(
        { error: "Name and slug are required" },
        { status: 400 }
      );
    }

    const existing = await prisma.app.findUnique({
      where: { slug: normalizedSlug },
    });
    if (existing) {
      return NextResponse.json(
        { error: "An app with this slug already exists" },
        { status: 400 }
      );
    }

    const app = await prisma.app.create({
      data: {
        name,
        slug: normalizedSlug,
        description: description || null,
        shortDescription: shortDescription || null,
        category: category || null,
        developer: developer || null,
        features: Array.isArray(features)
          ? JSON.stringify(features)
          : features || null,
        screenshots: Array.isArray(screenshots)
          ? JSON.stringify(screenshots)
          : screenshots || null,
        systemRequirements:
          systemRequirements && typeof systemRequirements === "object"
            ? JSON.stringify(systemRequirements)
            : systemRequirements || null,
        logo: logo || null,
        active: active !== undefined ? active : true,
        licenseRequired:
          licenseRequired !== undefined ? licenseRequired : true,
      },
    });

    return NextResponse.json(app, { status: 201 });
  } catch (error) {
    console.error("Failed to create app:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const appId = parseInt(searchParams.get("id") || "0", 10);

    if (!appId) {
      return NextResponse.json(
        { error: "App ID is required" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { active } = body;

    // If just toggling active status
    if (active !== undefined && Object.keys(body).length === 1) {
      const app = await prisma.app.update({
        where: { id: appId },
        data: { active },
      });
      return NextResponse.json(app);
    }

    // Full update
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
      licenseRequired,
    } = body;

    const normalizedSlug = slug ? String(slug).trim().toLowerCase() : undefined;
    if (normalizedSlug) {
      const existing = await prisma.app.findUnique({
        where: { slug: normalizedSlug },
      });
      if (existing && existing.id !== appId) {
        return NextResponse.json(
          { error: "An app with this slug already exists" },
          { status: 400 }
        );
      }
    }

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (slug !== undefined) updateData.slug = normalizedSlug;
    if (description !== undefined) updateData.description = description || null;
    if (shortDescription !== undefined)
      updateData.shortDescription = shortDescription || null;
    if (category !== undefined) updateData.category = category || null;
    if (developer !== undefined) updateData.developer = developer || null;
    if (features !== undefined) {
      updateData.features = Array.isArray(features)
        ? JSON.stringify(features)
        : features || null;
    }
    if (screenshots !== undefined) {
      updateData.screenshots = Array.isArray(screenshots)
        ? JSON.stringify(screenshots)
        : screenshots || null;
    }
    if (systemRequirements !== undefined) {
      updateData.systemRequirements =
        systemRequirements && typeof systemRequirements === "object"
          ? JSON.stringify(systemRequirements)
          : systemRequirements || null;
    }
    if (logo !== undefined) updateData.logo = logo || null;
    if (active !== undefined) updateData.active = active;
    if (licenseRequired !== undefined)
      updateData.licenseRequired = licenseRequired;

    const app = await prisma.app.update({
      where: { id: appId },
      data: updateData,
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

export async function DELETE(request) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const appId = parseInt(searchParams.get("id") || "0", 10);

    if (!appId) {
      return NextResponse.json(
        { error: "App ID is required" },
        { status: 400 }
      );
    }

    await prisma.app.delete({
      where: { id: appId },
    });

    return NextResponse.json({ message: "App deleted successfully" });
  } catch (error) {
    console.error("Failed to delete app:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
