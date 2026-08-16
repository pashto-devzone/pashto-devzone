import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { checkAuth, getAdminUsername } from "@/lib/auth";

function generateCode(slug) {
  const digits = Math.floor(10000 + Math.random() * 90000);
  return `pdz.${slug}.${digits}`;
}

export async function GET(request) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const appId = searchParams.get("appId");

    const where = {};
    if (appId) where.appId = parseInt(appId);

    const licenses = await prisma.license.findMany({
      where,
      include: {
        app: { select: { id: true, name: true, slug: true } },
        customer: { select: { id: true, name: true, phone: true, email: true } },
        _count: { select: { downloads: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(licenses);
  } catch (error) {
    console.error("Failed to fetch licenses:", error);
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
    const { customerName, appId } = await request.json();

    const name = (customerName || "").trim();
    if (!name) {
      return NextResponse.json(
        { error: "Customer name is required" },
        { status: 400 }
      );
    }
    if (!appId) {
      return NextResponse.json(
        { error: "Application is required" },
        { status: 400 }
      );
    }

    const app = await prisma.app.findUnique({
      where: { id: parseInt(appId) },
    });
    if (!app) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      );
    }

    // Find or create customer by name
    let customer = await prisma.customer.findFirst({
      where: { name: { equals: name } },
    });
    if (!customer) {
      customer = await prisma.customer.create({ data: { name } });
    }

    // Auto-generate unique code
    let code;
    let exists = true;
    while (exists) {
      code = generateCode(app.slug);
      exists = await prisma.license.findUnique({ where: { code } });
    }

    const generatedBy = getAdminUsername(request);

    const license = await prisma.license.create({
      data: {
        code,
        customerId: customer.id,
        appId: app.id,
        status: "UNUSED",
        paymentStatus: "PAID",
        generatedBy,
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
      },
      include: {
        app: { select: { id: true, name: true, slug: true } },
        customer: { select: { id: true, name: true, phone: true, email: true } },
      },
    });

    return NextResponse.json(license, { status: 201 });
  } catch (error) {
    console.error("Failed to generate license:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
