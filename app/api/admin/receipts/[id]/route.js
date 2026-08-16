import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { checkAuth } from "@/lib/auth";

export async function GET(request, { params }) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const receiptId = parseInt(id);

    const receipt = await prisma.receipt.findUnique({
      where: { id: receiptId },
      include: {
        customer: { select: { id: true, name: true, phone: true, email: true } },
        app: { select: { id: true, name: true, slug: true } },
        paymentAccount: true,
      },
    });

    if (!receipt) {
      return NextResponse.json({ error: "Receipt not found" }, { status: 404 });
    }

    return NextResponse.json(receipt);
  } catch (error) {
    console.error("Failed to fetch receipt:", error);
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
    const receiptId = parseInt(id);
    const {
      customerName,
      phone,
      email,
      appId,
      projectName,
      price,
      paymentMethod,
      paymentAccountId,
      currency,
      issueDate,
      notes,
    } = await request.json();

    const existing = await prisma.receipt.findUnique({ where: { id: receiptId } });
    if (!existing) {
      return NextResponse.json({ error: "Receipt not found" }, { status: 404 });
    }

    const data = {};

    // Handle customer by name
    if (customerName !== undefined) {
      const name = (customerName || "").trim();
      if (!name) {
        return NextResponse.json(
          { error: "Customer name is required" },
          { status: 400 }
        );
      }
      let customer = await prisma.customer.findFirst({
        where: { name: { equals: name } },
      });
      if (!customer) {
        customer = await prisma.customer.create({
          data: {
            name,
            phone: phone ? String(phone).trim() : null,
            email: email ? String(email).trim() : null,
          },
        });
      } else {
        const cdata = {};
        if (phone && !customer.phone) cdata.phone = String(phone).trim();
        if (email && !customer.email) cdata.email = String(email).trim();
        if (Object.keys(cdata).length > 0) {
          customer = await prisma.customer.update({
            where: { id: customer.id },
            data: cdata,
          });
        }
      }
      data.customerId = customer.id;
    }

    if (appId !== undefined) {
      const appIdNum = appId ? parseInt(appId) : null;
      if (appIdNum) {
        const app = await prisma.app.findUnique({ where: { id: appIdNum } });
        if (!app) {
          return NextResponse.json(
            { error: "Application not found" },
            { status: 404 }
          );
        }
        data.appId = appIdNum;
      } else {
        data.appId = null;
      }
    }

    if (price !== undefined) {
      const priceVal = parseFloat(price) || 0;
      data.price = priceVal;
      data.amountPaid = priceVal;
      data.remaining = 0;
    }
    if (paymentMethod !== undefined) data.paymentMethod = paymentMethod;
    if (paymentAccountId !== undefined)
      data.paymentAccountId = paymentAccountId
        ? parseInt(paymentAccountId)
        : null;
    if (currency !== undefined) data.currency = currency;
    if (issueDate !== undefined) data.issueDate = new Date(issueDate);
    if (notes !== undefined) data.notes = notes;

    const updated = await prisma.receipt.update({
      where: { id: receiptId },
      data,
      include: {
        customer: { select: { id: true, name: true, phone: true, email: true } },
        app: { select: { id: true, name: true, slug: true } },
        paymentAccount: true,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Failed to update receipt:", error);
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
    const receiptId = parseInt(id);

    await prisma.receipt.delete({ where: { id: receiptId } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete receipt:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
