import type { Metadata } from "next";
import { Suspense } from "react";
import { PasswordResetConfirmForm } from "@/features/auth/password-reset-confirm-form";

export const metadata: Metadata = {
  title: "Definir nova palavra-passe",
  robots: { index: false, follow: false },
};

export default function PasswordResetConfirmPage() {
  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="page-gutter flex min-h-[70vh] items-center py-16"
    >
      <div className="mx-auto w-full max-w-xl border border-ink/15 p-6 sm:p-12">
        <Suspense fallback={<div className="h-96 skeleton-shimmer" />}>
          <PasswordResetConfirmForm />
        </Suspense>
      </div>
    </main>
  );
}
