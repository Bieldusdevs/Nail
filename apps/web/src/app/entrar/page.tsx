import type { Metadata } from "next";
import Image from "next/image";
import { LoginForm } from "@/features/auth/login-form";

export const metadata: Metadata = {
  title: "Entrar",
  description: "Acede à tua conta Lume para gerir marcações.",
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="page-gutter py-10 md:py-16"
    >
      <div className="grid min-h-[42rem] border border-ink/15 lg:grid-cols-2">
        <div className="flex items-center p-6 sm:p-12 lg:p-16">
          <div className="mx-auto w-full max-w-lg">
            <LoginForm />
          </div>
        </div>
        <div className="relative hidden overflow-hidden bg-pink lg:block">
          <Image
            src="/images/editorial-red.jpg"
            alt="Manicure vermelha brilhante sobre linho em tom cru"
            fill
            sizes="50vw"
            className="object-cover"
          />
          <p className="absolute bottom-6 left-6 rounded-pill bg-bone px-4 py-2 text-[0.65rem] font-medium uppercase tracking-[0.08em]">
            Lume members
          </p>
        </div>
      </div>
    </main>
  );
}
