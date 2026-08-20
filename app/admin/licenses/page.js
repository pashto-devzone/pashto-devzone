"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { FaTrash, FaKey, FaCopy, FaCheck, FaSyncAlt } from "react-icons/fa";

export default function AdminLicenses() {
  const [apps, setApps] = useState([]);
  const [licenses, setLicenses] = useState([]);
  const [selectedAppId, setSelectedAppId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(null);

  const [genForm, setGenForm] = useState({
    customerName: "",
    appId: "",
  });

  const loadApps = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/apps?all=true");
      const data = await res.json();
      if (res.ok) setApps(data);
    } catch {}
  }, []);

  const loadLicenses = useCallback(async (appId) => {
    try {
      const query = appId ? "?appId=" + appId : "";
      const res = await fetch("/api/admin/licenses" + query);
      const data = await res.json();
      if (res.ok) setLicenses(data);
    } catch {}
  }, []);

  useEffect(() => {
    loadApps();
  }, [loadApps]);

  useEffect(() => {
    loadLicenses(selectedAppId);
  }, [selectedAppId, loadLicenses]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const appId = params.get("appId");
    if (appId) {
      setSelectedAppId(appId);
      setGenForm((f) => ({ ...f, appId }));
    } else setLoading(false);
  }, []);

  useEffect(() => {
    if (apps.length > 0) setLoading(false);
  }, [apps]);

  const handleGenerate = async (e) => {
    e.preventDefault();
    setGenerating(true);
    setError("");
    try {
      const res = await fetch("/api/admin/licenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: genForm.customerName,
          appId: parseInt(genForm.appId),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to generate license");
        return;
      }
      alert(`License generated: ${data.code}`);
      setGenForm((f) => ({ ...f, customerName: "" }));
      loadLicenses(selectedAppId);
    } catch {
      setError("Failed to generate license");
    } finally {
      setGenerating(false);
    }
  };

  const handleDelete = async (license) => {
    if (!confirm(`Delete license "${license.code}"?`)) return;
    try {
      const res = await fetch(`/api/admin/licenses/${license.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to delete license");
        return;
      }
      loadLicenses(selectedAppId);
    } catch {
      alert("Failed to delete license");
    }
  };

  const handleMarkUsed = async (license) => {
    try {
      await fetch(`/api/admin/licenses/${license.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "USED" }),
      });
      loadLicenses(selectedAppId);
    } catch {
      alert("Failed to update license");
    }
  };

  function getStatus(license) {
    if (license.status === "USED") return "Used";
    if (new Date(license.expiresAt) < new Date()) return "Expired";
    return "Unused";
  }

  function getStatusClass(status) {
    if (status === "Used") return "bg-gray-100 text-gray-600";
    if (status === "Expired") return "bg-red-100 text-red-600";
    return "bg-green-100 text-green-700";
  }

  function formatDate(dateStr) {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "-";
    return d.toLocaleString();
  }

  async function handleCopy(code) {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(code);
      setTimeout(() => setCopied(null), 2000);
    } catch {}
  }

  const inputCls =
    "w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none";
  const labelCls = "block text-sm font-medium text-gray-700 mb-1";

  if (loading) {
    return <p className="text-gray-500 text-center">Loading licenses...</p>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">License Manager</h1>

      {/* Generate License */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 mb-6">
        <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <FaKey className="text-indigo-600" /> Generate License
        </h2>
        <form
          onSubmit={handleGenerate}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end"
        >
          <div>
            <label className={labelCls}>Customer Name *</label>
            <input
              type="text"
              value={genForm.customerName}
              onChange={(e) =>
                setGenForm((f) => ({ ...f, customerName: e.target.value }))
              }
              className={inputCls}
              placeholder="Enter customer name"
              required
            />
          </div>
          <div>
            <label className={labelCls}>Application *</label>
            <select
              value={genForm.appId}
              onChange={(e) =>
                setGenForm((f) => ({ ...f, appId: e.target.value }))
              }
              className={inputCls}
              required
            >
              <option value="">Select App</option>
              {apps.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <button
              type="submit"
              disabled={generating}
              className="w-full md:w-auto flex items-center gap-2 bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FaKey /> {generating ? "Generating..." : "Generate License"}
            </button>
          </div>
        </form>
        <p className="text-xs text-gray-400 mt-3">
          Format: <code className="bg-gray-100 px-1 rounded">pdz.{`{slug}`}.{`{5 digits}`}</code>.
          Enter a customer name and select an application to generate one license.
        </p>
      </div>

      {error && (
        <p className="bg-red-50 text-red-600 px-4 py-3 rounded-lg mb-4 text-sm">
          {error}
        </p>
      )}

      {/* Filter */}
      <div className="mb-4">
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
      </div>

      {licenses.length === 0 ? (
        <p className="text-gray-500 text-center py-12 bg-white rounded-xl border border-gray-200">
          No licenses found. Generate one above.
        </p>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[800px]">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Code</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Customer</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Application</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-500">Status</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-500">Downloads</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Generated</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {licenses.map((license) => {
                  const status = getStatus(license);
                  return (
                    <tr key={license.id} className="border-b border-gray-100">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <code className="bg-gray-100 px-2 py-1 rounded font-mono text-xs">
                            {license.code}
                          </code>
                          <button
                            onClick={() => handleCopy(license.code)}
                            className="text-gray-400 hover:text-indigo-600 transition-colors"
                            title="Copy"
                          >
                            {copied === license.code ? (
                              <FaCheck className="text-green-500" />
                            ) : (
                              <FaCopy />
                            )}
                          </button>
                        </div>
                      </td>
                      <td className="py-3 px-4">{license.customer?.name || "-"}</td>
                      <td className="py-3 px-4">{license.app?.name || "-"}</td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={
                            "inline-block px-3 py-1 rounded-full text-xs font-medium " +
                            getStatusClass(status)
                          }
                        >
                          {status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        {license._count?.downloads || license.downloadCount || 0}
                      </td>
                      <td className="py-3 px-4 text-gray-500 text-xs">
                        {formatDate(license.createdAt)}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex justify-center gap-2">
                          {license.status !== "USED" && (
                            <button
                              onClick={() => handleMarkUsed(license)}
                              className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"
                              title="Mark as used"
                            >
                              <FaSyncAlt />
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(license)}
                            className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                            title="Delete"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
