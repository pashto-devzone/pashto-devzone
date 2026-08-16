"use client";

import { useState, useEffect, useRef } from "react";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaPowerOff,
  FaUpload,
  FaImage,
  FaCodeBranch,
  FaKey,
  FaPlusCircle,
  FaTimes,
} from "react-icons/fa";
import Link from "next/link";
import MarkdownEditor from "../../components/admin/MarkdownEditor";

export default function AdminApps() {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadingScreens, setUploadingScreens] = useState(false);
  const fileInputRef = useRef(null);
  const screensInputRef = useRef(null);

  const emptyForm = {
    name: "",
    slug: "",
    logo: "",
    shortDescription: "",
    description: "",
    developer: "",
    category: "",
    platform: "",
    storage: "",
    ram: "",
    processor: "",
    otherRequirements: "",
    features: [],
    screenshots: [],
    active: true,
    licenseRequired: true,
  };

  const [form, setForm] = useState(emptyForm);

  // Parse screenshots from a raw app object (JSON string or array)
  function parseScreenshots(app) {
    if (!app) return [];
    if (Array.isArray(app.screenshots)) return app.screenshots;
    try {
      const p = JSON.parse(app.screenshots);
      return Array.isArray(p) ? p : [];
    } catch {
      return [];
    }
  }

  // Parse features from a raw app object (JSON string or array)
  function parseFeatures(app) {
    if (!app) return [];
    if (Array.isArray(app.features)) return app.features;
    try {
      const p = JSON.parse(app.features);
      return Array.isArray(p) ? p : [];
    } catch {
      return [];
    }
  }

  // Parse systemRequirements from a raw app object (JSON string or object)
  function parseSystemRequirements(app) {
    if (!app) return {};
    if (
      app.systemRequirements &&
      typeof app.systemRequirements === "object" &&
      !Array.isArray(app.systemRequirements)
    ) {
      return app.systemRequirements;
    }
    try {
      const p = JSON.parse(app.systemRequirements);
      return p && typeof p === "object" && !Array.isArray(p) ? p : {};
    } catch {
      return {};
    }
  }

  async function loadApps() {
    try {
      const res = await fetch("/api/admin/apps?all=true");
      const data = await res.json();
      if (res.ok) setApps(data);
      else setError(data.error || "Failed to load apps");
    } catch {
      setError("Failed to load apps");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadApps();
  }, []);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setShowModal(true);
    setError("");
  }

  function openEdit(app) {
    setEditing(app);
    const reqs = parseSystemRequirements(app);
    setForm({
      name: app.name,
      slug: app.slug,
      logo: app.logo || "",
      shortDescription: app.shortDescription || "",
      description: app.description || "",
      developer: app.developer || "",
      category: app.category || "",
      platform: reqs.os || app.platform || "",
      storage: reqs.storage || app.storage || "",
      ram: reqs.ram || app.ram || "",
      processor: reqs.cpu || reqs.processor || app.processor || "",
      otherRequirements: reqs.other || reqs.otherRequirements || "",
      features: parseFeatures(app),
      screenshots: parseScreenshots(app),
      active: app.active,
      licenseRequired: app.licenseRequired ?? true,
    });
    setShowModal(true);
    setError("");
  }

  async function handleScreenshotsUpload(files) {
    if (!files || files.length === 0) return;
    const allowed = ["image/png", "image/jpg", "image/jpeg", "image/webp"];
    const valid = [];
    for (const file of files) {
      if (!allowed.includes(file.type)) {
        setError("Only png, jpg, jpeg, webp files are allowed");
        continue;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError("Screenshots must be less than 5MB each");
        continue;
      }
      valid.push(file);
    }

    if (valid.length === 0) return;

    setUploadingScreens(true);
    setError("");
    const newUrls = [];
    for (const file of valid) {
      try {
        const fd = new FormData();
        fd.append("file", file);
        const res = await fetch("/api/admin/upload", {
          method: "POST",
          body: fd,
        });
        const data = await res.json();
        if (res.ok && data.url) newUrls.push(data.url);
        else setError(data.error || "A screenshot upload failed");
      } catch {
        setError("A screenshot upload failed");
      }
    }
    setForm((f) => ({ ...f, screenshots: [...f.screenshots, ...newUrls] }));
    setUploadingScreens(false);
  }

  function handleRemoveScreenshot(idx) {
    setForm((f) => ({
      ...f,
      screenshots: f.screenshots.filter((_, i) => i !== idx),
    }));
  }

  function handleAddFeature() {
    setForm((f) => ({ ...f, features: [...f.features, ""] }));
  }

  function handleFeatureChange(idx, val) {
    setForm((f) => ({
      ...f,
      features: f.features.map((item, i) => (i === idx ? val : item)),
    }));
  }

  function handleRemoveFeature(idx) {
    setForm((f) => ({
      ...f,
      features: f.features.filter((_, i) => i !== idx),
    }));
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const payload = {
      name: form.name,
      slug: form.slug,
      logo: form.logo,
      shortDescription: form.shortDescription,
      description: form.description,
      developer: form.developer,
      category: form.category,
      features: form.features.map((f) => f.trim()).filter(Boolean),
      screenshots: form.screenshots,
      systemRequirements: {
        os: form.platform,
        storage: form.storage,
        ram: form.ram,
        cpu: form.processor,
        other: form.otherRequirements,
      },
      active: form.active,
      licenseRequired: form.licenseRequired,
    };

    try {
      const url = editing
        ? `/api/admin/apps/${editing.id}`
        : "/api/admin/apps";
      const method = editing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to save app");
        return;
      }

      setShowModal(false);
      loadApps();
    } catch {
      setError("Failed to save app");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(app) {
    if (!confirm(`Are you sure you want to delete "${app.name}"?`)) return;
    try {
      const res = await fetch(`/api/admin/apps/${app.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to delete app");
        return;
      }
      loadApps();
    } catch {
      alert("Failed to delete app");
    }
  }

  async function handleToggleActive(app) {
    try {
      await fetch(`/api/admin/apps/${app.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !app.active }),
      });
      loadApps();
    } catch {
      alert("Failed to toggle app status");
    }
  }

  async function handleLogoUpload(file) {
    if (!file) return;
    const allowed = ["image/png", "image/jpg", "image/jpeg", "image/webp"];
    if (!allowed.includes(file.type)) {
      setError("Only png, jpg, jpeg, webp files are allowed");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Logo must be less than 5MB");
      return;
    }

    setUploading(true);
    setError("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Upload failed");
        return;
      }
      setForm((f) => ({ ...f, logo: data.url }));
    } catch {
      setError("Upload failed");
    } finally {
      setUploading(false);
    }
  }

  if (loading) {
    return <p className="text-gray-500 text-center">Loading apps...</p>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Apps Manager</h1>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
        >
          <FaPlus /> Add App
        </button>
      </div>

      {error && (
        <p className="bg-red-50 text-red-600 px-4 py-3 rounded-lg mb-4 text-sm">
          {error}
        </p>
      )}

      {apps.length === 0 ? (
        <p className="text-gray-500 text-center py-12 bg-white rounded-xl border border-gray-200">
          No apps yet. Click "Add App" to create your first application.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {apps.map((app) => (
            <div
              key={app.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 flex flex-col"
            >
              <div className="flex items-center gap-4 mb-4">
                {app.logo ? (
                  <img
                    src={app.logo}
                    alt={app.name}
                    className="w-14 h-14 object-contain rounded-lg bg-gray-50 border border-gray-200"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600 text-2xl">
                    <FaImage />
                  </div>
                )}
                <div className="min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate">
                    {app.name}
                  </h3>
                  <p className="text-sm text-gray-500">/{app.slug}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 mb-4">
                <span
                  className={
                    "inline-block px-3 py-1 rounded-full text-xs font-medium " +
                    (app.active
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700")
                  }
                >
                  {app.active ? "Active" : "Inactive"}
                </span>
                <span className="text-xs text-gray-400">
                  {app._count.versions} versions · {app._count.licenses}{" "}
                  licenses
                </span>
              </div>

              <div className="flex flex-wrap gap-2 mt-auto">
                <button
                  onClick={() => openEdit(app)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-medium hover:bg-blue-100 transition-colors"
                >
                  <FaEdit /> Edit
                </button>
                <Link
                  href={"/admin/versions?appId=" + app.id}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 text-purple-600 rounded-lg text-xs font-medium hover:bg-purple-100 transition-colors"
                >
                  <FaCodeBranch /> Versions
                </Link>
                <Link
                  href={"/admin/licenses?appId=" + app.id}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-600 rounded-lg text-xs font-medium hover:bg-amber-100 transition-colors"
                >
                  <FaKey /> Licenses
                </Link>
                <button
                  onClick={() => handleToggleActive(app)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-xs font-medium hover:bg-gray-200 transition-colors"
                  title={app.active ? "Disable" : "Enable"}
                >
                  <FaPowerOff /> {app.active ? "Disable" : "Enable"}
                </button>
                <button
                  onClick={() => handleDelete(app)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-medium hover:bg-red-100 transition-colors"
                >
                  <FaTrash /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-start justify-center overflow-y-auto p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl my-8">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                {editing ? "Edit App" : "Add New App"}
              </h2>

              <form onSubmit={handleSave} className="space-y-5">
                {/* ===== Basic Information ===== */}
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wide text-gray-500 mb-3 border-b border-gray-100 pb-2">
                    Basic Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        App Name *
                      </label>
                      <input
                        type="text"
                        value={form.name}
                        onChange={(e) =>
                          setForm({ ...form, name: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Slug *
                      </label>
                      <input
                        type="text"
                        value={form.slug}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            slug: e.target.value
                              .toLowerCase()
                              .replace(/[^a-z0-9-]/g, "-"),
                          })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                        placeholder="e.g. my-app"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Developer
                      </label>
                      <input
                        type="text"
                        value={form.developer}
                        onChange={(e) =>
                          setForm({ ...form, developer: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                        placeholder="e.g. Pashto DevZone"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Category
                      </label>
                      <input
                        type="text"
                        value={form.category}
                        onChange={(e) =>
                          setForm({ ...form, category: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                        placeholder="e.g. Business / Desktop"
                      />
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Short Description
                    </label>
                    <textarea
                      value={form.shortDescription}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          shortDescription: e.target.value,
                        })
                      }
                      rows={2}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                      placeholder="A short catchy summary shown on cards and for SEO"
                    />
                  </div>
                </div>

                {/* ===== Logo Upload ===== */}
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wide text-gray-500 mb-3 border-b border-gray-100 pb-2">
                    Logo
                  </h3>
                  <div className="flex items-center gap-4">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".png,.jpg,.jpeg,.webp"
                      className="hidden"
                      onChange={(e) => handleLogoUpload(e.target.files[0])}
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition-colors disabled:opacity-50"
                    >
                      <FaUpload />{" "}
                      {uploading ? "Uploading..." : "Upload Logo"}
                    </button>
                    {form.logo && (
                      <img
                        src={form.logo}
                        alt="Preview"
                        className="w-14 h-14 object-contain rounded-lg border border-gray-200"
                      />
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    PNG, JPG, JPEG or WEBP. Max 5MB. (Upload only — no URL
                    input.)
                  </p>
                </div>

                {/* ===== Screenshots ===== */}
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wide text-gray-500 mb-3 border-b border-gray-100 pb-2">
                    Screenshots
                  </h3>
                  <input
                    ref={screensInputRef}
                    type="file"
                    accept=".png,.jpg,.jpeg,.webp"
                    multiple
                    className="hidden"
                    onChange={(e) =>
                      handleScreenshotsUpload(
                        Array.from(e.target.files || [])
                      )
                    }
                  />
                  <button
                    type="button"
                    onClick={() => screensInputRef.current?.click()}
                    disabled={uploadingScreens}
                    className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    <FaUpload />{" "}
                    {uploadingScreens ? "Uploading..." : "Upload Screenshots"}
                  </button>
                  <p className="text-xs text-gray-400 mt-1">
                    PNG, JPG, JPEG or WEBP. Max 5MB each. Select multiple files.
                  </p>

                  {form.screenshots.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-3">
                      {form.screenshots.map((src, idx) => (
                        <div
                          key={idx}
                          className="relative group rounded-lg border border-gray-200 overflow-hidden"
                        >
                          <img
                            src={src}
                            alt={`Screenshot ${idx + 1}`}
                            className="w-full h-24 object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveScreenshot(idx)}
                            className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-700 transition-colors"
                            title="Remove screenshot"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* ===== Features ===== */}
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wide text-gray-500 mb-3 border-b border-gray-100 pb-2">
                    Features
                  </h3>
                  <div className="space-y-2">
                    {form.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={feature}
                          onChange={(e) =>
                            handleFeatureChange(idx, e.target.value)
                          }
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm"
                          placeholder={`Feature ${idx + 1}`}
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveFeature(idx)}
                          className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                          title="Remove feature"
                        >
                          <FaTimes />
                        </button>
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={handleAddFeature}
                    className="mt-2 flex items-center gap-2 px-4 py-2 border border-dashed border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    <FaPlusCircle /> Add Feature
                  </button>
                </div>

                {/* ===== System Requirements ===== */}
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wide text-gray-500 mb-3 border-b border-gray-100 pb-2">
                    System Requirements
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Operating System
                      </label>
                      <input
                        type="text"
                        value={form.platform}
                        onChange={(e) =>
                          setForm({ ...form, platform: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                        placeholder="e.g. Windows 7 / 8 / 10 / 11"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        RAM
                      </label>
                      <input
                        type="text"
                        value={form.ram}
                        onChange={(e) => setForm({ ...form, ram: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                        placeholder="e.g. 2 GB"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Storage
                      </label>
                      <input
                        type="text"
                        value={form.storage}
                        onChange={(e) =>
                          setForm({ ...form, storage: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                        placeholder="e.g. 500 MB"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Processor
                      </label>
                      <input
                        type="text"
                        value={form.processor}
                        onChange={(e) =>
                          setForm({ ...form, processor: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                        placeholder="e.g. Intel Core i3 or better"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Other Requirements
                      </label>
                      <input
                        type="text"
                        value={form.otherRequirements}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            otherRequirements: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                        placeholder="e.g. Internet connection for updates"
                      />
                    </div>
                  </div>
                </div>

                {/* ===== Description ===== */}
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wide text-gray-500 mb-3 border-b border-gray-100 pb-2">
                    Detailed Description
                  </h3>
                  <MarkdownEditor
                    value={form.description}
                    onChange={(val) => setForm({ ...form, description: val })}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={form.active}
                      onChange={(e) =>
                        setForm({ ...form, active: e.target.checked })
                      }
                      className="w-4 h-4 text-indigo-600 rounded"
                    />
                    <label className="text-sm text-gray-700">Active</label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={form.licenseRequired}
                      onChange={(e) =>
                        setForm({ ...form, licenseRequired: e.target.checked })
                      }
                      className="w-4 h-4 text-indigo-600 rounded"
                    />
                    <label className="text-sm text-gray-700">
                      License Required
                    </label>
                  </div>
                </div>

                {error && <p className="text-red-600 text-sm">{error}</p>}

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 transition-colors disabled:opacity-50 font-medium"
                  >
                    {saving
                      ? "Saving..."
                      : editing
                      ? "Update App"
                      : "Create App"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
