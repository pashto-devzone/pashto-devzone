"use client";

import { useState, useEffect } from "react";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaStar,
  FaDownload,
} from "react-icons/fa";

export default function AdminVersions() {
  const [apps, setApps] = useState([]);
  const [versions, setVersions] = useState([]);
  const [selectedAppId, setSelectedAppId] = useState("");
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    appId: "",
    version: "",
    downloadUrl: "",
    releaseDate: "",
    size: "",
    latest: false,
    releaseNotes: "",
  });

  async function loadApps() {
    try {
      const res = await fetch("/api/admin/apps?all=true");
      const data = await res.json();
      if (res.ok) setApps(data);
    } catch {}
  }

  async function loadVersions(appId) {
    try {
      const query = appId ? "?appId=" + appId : "";
      const res = await fetch("/api/admin/versions" + query);
      const data = await res.json();
      if (res.ok) setVersions(data);
    } catch {}
  }

  useEffect(() => {
    loadApps();
  }, []);

  useEffect(() => {
    loadVersions(selectedAppId);
  }, [selectedAppId]);

  useEffect(() => {
    // Sync URL param
    const params = new URLSearchParams(window.location.search);
    const appId = params.get("appId");
    if (appId) setSelectedAppId(appId);
    else setLoading(false);
  }, []);

  useEffect(() => {
    if (apps.length > 0) {
      setLoading(false);
    }
  }, [apps]);

  function openCreate() {
    setEditing(null);
    setForm({
      appId: selectedAppId,
      version: "",
      downloadUrl: "",
      releaseDate: "",
      size: "",
      latest: false,
    });
    setShowModal(true);
    setError("");
  }

  function openEdit(v) {
    setEditing(v);
    setForm({
      appId: String(v.appId),
      version: v.version,
      downloadUrl: v.downloadUrl || "",
      releaseDate: v.releaseDate
        ? new Date(v.releaseDate).toISOString().slice(0, 10)
        : "",
      size: v.size || "",
      latest: v.latest,
      releaseNotes: v.releaseNotes || "",
    });
    setShowModal(true);
    setError("");
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const url = editing
        ? `/api/admin/versions/${editing.id}`
        : "/api/admin/versions";
      const method = editing ? "PUT" : "POST";

      const body = { ...form, appId: form.appId || selectedAppId };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to save version");
        return;
      }

      setShowModal(false);
      loadVersions(selectedAppId);
    } catch {
      setError("Failed to save version");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(v) {
    if (!confirm(`Delete version "${v.version}"?`)) return;
    try {
      const res = await fetch(`/api/admin/versions/${v.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to delete version");
        return;
      }
      loadVersions(selectedAppId);
    } catch {
      alert("Failed to delete version");
    }
  }

  async function handleSetLatest(v) {
    try {
      await fetch(`/api/admin/versions/${v.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ latest: true }),
      });
      loadVersions(selectedAppId);
    } catch {
      alert("Failed to set latest version");
    }
  }

  function formatDate(dateStr) {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    return d.toLocaleDateString();
  }

  if (loading) {
    return <p className="text-gray-500 text-center">Loading versions...</p>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Versions Manager</h1>
        <div className="flex items-center gap-4">
          <select
            value={selectedAppId}
            onChange={(e) => setSelectedAppId(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
          >
            <option value="">All Apps</option>
            {apps.map((app) => (
              <option key={app.id} value={app.id}>
                {app.name}
              </option>
            ))}
          </select>
          <button
            onClick={openCreate}
            disabled={!selectedAppId}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FaPlus /> Add Version
          </button>
        </div>
      </div>

      {!selectedAppId && (
        <p className="text-gray-500 text-center py-12 bg-white rounded-xl border border-gray-200">
          Select an app from the dropdown to manage its versions.
        </p>
      )}

      {selectedAppId && versions.length === 0 && (
        <p className="text-gray-500 text-center py-12 bg-white rounded-xl border border-gray-200">
          No versions for this app yet. Click "Add Version" to create one.
        </p>
      )}

      {versions.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
          <table className="w-full text-sm min-w-[640px]">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left py-3 px-4 font-medium text-gray-500">
                  App
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">
                  Version
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">
                  Download URL
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">
                  Release Date
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">
                  Size
                </th>
                <th className="text-center py-3 px-4 font-medium text-gray-500">
                  Latest
                </th>
                <th className="text-center py-3 px-4 font-medium text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {versions.map((v) => (
                <tr key={v.id} className="border-b border-gray-100">
                  <td className="py-3 px-4 font-medium">{v.app.name}</td>
                  <td className="py-3 px-4 font-mono">{v.version}</td>
                  <td className="py-3 px-4 text-gray-500 max-w-[200px] truncate">
                    {v.downloadUrl ? (
                      <a
                        href={v.downloadUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline flex items-center gap-1"
                      >
                        <FaDownload className="text-xs" /> Download
                      </a>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td className="py-3 px-4">{formatDate(v.releaseDate)}</td>
                  <td className="py-3 px-4">{v.size || "-"}</td>
                  <td className="py-3 px-4 text-center">
                    {v.latest ? (
                      <span className="inline-flex items-center gap-1 text-amber-600">
                        <FaStar /> Latest
                      </span>
                    ) : (
                      <button
                        onClick={() => handleSetLatest(v)}
                        className="text-gray-400 hover:text-amber-600 transition-colors"
                        title="Set as latest"
                      >
                        <FaStar />
                      </button>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => openEdit(v)}
                        className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                        title="Edit"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDelete(v)}
                        className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                        title="Delete"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-start justify-center overflow-y-auto p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg my-8">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                {editing ? "Edit Version" : "Add New Version"}
              </h2>

              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    App
                  </label>
                  <select
                    value={form.appId}
                    onChange={(e) =>
                      setForm({ ...form, appId: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    required
                  >
                    <option value="">Select App</option>
                    {apps.map((app) => (
                      <option key={app.id} value={app.id}>
                        {app.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Version *
                  </label>
                  <input
                    type="text"
                    value={form.version}
                    onChange={(e) =>
                      setForm({ ...form, version: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    placeholder="e.g. 1.0.0"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Download URL
                  </label>
                  <input
                    type="url"
                    value={form.downloadUrl}
                    onChange={(e) =>
                      setForm({ ...form, downloadUrl: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    placeholder="https://..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Release Date
                    </label>
                    <input
                      type="date"
                      value={form.releaseDate}
                      onChange={(e) =>
                        setForm({ ...form, releaseDate: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Size
                    </label>
                    <input
                      type="text"
                      value={form.size}
                      onChange={(e) =>
                        setForm({ ...form, size: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                      placeholder="e.g. 25MB"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    What&apos;s New / Release Notes
                  </label>
                  <textarea
                    value={form.releaseNotes}
                    onChange={(e) =>
                      setForm({ ...form, releaseNotes: e.target.value })
                    }
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    placeholder="Describe what changed in this version"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={form.latest}
                    onChange={(e) =>
                      setForm({ ...form, latest: e.target.checked })
                    }
                    className="w-4 h-4 text-indigo-600 rounded"
                  />
                  <label className="text-sm text-gray-700">
                    Mark as latest version
                  </label>
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
                      ? "Update Version"
                      : "Add Version"}
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

