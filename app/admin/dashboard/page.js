"use client";
import { useState, useEffect, useCallback } from "react";
import {
  FaCubes,
  FaCodeBranch,
  FaKey,
  FaReceipt,
  FaDownload,
  FaMoneyBillWave,
} from "react-icons/fa";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadStats = useCallback(() => {
    fetch("/api/admin/dashboard")
      .then((res) => res.json())
      .then((data) => setStats(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  if (loading) {
    return <p className="text-gray-500 text-center">Loading dashboard...</p>;
  }
  if (!stats) {
    return <p className="text-red-500 text-center">Failed to load stats.</p>;
  }

  const cards = [
    { label: "Total Applications", value: stats.totalApps, icon: <FaCubes />, color: "bg-purple-500" },
    { label: "Total Versions", value: stats.totalVersions, icon: <FaCodeBranch />, color: "bg-green-500" },
    { label: "Generated Licenses", value: stats.totalLicenses, icon: <FaKey />, color: "bg-amber-500" },
    { label: "Total Receipts", value: stats.totalReceipts, icon: <FaReceipt />, color: "bg-indigo-500" },
    { label: "Total Downloads", value: stats.totalDownloads, icon: <FaDownload />, color: "bg-teal-500" },
    { label: "Total Revenue", value: stats.totalRevenue.toLocaleString(), icon: <FaMoneyBillWave />, color: "bg-emerald-500" },
  ];

  const formatDate = (d) => {
    if (!d) return "-";
    return new Date(d).toLocaleString();
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
        {cards.map((card) => (
          <div key={card.label} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <p className="text-sm text-gray-500 truncate">{card.label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{card.value}</p>
              </div>
              <div className={"w-11 h-11 " + card.color + " rounded-lg flex items-center justify-center text-white text-lg shrink-0"}>
                {card.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent lists */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Receipts */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FaReceipt className="text-indigo-600" /> Recent Receipts
          </h2>
          {stats.recentReceipts.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-6">No receipts yet.</p>
          ) : (
            <div className="space-y-2">
              {stats.recentReceipts.map((r) => (
                <div key={r.id} className="border border-gray-100 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-medium">{r.receiptNumber}</span>
                    <span className="text-sm font-semibold text-green-700">{r.price.toLocaleString()}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{r.customer?.name}</p>
                  <p className="text-xs text-gray-400">{formatDate(r.createdAt)}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Licenses */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FaKey className="text-amber-600" /> Recent Licenses
          </h2>
          {stats.recentLicenses.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-6">No licenses yet.</p>
          ) : (
            <div className="space-y-2">
              {stats.recentLicenses.map((l) => (
                <div key={l.id} className="border border-gray-100 rounded-lg p-3">
                  <code className="bg-gray-100 px-1.5 py-0.5 rounded font-mono text-xs">{l.code}</code>
                  <p className="text-xs text-gray-500 mt-1">{l.customer?.name} · {l.app?.name}</p>
                  <p className="text-xs text-gray-400">{formatDate(l.createdAt)}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Downloads */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FaDownload className="text-teal-600" /> Recent Downloads
          </h2>
          {stats.recentDownloads.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-6">No downloads yet.</p>
          ) : (
            <div className="space-y-2">
              {stats.recentDownloads.map((d) => (
                <div key={d.id} className="border border-gray-100 rounded-lg p-3">
                  <p className="text-sm font-medium">{d.app?.name || "-"}</p>
                  <p className="text-xs text-gray-500">{d.customer?.name || "Guest"}</p>
                  <p className="text-xs text-gray-400">{formatDate(d.downloadedAt)}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
