import type { Metadata } from "next";
import { AdminDashboard } from "@/features/admin/admin-dashboard";

export const metadata: Metadata = {
  title: "Administração",
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return (
    <main id="main-content" tabIndex={-1}>
      <AdminDashboard />
    </main>
  );
}
