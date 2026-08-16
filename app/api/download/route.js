import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const runtime = "nodejs";

function parseGithubReleaseUrl(url) {
  if (!url || typeof url !== "string") return null;

  let parsed;
  try {
    parsed = new URL(url.trim());
  } catch {
    return null;
  }

  if (parsed.protocol !== "https:" || parsed.hostname !== "github.com") {
    return null;
  }

  const pathname = parsed.pathname.replace(/\/+$/, "");

  const releaseTagMatch = pathname.match(
    /^\/[^\/]+\/[^\/]+\/releases\/tag\/([^\/?#]+)$/
  );
  if (releaseTagMatch) {
    const segments = pathname.split("/");
    const owner = segments[1];
    const repo = segments[2];
    const tag = decodeURIComponent(releaseTagMatch[1]);
    return { type: "release-page", owner, repo, tag };
  }

  const releaseDownloadMatch = pathname.match(
    /^\/[^\/]+\/[^\/]+\/releases\/download\/([^\/?#]+)\/(.+)$/
  );
  if (releaseDownloadMatch) {
    const segments = pathname.split("/");
    const owner = segments[1];
    const repo = segments[2];
    const tag = decodeURIComponent(releaseDownloadMatch[1]);
    const filename = decodeURIComponent(releaseDownloadMatch[2]);
    return { type: "direct-asset", owner, repo, tag, filename };
  }

  return null;
}

async function fetchWithTimeout(url, options = {}, timeoutMs = 15000) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      cache: "no-store",
    });
    return response;
  } finally {
    clearTimeout(timeout);
  }
}

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { appSlug, version, license: code } = body;
    console.log("[DOWNLOAD] REQUEST RECEIVED", {
      appSlug,
      version,
      license: code ? String(code).slice(0, 6) + "..." : null,
    });

    if (!appSlug || !version || !code) {
      return NextResponse.json(
        { error: "Application, version and license code are required." },
        { status: 400 }
      );
    }

    const app = await prisma.app.findUnique({
      where: { slug: String(appSlug).trim().toLowerCase() },
    });
    console.log("[DOWNLOAD] APP LOOKUP", app ? { id: app.id, slug: app.slug, active: app.active } : "NOT FOUND");
    if (!app?.active) {
      return NextResponse.json(
        { error: "Application not found." },
        { status: 404 }
      );
    }

    const versionModel = await prisma.appVersion.findFirst({
      where: { appId: app.id, version: String(version).trim() },
    });
    console.log(
      "[DOWNLOAD] VERSION LOOKUP",
      versionModel
        ? { id: versionModel.id, version: versionModel.version, downloadUrl: versionModel.downloadUrl }
        : "NOT FOUND"
    );
    if (!versionModel) {
      return NextResponse.json(
        { error: "Version not found for this application." },
        { status: 404 }
      );
    }

    const lic = await prisma.license.findUnique({
      where: { code: String(code).trim() },
    });
    console.log(
      "[DOWNLOAD] LICENSE LOOKUP",
      lic
        ? { id: lic.id, status: lic.status, appId: lic.appId, versionId: lic.versionId, expiresAt: lic.expiresAt }
        : "NOT FOUND"
    );
    if (!lic || lic.appId !== app.id) {
      return NextResponse.json(
        { error: "Invalid license code for this application." },
        { status: 400 }
      );
    }
    if (lic.versionId && lic.versionId !== versionModel.id) {
      return NextResponse.json(
        { error: "This license is locked to a different application version." },
        { status: 400 }
      );
    }
    if (lic.version && lic.version !== versionModel.version) {
      return NextResponse.json(
        { error: "This license is locked to a different application version." },
        { status: 400 }
      );
    }
    if (lic.status !== "UNUSED") {
      return NextResponse.json(
        { error: "This license has already been used or is no longer valid." },
        { status: 400 }
      );
    }
    if (lic.paymentStatus !== "PAID") {
      return NextResponse.json(
        { error: "Payment for this license has not been completed." },
        { status: 400 }
      );
    }
    if (lic.expiresAt && lic.expiresAt < new Date()) {
      return NextResponse.json(
        { error: "This license has expired. Please contact support." },
        { status: 400 }
      );
    }

    const downloadUrl = versionModel.downloadUrl;
    console.log("[DOWNLOAD] DOWNLOAD URL", downloadUrl);

    if (!downloadUrl || downloadUrl === "#") {
      return NextResponse.json(
        { error: "No download URL is configured for this version." },
        { status: 502 }
      );
    }

    const parsed = parseGithubReleaseUrl(downloadUrl);
    console.log(
      "[DOWNLOAD] GITHUB RESOLUTION",
      parsed
        ? { type: parsed.type, owner: parsed.owner, repo: parsed.repo, tag: parsed.tag }
        : "NON-GITHUB URL"
    );

    let authorizedUrl = downloadUrl;
    let filename =
      parsed?.filename ||
      `${app.slug || "application"}-v${versionModel.version}.download`;

    if (!parsed) {
      console.log("[DOWNLOAD] NON-GITHUB URL, returning directly");
    } else if (parsed.type === "direct-asset") {
      console.log("[DOWNLOAD] DIRECT ASSET URL, returning directly");
      authorizedUrl = downloadUrl;
      filename = parsed.filename || filename;
    } else {
      const githubToken = process.env.GITHUB_TOKEN || "";
      const githubHeaders = {
        Accept: "application/vnd.github+json",
        "User-Agent": "Pashto-DevZone-Downloader",
        ...(githubToken ? { Authorization: `Bearer ${githubToken}` } : {}),
      };

      const apiUrl = `https://api.github.com/repos/${encodeURIComponent(parsed.owner)}/${encodeURIComponent(parsed.repo)}/releases/tags/${encodeURIComponent(parsed.tag)}`;
      console.log("[DOWNLOAD] GITHUB API URL", apiUrl);

      const releaseRes = await fetchWithTimeout(apiUrl, {
        headers: githubHeaders,
      });
      console.log("[DOWNLOAD] GITHUB API STATUS", releaseRes.status);

      if (releaseRes.status === 404) {
        console.log("[DOWNLOAD] GITHUB RELEASE 404");
        return NextResponse.json(
          {
            error: `GitHub release ${parsed.tag} was not found in ${parsed.owner}/${parsed.repo}.`,
          },
          { status: 502 }
        );
      }

      if (releaseRes.status === 401 || releaseRes.status === 403) {
        console.log("[DOWNLOAD] GITHUB AUTH ERROR");
        return NextResponse.json(
          { error: "Unable to access the GitHub release. Authentication may be required." },
          { status: 502 }
        );
      }

      if (releaseRes.status === 429) {
        console.log("[DOWNLOAD] GITHUB RATE LIMIT");
        return NextResponse.json(
          { error: "GitHub API rate limit exceeded. Please try again later." },
          { status: 502 }
        );
      }

      if (!releaseRes.ok) {
        console.log("[DOWNLOAD] GITHUB API ERROR");
        const text = await releaseRes.text().catch(() => "");
        console.error("[DOWNLOAD] GITHUB API ERROR BODY:", text.slice(0, 500));
        return NextResponse.json(
          { error: "Unable to access the GitHub release." },
          { status: 502 }
        );
      }

      let releaseData;
      try {
        releaseData = await releaseRes.json();
      } catch {
        return NextResponse.json(
          { error: "Invalid response from GitHub release API." },
          { status: 502 }
        );
      }
      console.log("[DOWNLOAD] RELEASE DATA", releaseData.tag_name);

      const assets = Array.isArray(releaseData.assets) ? releaseData.assets : [];
      console.log(
        "[DOWNLOAD] ASSETS",
        assets.length,
        assets.map((a) => a.name)
      );

      const ignoredExts = /\.(txt|md|json|pdf|sig|sha256|sha512|asc|gitignore|yml|yaml|xml)$/i;
      const candidates = assets.filter((item) => !ignoredExts.test(item.name));

      let asset = null;
      if (candidates.length === 1) {
        asset = candidates[0];
      } else if (candidates.length > 1) {
        return NextResponse.json(
          {
            error: "This GitHub release contains multiple downloadable assets and the correct application file cannot be determined automatically. Please contact support or use a direct asset URL.",
          },
          { status: 502 }
        );
      } else if (assets.length === 1) {
        asset = assets[0];
      }

      console.log("[DOWNLOAD] SELECTED ASSET", asset?.name);

      if (!asset) {
        return NextResponse.json(
          {
            error: "The GitHub release exists, but no downloadable application asset was found.",
          },
          { status: 502 }
        );
      }

      authorizedUrl = asset.browser_download_url;
      filename = asset.name || filename;
    }

    console.log("[DOWNLOAD] AUTHORIZED", {
      filename,
      downloadUrl: authorizedUrl,
    });

    const ua = request.headers.get("user-agent") || "";
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "";

    const claimed = await prisma.$transaction(async (tx) => {
      const updated = await tx.license.updateMany({
        where: { id: lic.id, status: "UNUSED" },
        data: {
          status: "USED",
          usedAt: new Date(),
          downloadCount: { increment: 1 },
        },
      });
      if (updated.count !== 1) return false;
      await tx.downloadLog.create({
        data: {
          customerId: lic.customerId || null,
          licenseId: lic.id,
          appId: app.id,
          versionId: versionModel.id,
          version: versionModel.version,
          browser: "Unknown",
          os: "Unknown",
          deviceType: "Unknown",
          ip,
        },
      });
      return true;
    });

    if (!claimed) {
      console.log("[DOWNLOAD] LICENSE ALREADY USED");
      return NextResponse.json(
        { error: "This license has already been used." },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        downloadUrl: authorizedUrl,
        filename,
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store, private",
        },
      }
    );
  } catch (error) {
    console.error("[DOWNLOAD] FATAL ERROR:", error);
    return NextResponse.json(
      { error: error.message || "The application download asset is unavailable." },
      { status: 502 }
    );
  }
}
