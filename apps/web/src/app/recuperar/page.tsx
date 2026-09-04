import type { Metadata } from "next";
import { PasswordResetForm } from "@/features/auth/password-reset-form";

export const metadata: Metadata = {
  title: "Recuperar acesso",
  robots: { index: false, follow: false },
};

export default function PasswordResetPage() {
  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="page-gutter flex min-h-[70vh] items-center py-16"
    >
      <div className="mx-auto w-full max-w-xl border border-ink/15 p-6 sm:p-12">
        <PasswordResetForm />
      </div>
    </main>
  );
}
