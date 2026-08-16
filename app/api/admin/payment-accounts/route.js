import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { checkAuth } from "@/lib/auth";

export async function GET(request) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const accounts = await prisma.paymentAccount.findMany({
      orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
    });
    return NextResponse.json(accounts);
  } catch (error) {
    console.error("Failed to fetch payment accounts:", error);
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
      accountName,
      bankType,
      accountHolder,
      iban,
      accountNumber,
      phone,
      branch,
      active,
      isDefault,
    } = await request.json();

    if (!accountName || !accountName.trim()) {
      return NextResponse.json(
        { error: "Account name is required" },
        { status: 400 }
      );
    }

    // Duplicate account prevention
    const dup = await prisma.paymentAccount.findFirst({
      where: {
        OR: [
          { accountName: accountName.trim() },
          ...(iban ? [{ iban }] : []),
          ...(accountNumber ? [{ accountNumber }] : []),
        ],
      },
    });
    if (dup) {
      return NextResponse.json(
        { error: "A payment account with this name, IBAN or account number already exists" },
        { status: 400 }
      );
    }

    // If setting as default, unset others
    if (isDefault) {
      await prisma.paymentAccount.updateMany({
        where: { isDefault: true },
        data: { isDefault: false },
      });
    }

    const account = await prisma.paymentAccount.create({
      data: {
        accountName: accountName.trim(),
        bankType: bankType || "BANK",
        accountHolder: accountHolder || null,
        iban: iban || null,
        accountNumber: accountNumber || null,
        phone: phone || null,
        branch: branch || null,
        active: active !== undefined ? active : true,
        isDefault: isDefault || false,
      },
    });

    return NextResponse.json(account, { status: 201 });
  } catch (error) {
    console.error("Failed to create payment account:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
