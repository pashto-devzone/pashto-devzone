"use client";

import { useState, useEffect, useCallback } from "react";
import {
  FaDownload,
  FaGlobe,
  FaDesktop,
  FaMobileAlt,
  FaTablet,
} from "react-icons/fa";

export default function AdminDownloads() {
  const [downloads, setDownloads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDownloads = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/downloads");
      const data = await res.json();
      if (res.ok) setDownloads(data);
      else setError(data.error || "Failed to load downloads");
    } catch {
      setError("Failed to load downloads");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDownloads();
  }, [loadDownloads]);

  const deviceIcon = (d) => {
    if (d === "Mobile") return <FaMobileAlt className="text-indigo-600" />;
    if (d === "Tablet") return <FaTablet className="text-purple-600" />;
    return <FaDesktop className="text-blue-600" />;
  };

  const formatDate = (d) => {
    if (!d) return "-";
    return new Date(d).toLocaleString();
  };

  if (loading) {
    return <p className="text-gray-500 text-center">Loading downloads...</p>;
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <FaDownload className="text-indigo-600 text-2xl" />
        <h1 className="text-2xl font-bold text-gray-900">Download History</h1>
      </div>

      {error && (
        <p className="bg-red-50 text-red-600 px-4 py-3 rounded-lg mb-4 text-sm">
          {error}
        </p>
      )}

      {downloads.length === 0 ? (
        <p className="text-gray-500 text-center py-12 bg-white rounded-xl border border-gray-200">
          No downloads recorded yet. Downloads will appear here automatically
          when users download software.
        </p>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[1000px]">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Customer</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">License</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Application</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Version</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-500">Device</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Browser</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">OS</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">IP</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Time</th>
                </tr>
              </thead>
              <tbody>
                {downloads.map((d) => (
                  <tr key={d.id} className="border-b border-gray-100">
                    <td className="py-3 px-4 font-medium">
                      {d.customer?.name || "-"}
                    </td>
                    <td className="py-3 px-4">
                      {d.license ? (
                        <code className="bg-gray-100 px-2 py-1 rounded font-mono text-xs">
                          {d.license.code}
                        </code>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="py-3 px-4">{d.app?.name || "-"}</td>
                    <td className="py-3 px-4 font-mono text-xs">
                      {d.version || (d.versionModel?.version) || "-"}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex items-center gap-1">
                        {deviceIcon(d.deviceType)}
                        <span className="text-xs">{d.deviceType || "-"}</span>
                      </span>
                    </td>
                    <td className="py-3 px-4">{d.browser || "-"}</td>
                    <td className="py-3 px-4">{d.os || "-"}</td>
                    <td className="py-3 px-4 text-xs text-gray-500">{d.ip || "-"}</td>
                    <td className="py-3 px-4 text-xs text-gray-500">
                      {formatDate(d.downloadedAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
