import type { Metadata } from "next";
import { RegistrationForm } from "@/features/auth/registration-form";

export const metadata: Metadata = {
  title: "Criar conta",
  robots: { index: false, follow: false },
};

export default function RegistrationPage() {
  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="page-gutter py-12 md:py-20"
    >
      <div className="mx-auto max-w-3xl border border-ink/15 p-6 sm:p-12 md:p-16">
        <RegistrationForm />
      </div>
    </main>
  );
}
