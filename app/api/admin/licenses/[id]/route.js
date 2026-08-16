import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { checkAuth } from "@/lib/auth";

export async function GET(request, { params }) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const licenseId = parseInt(id);

    const license = await prisma.license.findUnique({
      where: { id: licenseId },
      include: {
        app: { select: { id: true, name: true, slug: true } },
        customer: { select: { id: true, name: true, phone: true, email: true } },
        order: { select: { id: true, orderNumber: true } },
        versionModel: { select: { id: true, version: true } },
        downloads: { orderBy: { downloadedAt: "desc" } },
      },
    });

    if (!license) {
      return NextResponse.json({ error: "License not found" }, { status: 404 });
    }

    return NextResponse.json(license);
  } catch (error) {
    console.error("Failed to fetch license:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const licenseId = parseInt(id);
    const { status, usedAt, expiresAt, paymentStatus } = await request.json();

    const existing = await prisma.license.findUnique({
      where: { id: licenseId },
    });
    if (!existing) {
      return NextResponse.json({ error: "License not found" }, { status: 404 });
    }

    const data = {};
    if (status !== undefined) data.status = status;
    if (paymentStatus !== undefined) data.paymentStatus = paymentStatus;
    if (expiresAt !== undefined) data.expiresAt = new Date(expiresAt);
    if (usedAt !== undefined) data.usedAt = usedAt ? new Date(usedAt) : null;
    if (status === "USED" && !existing.usedAt) data.usedAt = new Date();

    const updated = await prisma.license.update({
      where: { id: licenseId },
      data,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Failed to update license:", error);
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
    const licenseId = parseInt(id);

    await prisma.license.delete({ where: { id: licenseId } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete license:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
