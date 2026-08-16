"use client";

import { useState, useEffect, useCallback } from "react";
import {
  FaDownload,
  FaChartLine,
  FaCalendarDay,
  FaCalendarWeek,
  FaCalendarAlt,
  FaInfinity,
  FaDatabase,
} from "react-icons/fa";

export default function AdminAnalytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [appId, setAppId] = useState("");
  const [range, setRange] = useState("30");

  const loadAnalytics = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (appId) params.set("appId", appId);
      params.set("range", range);
      const res = await fetch("/api/admin/analytics?" + params.toString());
      const d = await res.json();
      if (res.ok) setData(d);
      else setError(d.error || "Failed to load analytics");
    } catch {
      setError("Failed to load analytics");
    } finally {
      setLoading(false);
    }
  }, [appId, range]);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  const formatDate = (d) => {
    if (!d) return "";
    const x = new Date(d);
    return x.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  // Compute bar chart dimensions
  const series = data?.graph?.series || [];
  const max = data?.graph?.max || 1;
  const chartHeight = 220;

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <FaChartLine className="text-indigo-600 text-2xl" />
        <h1 className="text-2xl font-bold text-gray-900">Download Analytics</h1>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-600">App:</label>
          <select
            value={appId}
            onChange={(e) => setAppId(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white"
          >
            <option value="">All Apps</option>
            {data?.apps?.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-600">Range:</label>
          <select
            value={range}
            onChange={(e) => setRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="all">All time</option>
          </select>
        </div>
      </div>

      {error && (
        <p className="bg-red-50 text-red-600 px-4 py-3 rounded-lg mb-4 text-sm">
          {error}
        </p>
      )}

      {loading ? (
        <p className="text-gray-500 text-center py-16">
          Loading download analytics...
        </p>
      ) : (
        data && (
          <>
            {/* Summary cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Today</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      {data.downloadsToday}
                    </p>
                  </div>
                  <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center">
                    <FaCalendarDay />
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">This Week</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      {data.downloadsThisWeek}
                    </p>
                  </div>
                  <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center">
                    <FaCalendarWeek />
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">This Month</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      {data.downloadsThisMonth}
                    </p>
                  </div>
                  <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-lg flex items-center justify-center">
                    <FaCalendarAlt />
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Total Downloads</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      {data.totalDownloads}
                    </p>
                  </div>
                  <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-lg flex items-center justify-center">
                    <FaDatabase />
                  </div>
                </div>
              </div>
            </div>

            {/* Graph */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-gray-900">
                  {data.selectedApp
                    ? `${data.selectedApp.name} — Downloads`
                    : "All Applications — Downloads"}
                </h2>
                <span className="text-sm text-gray-500">
                  {data.graph.label}
                </span>
              </div>

              {series.length === 0 || data.totalDownloads === 0 ? (
                <p className="text-gray-500 text-center py-16 text-sm">
                  No downloads recorded in this period.
                </p>
              ) : (
                <div className="flex items-end gap-1 h-[220px] w-full overflow-x-auto">
                  {series.map((s) => {
                    const h =
                      s.count === 0 ? 2 : Math.max(3, (s.count / max) * chartHeight);
                    return (
                      <div
                        key={s.date}
                        className="flex-1 min-w-[6px] flex flex-col items-center justify-end h-full group"
                        title={`${s.date}: ${s.count} download${
                          s.count === 1 ? "" : "s"
                        }`}
                      >
                        <div
                          className="w-full rounded-t bg-gradient-to-t from-indigo-500 to-purple-500 group-hover:from-indigo-600 group-hover:to-purple-600 transition-all"
                          style={{ height: `${h}px` }}
                        ></div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* X-axis labels (first, middle, last) */}
              {series.length > 0 && data.totalDownloads > 0 && (
                <div className="flex justify-between mt-2 text-xs text-gray-400">
                  <span>{formatDate(series[0]?.date)}</span>
                  <span>
                    {formatDate(
                      series[Math.floor(series.length / 2)]?.date
                    )}
                  </span>
                  <span>{formatDate(series[series.length - 1]?.date)}</span>
                </div>
              )}
            </div>

            {/* Per-app breakdown (only when viewing all apps) */}
            {!appId && data.perApp.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="font-semibold text-gray-900 mb-4">
                  Downloads by Application
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {data.perApp.map((a) => (
                    <div
                      key={a.id}
                      className="flex items-center gap-3 border border-gray-100 rounded-lg p-3"
                    >
                      {a.logo ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={a.logo}
                          alt={a.name}
                          className="w-10 h-10 object-contain rounded-md bg-gray-50"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-md bg-indigo-100 flex items-center justify-center text-indigo-600">
                          <FaDownload />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {a.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {a.downloads} download{a.downloads === 1 ? "" : "s"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )
      )}
    </div>
  );
}

