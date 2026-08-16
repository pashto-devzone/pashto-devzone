"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import AdminNav from "../components/admin/AdminNav";

export default function AdminLayoutClient({ children }) {
  const [authed, setAuthed] = useState(false);
  const [checking, setChecking] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (pathname === "/admin" || pathname === "/admin/") {
      setChecking(false);
      return;
    }

    fetch("/api/admin/me")
      .then((res) => {
        if (res.ok) setAuthed(true);
        else router.replace("/admin");
      })
      .catch(() => router.replace("/admin"))
      .finally(() => setChecking(false));
  }, [pathname, router]);

  if (pathname === "/admin" || pathname === "/admin/") return children;

  if (checking) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-100"><p className="text-gray-500">Loading...</p></div>;
  }

  if (!authed) return null;

  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminNav />
      <main className="flex-1 p-4 md:p-6 pt-16 lg:pt-6 overflow-x-hidden">
        <div className="max-w-full">{children}</div>
      </main>
    </div>
  );
}
