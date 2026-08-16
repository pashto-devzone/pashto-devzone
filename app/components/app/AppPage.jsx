"use client";

import React, { useState, useMemo, useCallback, useEffect } from "react";
import Link from "next/link";
import {
  FaDownload,
  FaCalendarAlt,
  FaDatabase,
  FaUser,
  FaChevronDown,
  FaTimes,
  FaCheckCircle,
  FaSpinner,
  FaExclamationTriangle,
  FaStar,
  FaExpand,
  FaChevronLeft,
  FaChevronRight,
  FaTools,
  FaMemory,
  FaHdd,
  FaWindows,
  FaMicrochip,
  FaLayerGroup,
  FaRocket,
  FaKey,
  FaCommentAlt,
  FaPlus,
  FaWhatsapp,
  FaTag,
  FaCogs,
  FaCheck,
  FaInfoCircle,
  FaImage,
} from "react-icons/fa";
import { renderMarkdown } from "@/lib/markdown";

function formatDate(dateStr) {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "-";
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function parseJsonArray(str) {
  if (!str) return [];
  try {
    const parsed = JSON.parse(str);
    if (Array.isArray(parsed)) return parsed;
    return [];
  } catch {
    return [];
  }
}

function parseJsonObject(str) {
  if (!str) return null;
  try {
    const parsed = JSON.parse(str);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

const requirementMeta = [
  { key: "os", label: "Operating System", icon: FaWindows },
  { key: "ram", label: "RAM", icon: FaMemory },
  { key: "storage", label: "Storage", icon: FaHdd },
  { key: "cpu", label: "Processor", icon: FaMicrochip },
  { key: "processor", label: "Processor", icon: FaMicrochip },
  { key: "other", label: "Other Requirements", icon: FaCogs },
  { key: "otherRequirements", label: "Other Requirements", icon: FaCogs },
  { key: "graphics", label: "Graphics", icon: FaCogs },
];

const WHATSAPP_NUMBER = "923245020658";

export default function AppPage({ app, related = [] }) {
  const [selectedVersion, setSelectedVersion] = useState(null);
  const [showLicenseModal, setShowLicenseModal] = useState(false);
  const [licenseCode, setLicenseCode] = useState("");
  const [licenseError, setLicenseError] = useState("");
  const [licenseLoading, setLicenseLoading] = useState(false);
  const [downloadState, setDownloadState] = useState("idle");
  const [downloadError, setDownloadError] = useState("");
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [activeScreenshot, setActiveScreenshot] = useState(0);

  // Reviews state
  const [reviews, setReviews] = useState([]);
  const [reviewCount, setReviewCount] = useState(0);
  const [reviewAverage, setReviewAverage] = useState(0);
  const [reviewLoading, setReviewLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewName, setReviewName] = useState("");
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [reviewSubmitLoading, setReviewSubmitLoading] = useState(false);
  const [reviewError, setReviewError] = useState("");
  const [reviewSuccess, setReviewSuccess] = useState("");

  const versions = useMemo(() => app.versions || [], [app]);

  // Select latest version automatically
  useEffect(() => {
    if (versions.length > 0) {
      const latest = versions.find((v) => v.latest) || versions[0];
      setSelectedVersion(latest);
      setActiveScreenshot(0);
    }
  }, [versions]);

  const screenshots = useMemo(() => parseJsonArray(app.screenshots), [app]);
  const features = useMemo(() => parseJsonArray(app.features), [app]);
  const requirementsRaw = useMemo(() => parseJsonObject(app.systemRequirements), [app]);
  const requirements = requirementsRaw || {};

  const currentVersion = selectedVersion || versions[0] || null;
  const hasMultipleVersions = versions.length > 1;
  const hasDescription = !!app.description;
  const noVersions = versions.length === 0;

  // Build a clean list of requirement entries (only those with data)
  const requirementEntries = useMemo(() => {
    const entries = [];
    for (const meta of requirementMeta) {
      const val = requirements[meta.key];
      if (val && String(val).trim() !== "") {
        entries.push({ label: meta.label, value: String(val), icon: meta.icon });
      }
    }
    return entries;
  }, [requirements]);

  // Handle download flow
  const handleDownload = useCallback(() => {
    if (!currentVersion) return;
    setLicenseCode("");
    setLicenseError("");
    setDownloadError("");
    setDownloadState("idle");
    setShowLicenseModal(true);
  }, [currentVersion]);

  const handleCancel = useCallback(() => {
    setShowLicenseModal(false);
    setLicenseCode("");
    setLicenseError("");
    setDownloadState("idle");
  }, []);

  const handleVerifyAndDownload = useCallback(async () => {
    if (!currentVersion || !licenseCode.trim()) {
      setLicenseError("Please enter your license code.");
      return;
    }

    setLicenseLoading(true);
    setLicenseError("");
    setDownloadError("");
    setDownloadState("preparing");

    try {
      const res = await fetch("/api/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          appSlug: app.slug,
          version: currentVersion.version,
          license: licenseCode.trim(),
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setDownloadState("error");
        setDownloadError(data.error || "Invalid license code.");
        setLicenseLoading(false);
        setShowLicenseModal(false);
        return;
      }

      const data = await res.json();
      if (!data.success || !data.downloadUrl) {
        setDownloadState("error");
        setDownloadError(data.error || "Download authorization failed.");
        setLicenseLoading(false);
        setShowLicenseModal(false);
        return;
      }

      setDownloadState("verifying");
      setLicenseLoading(false);
      setShowLicenseModal(false);

      await new Promise((r) => setTimeout(r, 400));
      setDownloadState("starting");

      const link = document.createElement("a");
      link.href = data.downloadUrl;
      link.download = data.filename || "download";
      link.rel = "noopener noreferrer";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setDownloadState("success");
    } catch (err) {
      console.error("Download error:", err);
      setDownloadState("error");
      setDownloadError(err.message || "Download service is unavailable. Please try again later.");
      setLicenseLoading(false);
      setShowLicenseModal(false);
    }
  }, [app.slug, currentVersion, licenseCode]);

  const handleVersionChange = useCallback(
    (e) => {
      const v = versions.find((ver) => ver.id === Number(e.target.value));
      if (v) {
        setSelectedVersion(v);
        setActiveScreenshot(0);
      }
    },
    [versions]
  );

  const closeLightbox = useCallback(() => setLightboxIndex(null), []);
  const prevScreenshot = useCallback(() => {
    setLightboxIndex((i) =>
      (i - 1 + screenshots.length) % Math.max(screenshots.length, 1)
    );
  }, [screenshots]);
  const nextScreenshot = useCallback(() => {
    setLightboxIndex((i) => (i + 1) % Math.max(screenshots.length, 1));
  }, [screenshots]);

  // Load reviews for this app
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/app/${app.slug}/reviews`);
        const d = await res.json();
        if (!cancelled && res.ok) {
          setReviews(d.reviews || []);
          setReviewCount(d.count || 0);
          setReviewAverage(d.average || 0);
        }
      } catch {
        // ignore review load errors
      } finally {
        if (!cancelled) setReviewLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [app.slug]);

  const handleReviewSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      setReviewError("");
      setReviewSuccess("");

      if (!reviewName.trim() || reviewName.trim().length < 2) {
        setReviewError("Please enter your name (min 2 characters).");
        return;
      }
      if (
        !Number.isInteger(Number(reviewRating)) ||
        Number(reviewRating) < 1 ||
        Number(reviewRating) > 5
      ) {
        setReviewError("Please select a rating between 1 and 5 stars.");
        return;
      }
      if (!reviewText.trim() || reviewText.trim().length < 5) {
        setReviewError("Please write a review (min 5 characters).");
        return;
      }

      setReviewSubmitLoading(true);
      try {
        const res = await fetch(`/api/app/${app.slug}/reviews`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: reviewName.trim(),
            rating: Number(reviewRating),
            review: reviewText.trim(),
          }),
        });
        const d = await res.json();
        if (!res.ok) {
          setReviewError(d.error || "Failed to submit review.");
          return;
        }
        setReviews(d.reviews || []);
        setReviewCount(d.count || 0);
        setReviewAverage(d.average || 0);
        setReviewName("");
        setReviewRating(0);
        setReviewText("");
        setShowReviewForm(false);
        setReviewSuccess("Thank you for your review!");
      } catch {
        setReviewError("Failed to submit review. Please try again.");
      } finally {
        setReviewSubmitLoading(false);
      }
    },
    [app.slug, reviewName, reviewRating, reviewText]
  );

  // Derived application info values
  const developer = app.developer || "Pashto DevZone";
  const fileSize = currentVersion?.size || "-";
  const released = currentVersion?.releaseDate
    ? formatDate(currentVersion.releaseDate)
    : "-";
  const category = app.category || "-";

  return (
    <div className="text-gray-800 overflow-x-hidden">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 md:py-12">
        {/* ============ HERO / DOWNLOAD CARD ============ */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6 md:p-8 mb-8">
          <div className="flex flex-col lg:flex-row items-center lg:items-center gap-8">
            {/* LEFT: icon + name/developer on one row */}
            <div className="flex-1 w-full flex items-center gap-5">
              <div className="shrink-0">
                {app.logo ? (
                  <img
                    src={app.logo}
                    alt={`${app.name} logo`}
                    className="w-20 h-20 md:w-24 md:h-24 rounded-2xl object-contain bg-white p-2 shadow-md border border-gray-100"
                  />
                ) : (
                  <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-linear-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-md">
                    <FaRocket className="text-white text-3xl" />
                  </div>
                )}
              </div>

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                    {app.name}
                  </h1>
                  {currentVersion && (
                    <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 text-xs font-semibold px-2.5 py-1 rounded-full">
                      <FaStar className="text-xs" /> Latest v{currentVersion.version}
                    </span>
                  )}
                </div>
                <p className="text-gray-600 flex items-center gap-2">
                  <FaUser className="text-green-600" />
                  <span className="font-medium text-gray-700">{developer}</span>
                </p>
                {app.shortDescription && (
                  <p className="text-gray-500 text-sm mt-2 line-clamp-2">
                    {app.shortDescription}
                  </p>
                )}
              </div>
            </div>

            {/* RIGHT: version selector + download, vertically stacked */}
            <div className="w-full lg:w-85 shrink-0 flex flex-col justify-center gap-4 border-t lg:border-t-0 lg:border-l border-gray-100 pt-6 lg:pt-0 lg:pl-8">
              {noVersions ? (
                <div className="flex w-full items-center justify-center gap-2 bg-amber-100 text-amber-700 font-semibold py-3.5 rounded-xl border border-amber-200">
                  Coming Soon
                </div>
              ) : (
                <>
                  <div>
                    <label className="block mb-1.5 text-xs font-medium uppercase tracking-wide text-gray-500">
                      Select Version
                    </label>
                    <select
                      value={currentVersion?.id || ""}
                      onChange={handleVersionChange}
                      className="w-full appearance-none border border-gray-300 bg-white rounded-lg py-2.5 pr-8 pl-3 text-sm font-medium text-gray-900 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200"
                    >
                      {versions.map((v) => (
                        <option key={v.id} value={v.id}>
                          v{v.version}
                          {v.latest ? " (Latest)" : ""}
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    onClick={handleDownload}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 py-3.5 font-semibold text-white shadow-lg transition-all hover:bg-green-700 hover:shadow-xl"
                  >
                    <FaDownload /> Download Application
                  </button>

                  <a
                    href={`https://wa.me/${WHATSAPP_NUMBER}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1.5 text-sm text-green-700 hover:text-green-800 hover:underline"
                  >
                    <FaWhatsapp className="text-green-600" />
                    Need a license code? Contact me on WhatsApp
                  </a>
                </>
              )}
            </div>
          </div>

          {/* ===== Summary info row ===== */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8 pt-6 border-t border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 shrink-0 rounded-xl bg-green-50 text-green-600 flex items-center justify-center">
                <FaUser />
              </div>
              <div className="min-w-0">
                <p className="text-xs uppercase tracking-wide text-gray-400">Developer</p>
                <p className="font-semibold text-gray-800 truncate">{developer}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 shrink-0 rounded-xl bg-green-50 text-green-600 flex items-center justify-center">
                <FaDatabase />
              </div>
              <div className="min-w-0">
                <p className="text-xs uppercase tracking-wide text-gray-400">File Size</p>
                <p className="font-semibold text-gray-800 truncate">{fileSize}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 shrink-0 rounded-xl bg-green-50 text-green-600 flex items-center justify-center">
                <FaCalendarAlt />
              </div>
              <div className="min-w-0">
                <p className="text-xs uppercase tracking-wide text-gray-400">Released</p>
                <p className="font-semibold text-gray-800 truncate">{released}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 shrink-0 rounded-xl bg-green-50 text-green-600 flex items-center justify-center">
                <FaLayerGroup />
              </div>
              <div className="min-w-0">
                <p className="text-xs uppercase tracking-wide text-gray-400">Category</p>
                <p className="font-semibold text-gray-800 truncate">{category}</p>
              </div>
            </div>
          </div>
        </div>

        {/* ============ NO VERSIONS MESSAGE ============ */}
        {noVersions && (
          <section className="mb-8">
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-center text-amber-800">
              <p className="font-medium">
                No versions are currently available for this application.
              </p>
            </div>
          </section>
        )}

        {/* ============ ABOUT APPLICATION ============ */}
        {hasDescription && (
          <section className="mb-10">
            <h2 className="mb-4 flex items-center gap-2 text-2xl font-bold text-gray-900">
              <FaInfoCircle className="text-green-600" /> About {app.name}
            </h2>
            <div className="markdown-body rounded-2xl border border-gray-100 bg-white p-6 shadow-md md:p-8">
              <div
                dangerouslySetInnerHTML={{
                  __html: renderMarkdown(app.description),
                }}
              />
            </div>
          </section>
        )}

        {/* ============ FEATURES ============ */}
        {features.length > 0 && (
          <section className="mb-10">
            <h2 className="mb-4 flex items-center gap-2 text-2xl font-bold text-gray-900">
              <FaTools className="text-green-600" /> Features
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((f, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 rounded-2xl border border-gray-100 bg-white p-5 shadow-md"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-100 text-green-700">
                    <FaCheck />
                  </div>
                  <p className="font-medium text-gray-700">{f}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ============ WHAT'S NEW (current version) ============ */}
        {currentVersion && currentVersion.releaseNotes && (
          <section className="mb-10">
            <h2 className="mb-4 flex items-center gap-2 text-2xl font-bold text-gray-900">
              <FaRocket className="text-green-600" /> What&apos;s New in v
              {currentVersion.version}
            </h2>
            <div className="markdown-body rounded-2xl border border-gray-100 bg-white p-6 shadow-md md:p-8">
              <div
                dangerouslySetInnerHTML={{
                  __html: renderMarkdown(currentVersion.releaseNotes),
                }}
              />
            </div>
          </section>
        )}

        {/* ============ SCREENSHOTS ============ */}
        {screenshots.length > 0 && (
          <section className="mb-10">
            <h2 className="mb-4 flex items-center gap-2 text-2xl font-bold text-gray-900">
              <FaImage className="text-green-600" /> Screenshots
            </h2>

            {/* Main active preview */}
            <div className="relative overflow-hidden rounded-2xl border border-gray-100 shadow-lg bg-gray-50">
              <img
                src={screenshots[activeScreenshot]}
                alt={`${app.name} screenshot ${activeScreenshot + 1}`}
                className="w-full h-64 md:h-96 object-contain"
              />
              {screenshots.length > 1 && (
                <>
                  <button
                    onClick={() =>
                      setActiveScreenshot(
                        (i) => (i - 1 + screenshots.length) % screenshots.length
                      )
                    }
                    className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 shadow backdrop-blur transition hover:bg-white"
                    aria-label="Previous screenshot"
                  >
                    <FaChevronLeft className="text-gray-700" />
                  </button>
                  <button
                    onClick={() =>
                      setActiveScreenshot((i) => (i + 1) % screenshots.length)
                    }
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 shadow backdrop-blur transition hover:bg-white"
                    aria-label="Next screenshot"
                  >
                    <FaChevronRight className="text-gray-700" />
                  </button>
                </>
              )}
              <button
                onClick={() => setLightboxIndex(activeScreenshot)}
                className="absolute bottom-2 right-2 rounded-lg bg-black/50 p-2 text-white transition hover:bg-black/70"
                aria-label="View fullscreen"
              >
                <FaExpand />
              </button>
            </div>

            {/* Thumbnails */}
            {screenshots.length > 1 && (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 mt-4">
                {screenshots.map((src, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveScreenshot(idx)}
                    className={`relative overflow-hidden rounded-lg border-2 transition ${
                      idx === activeScreenshot
                        ? "border-green-500"
                        : "border-transparent hover:border-gray-300"
                    }`}
                    aria-label={`View screenshot ${idx + 1}`}
                  >
                    <img
                      src={src}
                      alt={`${app.name} screenshot ${idx + 1}`}
                      loading="lazy"
                      className="h-16 w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </section>
        )}

        {/* ============ APPLICATION INFORMATION ============ */}
        <section className="mb-10">
          <h2 className="mb-4 flex items-center gap-2 text-2xl font-bold text-gray-900">
            <FaDatabase className="text-green-600" /> Application Information
          </h2>
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-md md:p-8">
            <div className="grid grid-cols-1 gap-6 text-sm sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                  Application
                </p>
                <p className="mt-1 font-semibold text-gray-900">{app.name}</p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                  Version
                </p>
                <p className="mt-1 font-semibold text-gray-900">
                  {currentVersion ? `v${currentVersion.version}` : "-"}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                  File Size
                </p>
                <p className="mt-1 font-semibold text-gray-900">
                  {currentVersion?.size || "-"}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                  Last Updated
                </p>
                <p className="mt-1 font-semibold text-gray-900">
                  {formatDate(currentVersion?.releaseDate)}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                  Developer
                </p>
                <p className="mt-1 font-semibold text-gray-900">{developer}</p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                  Platform
                </p>
                <p className="mt-1 font-semibold text-gray-900">
                  {requirements.os || app.category || "-"}
                </p>
              </div>
              {requirements.storage && (
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                    Storage
                  </p>
                  <p className="mt-1 font-semibold text-gray-900">
                    {requirements.storage}
                  </p>
                </div>
              )}
              {requirements.ram && (
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                    RAM
                  </p>
                  <p className="mt-1 font-semibold text-gray-900">
                    {requirements.ram}
                  </p>
                </div>
              )}
              {app.category && (
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                    Category
                  </p>
                  <p className="mt-1 font-semibold text-gray-900">
                    {app.category}
                  </p>
                </div>
              )}
              {app.licenseRequired !== undefined && (
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                    License
                  </p>
                  <p className="mt-1 font-semibold text-gray-900">
                    {app.licenseRequired ? "Required" : "Optional"}
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ============ SYSTEM REQUIREMENTS ============ */}
        {requirements && requirementEntries.length > 0 && (
          <section className="mb-10">
            <h2 className="mb-4 flex items-center gap-2 text-2xl font-bold text-gray-900">
              <FaCogs className="text-green-600" /> System Requirements
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {requirementEntries.map((entry, idx) => {
                const Icon = entry.icon;
                return (
                  <div
                    key={idx}
                    className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-md"
                  >
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-green-100 text-green-700">
                      <Icon />
                    </div>
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                        {entry.label}
                      </p>
                      <p className="font-semibold text-gray-800">{entry.value}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ============ REVIEWS ============ */}
        <section className="mb-10">
          <h2 className="mb-4 flex items-center gap-2 text-2xl font-bold text-gray-900">
            <FaCommentAlt className="text-green-600" /> Reviews
          </h2>

          {reviewLoading ? (
            <p className="py-8 text-center text-gray-500">Loading reviews...</p>
          ) : (
            <>
              {/* Average rating summary */}
              {reviewCount > 0 && (
                <div className="mb-6 flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-md">
                  <div className="text-4xl font-bold text-gray-900">
                    {reviewAverage.toFixed(1)}
                  </div>
                  <div>
                    <div className="flex text-amber-400">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <FaStar
                          key={s}
                          className={
                            s <= Math.round(reviewAverage) ? "" : "opacity-30"
                          }
                        />
                      ))}
                    </div>
                    <p className="mt-1 text-sm text-gray-500">
                      {reviewCount} {reviewCount === 1 ? "review" : "reviews"}
                    </p>
                  </div>
                </div>
              )}

              {reviewSuccess && (
                <p className="mb-4 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700 flex items-center gap-2">
                  <FaCheckCircle /> {reviewSuccess}
                </p>
              )}
              {reviewError && (
                <p className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
                  {reviewError}
                </p>
              )}

              {/* Review list (existing first) */}
              {reviews.length === 0 ? (
                <p className="rounded-2xl border border-gray-100 bg-white py-8 text-center text-gray-500 shadow-md">
                  No reviews yet. Be the first to review this application.
                </p>
              ) : (
                <div className="space-y-4 mb-6">
                  {reviews.map((r) => (
                    <div
                      key={r.id}
                      className="rounded-2xl border border-gray-100 bg-white p-5 shadow-md"
                    >
                      <div className="mb-2 flex items-center justify-between">
                        <span className="font-semibold text-gray-900">
                          {r.name}
                        </span>
                        <span className="text-xs text-gray-400">
                          {formatDate(r.createdAt)}
                        </span>
                      </div>
                      <div className="mb-2 flex text-amber-400">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <FaStar
                            key={s}
                            className={
                              s <= r.rating ? "text-sm" : "text-sm opacity-30"
                            }
                          />
                        ))}
                      </div>
                      <p className="text-sm text-gray-700">{r.review}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Add Review button opens form */}
              {!showReviewForm ? (
                <button
                  onClick={() => setShowReviewForm(true)}
                  className="flex items-center gap-2 rounded-xl border-2 border-dashed border-green-300 bg-green-50 px-5 py-3 font-medium text-green-700 transition hover:bg-green-100"
                >
                  <FaPlus /> Add Review
                </button>
              ) : (
                <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-md">
                  <h3 className="mb-4 font-semibold text-gray-900">
                    Write a Review
                  </h3>
                  <form onSubmit={handleReviewSubmit} className="space-y-4">
                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700">
                        Name
                      </label>
                      <input
                        type="text"
                        value={reviewName}
                        onChange={(e) => setReviewName(e.target.value)}
                        placeholder="Your name"
                        className="w-full rounded-lg border border-gray-300 px-4 py-2 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700">
                        Rating
                      </label>
                      <div className="flex gap-1 text-2xl">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <button
                            type="button"
                            key={s}
                            onClick={() => setReviewRating(s)}
                            className={
                              s <= reviewRating
                                ? "text-amber-400"
                                : "text-gray-300 hover:text-amber-200"
                            }
                            aria-label={`${s} star${s > 1 ? "s" : ""}`}
                          >
                            <FaStar />
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700">
                        Review
                      </label>
                      <textarea
                        value={reviewText}
                        onChange={(e) => setReviewText(e.target.value)}
                        placeholder="Share your experience with this application..."
                        rows={4}
                        className="w-full rounded-lg border border-gray-300 px-4 py-2 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200"
                      />
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        type="submit"
                        disabled={reviewSubmitLoading}
                        className="flex items-center gap-2 rounded-xl bg-green-600 px-5 py-2.5 font-medium text-white transition hover:bg-green-700 disabled:opacity-60"
                      >
                        {reviewSubmitLoading ? (
                          <>
                            <FaSpinner className="animate-spin" /> Submitting...
                          </>
                        ) : (
                          "Submit Review"
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowReviewForm(false)}
                        className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </>
          )}
        </section>

        {/* ============ RELATED APPLICATIONS ============ */}
        {related.length > 0 && (
          <section className="mb-8">
            <h2 className="mb-4 text-2xl font-bold text-gray-900">
              Related Applications
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((r) => {
                const latestRel = r.versions?.find((v) => v.latest)?.version;
                return (
                  <Link
                    key={r.id}
                    href={`/${r.slug}`}
                    className="group rounded-2xl border border-gray-100 bg-white p-5 shadow-md transition-all hover:border-green-200 hover:shadow-xl"
                  >
                    <div className="mb-3 flex items-center gap-3">
                      {r.logo ? (
                        <img
                          src={r.logo}
                          alt={r.name}
                          loading="lazy"
                          className="h-12 w-12 rounded-xl bg-white object-contain"
                        />
                      ) : (
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br from-green-500 to-emerald-600">
                          <FaRocket className="text-lg text-white" />
                        </div>
                      )}
                      <div>
                        <h3 className="font-semibold text-gray-900 transition group-hover:text-green-700">
                          {r.name}
                        </h3>
                        {latestRel && (
                          <p className="text-xs text-gray-500">v{latestRel}</p>
                        )}
                      </div>
                    </div>
                    {r.shortDescription && (
                      <p className="line-clamp-2 text-sm text-gray-600">
                        {r.shortDescription}
                      </p>
                    )}
                  </Link>
                );
              })}
            </div>
          </section>
        )}
      </div>

      {/* ============ LICENSE MODAL ============ */}
      {showLicenseModal && currentVersion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl md:p-8">
            <button
              onClick={handleCancel}
              className="absolute right-4 top-4 p-1 text-gray-400 transition hover:text-gray-600"
              aria-label="Close"
            >
              <FaTimes />
            </button>

            <div className="mb-4 flex justify-center">
              {app.logo ? (
                <img
                  src={app.logo}
                  alt={app.name}
                  className="h-16 w-16 rounded-xl object-contain"
                />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-linear-to-br from-green-500 to-emerald-600">
                  <FaRocket className="text-xl text-white" />
                </div>
              )}
            </div>

            <h3 className="mb-1 text-center text-xl font-bold text-gray-900">
              {app.name}
            </h3>
            <p className="mb-6 text-center text-sm text-gray-500">
              Version v{currentVersion.version}
            </p>

            <label className="mb-2 block text-sm font-medium text-gray-700">
              License Code
            </label>
            <input
              type="text"
              value={licenseCode}
              onChange={(e) => setLicenseCode(e.target.value)}
              placeholder="Enter License Code e.g. pdz.tms.48391"
              className="mb-4 w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200"
              autoFocus
            />

            {licenseError && (
              <p className="mb-4 flex items-center gap-2 text-sm text-red-600">
                <FaExclamationTriangle /> {licenseError}
              </p>
            )}

            <div className="flex flex-col gap-2">
              <button
                onClick={handleVerifyAndDownload}
                disabled={licenseLoading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 py-3 font-semibold text-white transition hover:bg-green-700 disabled:opacity-60"
              >
                {licenseLoading ? (
                  <>
                    <FaSpinner className="animate-spin" /> Verifying...
                  </>
                ) : (
                  <>
                    <FaKey /> Verify &amp; Download
                  </>
                )}
              </button>
              <button
                onClick={handleCancel}
                className="w-full rounded-xl py-3 text-gray-600 transition hover:bg-gray-100"
              >
                Cancel
              </button>
            </div>

            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 flex items-center justify-center gap-1.5 text-xs text-green-700 hover:underline"
            >
              <FaWhatsapp /> Need a license code? Contact me on WhatsApp
            </a>
          </div>
        </div>
      )}

      {/* ============ DOWNLOAD PROGRESS OVERLAY ============ */}
      {!showLicenseModal &&
        (downloadState === "preparing" ||
          downloadState === "verifying" ||
          downloadState === "starting" ||
          downloadState === "success" ||
          downloadState === "error") && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-2xl">
              {downloadState === "success" ? (
                <>
                  <div className="mb-4 flex justify-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                      <FaCheckCircle className="text-4xl text-green-600" />
                    </div>
                  </div>
                  <h3 className="mb-2 text-xl font-bold text-gray-900">Download Started!</h3>
                  <p className="text-gray-600">Thank you for purchasing from Pashto DevZone.</p>
                  <button
                    onClick={() => setDownloadState("idle")}
                    className="mt-6 w-full rounded-xl bg-green-600 py-3 font-semibold text-white transition hover:bg-green-700"
                  >
                    Done
                  </button>
                </>
              ) : downloadState === "error" ? (
                <>
                  <div className="mb-4 flex justify-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                      <FaExclamationTriangle className="text-4xl text-red-600" />
                    </div>
                  </div>
                  <h3 className="mb-2 text-xl font-bold text-gray-900">Download Failed</h3>
                  <p className="mb-6 text-gray-600">{downloadError}</p>
                  <button
                    onClick={() => setDownloadState("idle")}
                    className="w-full rounded-xl bg-gray-200 py-3 font-semibold text-gray-700 transition hover:bg-gray-300"
                  >
                    Close
                  </button>
                </>
              ) : (
                <>
                  <div className="mb-6 flex justify-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100">
                      <FaSpinner className="animate-spin text-4xl text-indigo-600" />
                    </div>
                  </div>
                  <h3 className="mb-3 text-xl font-bold text-gray-900">
                    {downloadState === "preparing" && "Preparing Download..."}
                    {downloadState === "verifying" && "Verifying License..."}
                    {downloadState === "starting" && "Starting Download..."}
                  </h3>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
                    <div className="h-full animate-pulse rounded-full bg-indigo-600" />
                  </div>
                </>
              )}
            </div>
          </div>
        )}

      {/* ============ LIGHTBOX (fullscreen screenshots) ============ */}
      {lightboxIndex !== null && screenshots.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4">
          <button
            onClick={closeLightbox}
            className="absolute right-4 top-4 rounded-full p-2 text-2xl text-white transition hover:bg-white/10"
            aria-label="Close fullscreen"
          >
            <FaTimes />
          </button>
          <button
            onClick={prevScreenshot}
            className="absolute left-4 rounded-full p-2 text-3xl text-white transition hover:bg-white/10"
            aria-label="Previous"
          >
            <FaChevronLeft />
          </button>
          <img
            src={screenshots[lightboxIndex]}
            alt={`${app.name} screenshot ${lightboxIndex + 1}`}
            className="max-h-[85vh] max-w-full rounded-lg object-contain"
          />
          <button
            onClick={nextScreenshot}
            className="absolute right-4 rounded-full p-2 text-3xl text-white transition hover:bg-white/10"
            aria-label="Next"
          >
            <FaChevronRight />
          </button>
          <span className="absolute bottom-4 text-sm text-white/80">
            {lightboxIndex + 1} / {screenshots.length}
          </span>
        </div>
      )}
    </div>
  );
}
