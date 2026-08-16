import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { checkAuth } from "@/lib/auth";

export async function PUT(request, { params }) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const accountId = parseInt(id);
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

    const existing = await prisma.paymentAccount.findUnique({
      where: { id: accountId },
    });
    if (!existing) {
      return NextResponse.json(
        { error: "Payment account not found" },
        { status: 404 }
      );
    }

    if (accountName) {
      const dup = await prisma.paymentAccount.findFirst({
        where: {
          OR: [
            { accountName: accountName.trim() },
            ...(iban ? [{ iban }] : []),
            ...(accountNumber ? [{ accountNumber }] : []),
          ],
          NOT: { id: accountId },
        },
      });
      if (dup) {
        return NextResponse.json(
          { error: "A payment account with this name, IBAN or account number already exists" },
          { status: 400 }
        );
      }
    }

    if (isDefault) {
      await prisma.paymentAccount.updateMany({
        where: { isDefault: true },
        data: { isDefault: false },
      });
    }

    const data = {};
    if (accountName !== undefined) data.accountName = accountName.trim();
    if (bankType !== undefined) data.bankType = bankType;
    if (accountHolder !== undefined) data.accountHolder = accountHolder;
    if (iban !== undefined) data.iban = iban;
    if (accountNumber !== undefined) data.accountNumber = accountNumber;
    if (phone !== undefined) data.phone = phone;
    if (branch !== undefined) data.branch = branch;
    if (active !== undefined) data.active = active;
    if (isDefault !== undefined) data.isDefault = isDefault;

    const updated = await prisma.paymentAccount.update({
      where: { id: accountId },
      data,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Failed to update payment account:", error);
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
    const accountId = parseInt(id);

    const existing = await prisma.paymentAccount.findUnique({
      where: { id: accountId },
      include: { _count: { select: { receipts: true } } },
    });
    if (!existing) {
      return NextResponse.json(
        { error: "Payment account not found" },
        { status: 404 }
      );
    }

    if (existing._count.receipts > 0) {
      return NextResponse.json(
        {
          error: `Cannot delete account used by ${existing._count.receipts} receipt(s).`,
          hasReceipts: true,
          receiptCount: existing._count.receipts,
        },
        { status: 400 }
      );
    }

await prisma.paymentAccount.delete({ where: { id: accountId } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete payment account:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
