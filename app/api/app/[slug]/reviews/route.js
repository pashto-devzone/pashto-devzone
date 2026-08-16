import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// Simple in-memory rate limiting: prevent spam by IP (max N submissions / window)
const RATE_LIMIT_WINDOW = 10 * 60 * 1000; // 10 minutes
const RATE_LIMIT_MAX = 5;
const submissions = new Map();

function rateLimited(ip) {
  const now = Date.now();
  const rec = submissions.get(ip);
  if (!rec) {
    submissions.set(ip, { count: 1, first: now });
    return false;
  }
  if (now - rec.first > RATE_LIMIT_WINDOW) {
    submissions.set(ip, { count: 1, first: now });
    return false;
  }
  rec.count += 1;
  if (rec.count > RATE_LIMIT_MAX) return true;
  return false;
}

export function normalizeSlug(slug) {
  return String(slug || "").trim().toLowerCase();
}

// GET /api/app/[slug]/reviews
export async function GET(request, { params }) {
  try {
    const { slug: rawSlug } = await params;
    const slug = normalizeSlug(rawSlug);

    const app = await prisma.app.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!app) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    const reviews = await prisma.review.findMany({
      where: { appId: app.id },
      orderBy: { createdAt: "desc" },
    });

    const count = reviews.length;
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    const average = count > 0 ? Math.round((sum / count) * 10) / 10 : 0;

    return NextResponse.json({
      reviews,
      count,
      average,
    });
  } catch (error) {
    console.error("Failed to fetch reviews:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/app/[slug]/reviews
export async function POST(request, { params }) {
  try {
    const { slug: rawSlug } = await params;
    const slug = normalizeSlug(rawSlug);

    const app = await prisma.app.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!app) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    // Rate limiting
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "unknown";
    if (rateLimited(ip)) {
      return NextResponse.json(
        { error: "Too many review submissions. Please try again later." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const name = String(body.name || "").trim();
    const rating = Number(body.rating);
    const review = String(body.review || "").trim();

    // Validation
    if (!name || name.length < 2 || name.length > 60) {
      return NextResponse.json(
        { error: "Name must be between 2 and 60 characters." },
        { status: 400 }
      );
    }
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "Rating must be between 1 and 5 stars." },
        { status: 400 }
      );
    }
    if (!review || review.length < 5 || review.length > 1000) {
      return NextResponse.json(
        { error: "Review must be between 5 and 1000 characters." },
        { status: 400 }
      );
    }

// Sanitize: escape HTML entities to prevent XSS/script injection
    const escapeMap = {
      "&": "&" + "amp" + ";",
      "<": "&" + "lt" + ";",
      ">": "&" + "gt" + ";",
      '"': "&" + "quot" + ";",
    };
    const sanitize = (s) =>
      String(s).replace(/[&<>"]/g, (c) => escapeMap[c] || c);
    const safeName = sanitize(name).slice(0, 60);
    const safeReview = sanitize(review).slice(0, 1000);

    const created = await prisma.review.create({
      data: {
        appId: app.id,
        name: safeName,
        rating,
        review: safeReview,
      },
    });

    const reviews = await prisma.review.findMany({
      where: { appId: app.id },
      orderBy: { createdAt: "desc" },
    });
    const count = reviews.length;
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    const average = count > 0 ? Math.round((sum / count) * 10) / 10 : 0;

    return NextResponse.json(
      {
        success: true,
        review: created,
        reviews,
        count,
        average,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Failed to create review:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

