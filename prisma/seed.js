const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  // Create admin user
  const hashedPassword = await bcrypt.hash("admin123", 10);
  await prisma.admin.upsert({
    where: { username: "admin" },
    update: {},
    create: {
      username: "admin",
      password: hashedPassword,
    },
  });

  console.log("Seeded admin user: admin / admin123");

  // Seed sample customer
  const customer = await prisma.customer.upsert({
    where: { id: 1 },
    update: {},
    create: {
      name: "Sample Customer",
      phone: "03245020658",
      whatsapp: "03245020658",
      email: "customer@example.com",
      country: "Pakistan",
      city: "Peshawar",
      company: "Sample Company",
      notes: "Sample customer seeded for testing.",
    },
  });

  console.log("Seeded sample customer:", customer.name);

  // ---- Tailor Management System (tms) ----
  const tms = await prisma.app.upsert({
    where: { slug: "tms" },
    update: {
      name: "Tailor Management System",
      shortDescription:
        "Complete desktop software to manage tailor shops, orders, measurements, and billing all in one place.",
      category: "Business / Desktop",
      developer: "Pashto DevZone",
      description: `# Tailor Management System

Manage your entire tailor shop with ease. This **desktop application** helps you track orders, customer measurements, fabrics, and billing.

## Features

- Order tracking with statuses
- Customer measurement profiles
- Fabric inventory management
- Receipts and billing
- Daily sales reports

## Why Choose TMS?

- Works offline
- Fast and lightweight
- Simple to use
- Regular updates`,
      features: JSON.stringify([
        "Order tracking with statuses",
        "Customer measurement profiles",
        "Fabric inventory management",
        "Automatic receipts and billing",
        "Daily sales & profit reports",
        "Offline desktop support",
      ]),
      screenshots: JSON.stringify([
        "/uploads/apps/tms-1.png",
        "/uploads/apps/tms-2.png",
        "/uploads/apps/tms-3.png",
      ]),
      systemRequirements: JSON.stringify({
        ram: "2 GB",
        cpu: "Dual core 1.5 GHz",
        os: "Windows 7 / 8 / 10 / 11",
        storage: "500 MB",
      }),
      logo: "/tms-logo.ico",
      active: true,
    },
    create: {
      name: "Tailor Management System",
      slug: "tms",
      shortDescription:
        "Complete desktop software to manage tailor shops, orders, measurements, and billing all in one place.",
      category: "Business / Desktop",
      developer: "Pashto DevZone",
      description: `# Tailor Management System

Manage your entire tailor shop with ease. This **desktop application** helps you track orders, customer measurements, fabrics, and billing.

## Features

- Order tracking with statuses
- Customer measurement profiles
- Fabric inventory management
- Receipts and billing
- Daily sales reports

## Why Choose TMS?

- Works offline
- Fast and lightweight
- Simple to use
- Regular updates`,
      features: JSON.stringify([
        "Order tracking with statuses",
        "Customer measurement profiles",
        "Fabric inventory management",
        "Automatic receipts and billing",
        "Daily sales & profit reports",
        "Offline desktop support",
      ]),
      screenshots: JSON.stringify([
        "/uploads/apps/tms-1.png",
        "/uploads/apps/tms-2.png",
        "/uploads/apps/tms-3.png",
      ]),
      systemRequirements: JSON.stringify({
        ram: "2 GB",
        cpu: "Dual core 1.5 GHz",
        os: "Windows 7 / 8 / 10 / 11",
        storage: "500 MB",
      }),
      logo: "/tms-logo.ico",
      active: true,
      versions: {
        create: [
          {
            version: "1.3.0",
            latest: true,
            downloadUrl: "#",
            size: "48 MB",
            releaseDate: new Date("2026-08-01"),
            releaseNotes: `## What's New in 1.3.0

- Added dark mode support
- Improved billing report export to PDF
- Faster order search
- Bug fixes` ,
          },
          {
            version: "1.2.0",
            latest: false,
            downloadUrl: "#",
            size: "45 MB",
            releaseDate: new Date("2026-06-15"),
            releaseNotes: `## What's New in 1.2.0

- Added fabric inventory module
- Fixed receipt numbering
- Performance improvements`,
          },
        ],
      },
    },
  });

  console.log("Seeded application:", tms.name);

  // Keep the seeded latest version pointed at the real release page. The
  // download endpoint resolves its binary asset server-side.
  await prisma.appVersion.updateMany({
    where: { appId: tms.id, version: "1.3.0" },
    data: {
      downloadUrl:
        "https://github.com/ADgroupofcompanies/pashto-devzone/releases/tag/v1.3.0",
    },
  });

  // ---- AI Assistant (ai) ----
  const ai = await prisma.app.upsert({
    where: { slug: "ai" },
    update: {
      name: "AI Assistant",
      shortDescription:
        "A smart desktop AI assistant to help you write, search, and automate daily tasks with a friendly chat interface.",
      category: "Productivity / AI",
      developer: "Pashto DevZone",
      description: `# AI Assistant

Meet your personal **AI Assistant** for desktop. Interact naturally, get instant answers, and automate repetitive work.

## Highlights

- Natural language chat
- Quick text generation
- Smart autocomplete
- Multi-language support

## Perfect For

- Writers and students
- Office automation
- Quick research`,
      features: JSON.stringify([
        "Natural language chat",
        "Instant text generation",
        "Smart autocomplete",
        "Multi-language support",
        "Shortcut automation",
        "Local-first privacy",
      ]),
      screenshots: JSON.stringify([
        "/uploads/apps/ai-1.png",
        "/uploads/apps/ai-2.png",
      ]),
      systemRequirements: JSON.stringify({
        ram: "4 GB",
        cpu: "Quad core 2.0 GHz",
        os: "Windows 10 / 11",
        storage: "1 GB",
      }),
      logo: "/parizad.png",
      active: true,
    },
    create: {
      name: "AI Assistant",
      slug: "ai",
      shortDescription:
        "A smart desktop AI assistant to help you write, search, and automate daily tasks with a friendly chat interface.",
      category: "Productivity / AI",
      developer: "Pashto DevZone",
      description: `# AI Assistant

Meet your personal **AI Assistant** for desktop. Interact naturally, get instant answers, and automate repetitive work.

## Highlights

- Natural language chat
- Quick text generation
- Smart autocomplete
- Multi-language support

## Perfect For

- Writers and students
- Office automation
- Quick research`,
      features: JSON.stringify([
        "Natural language chat",
        "Instant text generation",
        "Smart autocomplete",
        "Multi-language support",
        "Shortcut automation",
        "Local-first privacy",
      ]),
      screenshots: JSON.stringify([
        "/uploads/apps/ai-1.png",
        "/uploads/apps/ai-2.png",
      ]),
      systemRequirements: JSON.stringify({
        ram: "4 GB",
        cpu: "Quad core 2.0 GHz",
        os: "Windows 10 / 11",
        storage: "1 GB",
      }),
      logo: "/parizad.png",
      active: true,
      versions: {
        create: [
          {
            version: "2.1.0",
            latest: true,
            downloadUrl: "#",
            size: "120 MB",
            releaseDate: new Date("2026-07-20"),
            releaseNotes: `## What's New in 2.1.0

- New voice input support
- Improved chat memory
- Faster response times`,
          },
          {
            version: "2.0.0",
            latest: false,
            downloadUrl: "#",
            size: "110 MB",
            releaseDate: new Date("2026-05-10"),
            releaseNotes: `## What's New in 2.0.0

- Completely redesigned UI
- Added multi-language support`,
          },
        ],
      },
    },
  });

  console.log("Seeded application:", ai.name);

// ---- Khan AI (khan) ----
  const khan = await prisma.app.upsert({
    where: { slug: "khan" },
    update: {
      name: "Khan AI",
      shortDescription:
        "A powerful AI assistant for Pashto and Urdu speakers that helps with writing, translation, study, and everyday productivity.",
      category: "Productivity / AI",
      developer: "Pashto DevZone",
      description: `# Khan AI

**Khan AI** is a smart desktop assistant designed for Pashto and Urdu speakers. It helps you write, translate, study, and automate daily tasks with a friendly local-first interface.

## Features

- Pashto & Urdu language support
- AI-powered writing assistant
- Instant translation
- Study & homework helper
- Offline privacy-first design

## Why Khan AI?

- Built for local languages
- Fast and lightweight
- Simple to use
- Regular updates`,
      features: JSON.stringify([
        "Pashto & Urdu language support",
        "AI-powered writing assistant",
        "Instant translation",
        "Study & homework helper",
        "Offline privacy-first design",
        "Shortcut automation",
      ]),
      screenshots: JSON.stringify([]),
      systemRequirements: JSON.stringify({
        ram: "4 GB",
        cpu: "Dual core 2.0 GHz",
        os: "Windows 10 / 11",
        storage: "800 MB",
      }),
      logo: "/parizad.png",
      active: true,
    },
    create: {
      name: "Khan AI",
      slug: "khan",
      shortDescription:
        "A powerful AI assistant for Pashto and Urdu speakers that helps with writing, translation, study, and everyday productivity.",
      category: "Productivity / AI",
      developer: "Pashto DevZone",
      description: `# Khan AI

**Khan AI** is a smart desktop assistant designed for Pashto and Urdu speakers. It helps you write, translate, study, and automate daily tasks with a friendly local-first interface.

## Features

- Pashto & Urdu language support
- AI-powered writing assistant
- Instant translation
- Study & homework helper
- Offline privacy-first design

## Why Khan AI?

- Built for local languages
- Fast and lightweight
- Simple to use
- Regular updates`,
      features: JSON.stringify([
        "Pashto & Urdu language support",
        "AI-powered writing assistant",
        "Instant translation",
        "Study & homework helper",
        "Offline privacy-first design",
        "Shortcut automation",
      ]),
      screenshots: JSON.stringify([]),
      systemRequirements: JSON.stringify({
        ram: "4 GB",
        cpu: "Dual core 2.0 GHz",
        os: "Windows 10 / 11",
        storage: "800 MB",
      }),
      logo: "/parizad.png",
      active: true,
      versions: {
        create: [
          {
            version: "1.0.0",
            latest: true,
            downloadUrl: "#",
            size: "95 MB",
            releaseDate: new Date("2026-08-10"),
            releaseNotes: `## Welcome to Khan AI 1.0.0

- Initial release
- Pashto & Urdu support
- AI writing and translation`,
          },
        ],
      },
    },
  });

  console.log("Seeded application:", khan.name);

  // Ensure each app (TMS, AI, Khan) has a PAID/unused license for the latest
  // version so the public download flow is fully testable.
  const appsToLicense = [
    { app: tms, prefix: "pdz.tms" },
    { app: ai, prefix: "pdz.ai" },
    { app: khan, prefix: "pdz.khan" },
  ];

  for (const { app: appItem, prefix } of appsToLicense) {
    const latestVersion = await prisma.appVersion.findFirst({
      where: { appId: appItem.id, latest: true },
    });
    if (!latestVersion) continue;

    const existingPaid = await prisma.license.findFirst({
      where: { appId: appItem.id, paymentStatus: "PAID", status: "UNUSED" },
    });
    if (!existingPaid) {
      await prisma.license.create({
        data: {
          code: `${prefix}.${Math.floor(10000 + Math.random() * 90000)}`,
          customerId: customer.id,
          appId: appItem.id,
          versionId: latestVersion.id,
          version: latestVersion.version,
          status: "UNUSED",
          paymentStatus: "PAID",
          generatedBy: "seed",
          expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        },
      });
      console.log(`Seeded a PAID license for ${appItem.slug} latest version`);
    } else {
      console.log(`PAID license already exists for ${appItem.slug}`);
    }
  }
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
