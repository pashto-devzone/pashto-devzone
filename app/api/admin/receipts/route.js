import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { checkAuth } from "@/lib/auth";

// Generate next sequential receipt number: PDZ-YYYYMMDD-0001
async function generateReceiptNumber() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  const datePrefix = `PDZ-${y}${m}${d}-`;

  // Find the highest sequence for today
  const lastReceipt = await prisma.receipt.findFirst({
    where: { receiptNumber: { startsWith: datePrefix } },
    orderBy: { receiptNumber: "desc" },
  });

  let seq = 1;
  if (lastReceipt) {
    const lastSeq = parseInt(lastReceipt.receiptNumber.slice(datePrefix.length), 10);
    if (!isNaN(lastSeq)) seq = lastSeq + 1;
  }

  return `${datePrefix}${String(seq).padStart(4, "0")}`;
}

// Find or create a customer by name (and optionally phone/email)
async function findOrCreateCustomer({ name, phone, email }) {
  const trimmedName = (name || "").trim();
  if (!trimmedName) {
    throw new Error("Customer name is required");
  }

  // Try to find by name
  let customer = await prisma.customer.findFirst({
    where: { name: { equals: trimmedName } },
  });

  if (!customer) {
    customer = await prisma.customer.create({
      data: {
        name: trimmedName,
        phone: phone ? String(phone).trim() : null,
        email: email ? String(email).trim() : null,
      },
    });
  } else {
    // Update missing contact info if provided
    const data = {};
    if (phone && !customer.phone) data.phone = String(phone).trim();
    if (email && !customer.email) data.email = String(email).trim();
    if (Object.keys(data).length > 0) {
      customer = await prisma.customer.update({
        where: { id: customer.id },
        data,
      });
    }
  }

  return customer;
}

export async function GET(request) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const receipts = await prisma.receipt.findMany({
      include: {
        customer: { select: { id: true, name: true, phone: true, email: true } },
        app: { select: { id: true, name: true, slug: true } },
        paymentAccount: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(receipts);
  } catch (error) {
    console.error("Failed to fetch receipts:", error);
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

    const name = (customerName || "").trim();
    const project = (projectName || "").trim();
    const appIdNum = appId ? parseInt(appId) : null;

    if (!name) {
      return NextResponse.json(
        { error: "Customer name is required" },
        { status: 400 }
      );
    }

    // Validation: require either an application OR a project name
    if (!appIdNum && !project) {
      return NextResponse.json(
        { error: "Select an application or enter a project name" },
        { status: 400 }
      );
    }

    // If app selected, verify it exists
    let app = null;
    if (appIdNum) {
      app = await prisma.app.findUnique({ where: { id: appIdNum } });
      if (!app) {
        return NextResponse.json(
          { error: "Application not found" },
          { status: 404 }
        );
      }
    }

    const customer = await findOrCreateCustomer({ name, phone, email });

    const number = await generateReceiptNumber();
    const priceVal = parseFloat(price) || 0;

    const receipt = await prisma.receipt.create({
      data: {
        receiptNumber: number,
        customerId: customer.id,
        appId: app ? app.id : null,
        projectName: project || null,
        price: priceVal,
        amountPaid: priceVal,
        remaining: 0,
        paymentType: "FULL",
        paymentMethod: paymentMethod || "Cash",
        paymentAccountId: paymentAccountId ? parseInt(paymentAccountId) : null,
        currency: currency || "PKR",
        issueDate: issueDate ? new Date(issueDate) : new Date(),
        notes: notes || null,
      },
      include: {
        customer: { select: { id: true, name: true, phone: true, email: true } },
        app: { select: { id: true, name: true, slug: true } },
        paymentAccount: true,
      },
    });

    return NextResponse.json(receipt, { status: 201 });
  } catch (error) {
    console.error("Failed to create receipt:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
