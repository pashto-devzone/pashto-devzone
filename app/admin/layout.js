export const metadata = {
  robots: { index: false, follow: false },
};

import AdminLayoutClient from "./AdminLayoutClient";

export default function AdminLayout({ children }) {
  return <AdminLayoutClient>{children}</AdminLayoutClient>;
}