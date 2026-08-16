import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const apps = await prisma.app.findMany({
      where: { active: true },
      select: {
        id: true,
        name: true,
        slug: true,
        logo: true,
        active: true,
      },
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

