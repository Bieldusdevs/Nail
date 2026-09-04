import type { Metadata } from "next";
import { AccountDashboard } from "@/features/account/account-dashboard";

export const metadata: Metadata = {
  title: "A minha conta",
  robots: { index: false, follow: false },
};

export default function AccountPage() {
  return (
    <main id="main-content" tabIndex={-1}>
      <AccountDashboard />
    </main>
  );
}
