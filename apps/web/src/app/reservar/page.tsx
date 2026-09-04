import type { Metadata } from "next";
import { Suspense } from "react";
import { BookingWizard } from "@/features/booking/booking-wizard";

export const metadata: Metadata = {
  title: "Fazer uma marcação",
  description:
    "Escolhe o serviço, a artista e o horário para a tua próxima sessão no Lume Atelier.",
  robots: { index: true, follow: true },
};

function BookingSkeleton() {
  return (
    <div
      className="page-gutter min-h-screen py-14"
      aria-label="A carregar marcações"
    >
      <div className="h-24 w-2/3 skeleton-shimmer" />
      <div className="mt-14 grid gap-6 sm:grid-cols-2">
        <div className="h-64 skeleton-shimmer" />
        <div className="h-64 skeleton-shimmer" />
      </div>
    </div>
  );
}

export default function BookingPage() {
  return (
    <main id="main-content" tabIndex={-1}>
      <Suspense fallback={<BookingSkeleton />}>
        <BookingWizard />
      </Suspense>
    </main>
  );
}
