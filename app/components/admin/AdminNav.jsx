"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  FaThLarge,
  FaCubes,
  FaCodeBranch,
  FaKey,
  FaCog,
  FaReceipt,
  FaSignOutAlt,
  FaBars,
  FaTimes,
  FaDownload,
  FaChartLine,
} from "react-icons/fa";

export default function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

const navItems = [
    { name: "Dashboard", path: "/admin/dashboard", icon: <FaThLarge /> },
    { name: "Apps", path: "/admin/apps", icon: <FaCubes /> },
    { name: "Versions", path: "/admin/versions", icon: <FaCodeBranch /> },
    { name: "Licenses", path: "/admin/licenses", icon: <FaKey /> },
    { name: "Receipt Generator", path: "/admin/receipts", icon: <FaReceipt /> },
    { name: "Downloads", path: "/admin/downloads", icon: <FaDownload /> },
    { name: "Analytics", path: "/admin/analytics", icon: <FaChartLine /> },
    { name: "Settings", path: "/admin/settings", icon: <FaCog /> },
  ];

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/logout", { method: "POST" });
    } catch {}
    router.push("/admin");
  };

  const handleNavigate = () => setMobileOpen(false);

  const renderNavItems = () =>
    navItems.map((item) => {
      const isActive = pathname === item.path;
      return (
        <Link
          key={item.path}
          href={item.path}
          onClick={handleNavigate}
          className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
            isActive
              ? "bg-indigo-600 text-white"
              : "text-gray-300 hover:bg-gray-800 hover:text-white"
          }`}
        >
          <span className="text-lg">{item.icon}</span>
          <span>{item.name}</span>
        </Link>
      );
    });

  const renderLogout = () => (
    <button
      onClick={handleLogout}
      className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-red-600 hover:text-white transition-colors mt-4 w-full"
    >
      <FaSignOutAlt className="text-lg" />
      <span>Logout</span>
    </button>
  );

  return (
    <>
      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-gray-900 text-white flex items-center justify-between px-4 py-3 shadow-lg">
        <div className="flex items-center gap-2">
          <h1 className="text-base font-bold">Admin Panel</h1>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-lg hover:bg-gray-800 transition-colors"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/50"
          onClick={() => setMobileOpen(false)}
        >
          <nav
            className="bg-gray-900 text-white w-72 max-w-[85vw] h-full p-4 flex flex-col overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-lg font-bold">Admin Panel</h1>
              <button
                onClick={() => setMobileOpen(false)}
                className="p-2 rounded-lg hover:bg-gray-800 transition-colors"
                aria-label="Close menu"
              >
                <FaTimes />
              </button>
            </div>
            <div className="flex-1 space-y-1">{renderNavItems()}</div>
            {renderLogout()}
          </nav>
        </div>
      )}

      {/* Desktop sidebar */}
      <nav className="hidden lg:flex bg-gray-900 text-white w-64 min-h-screen p-4 flex-col shrink-0 sticky top-0 h-screen overflow-y-auto">
        <div className="mb-8">
          <h1 className="text-xl font-bold">Admin Panel</h1>
          <p className="text-xs text-gray-400 mt-1">Pashto DevZone</p>
        </div>
        <div className="flex-1 space-y-1">{renderNavItems()}</div>
        {renderLogout()}
      </nav>
    </>
  );
}
