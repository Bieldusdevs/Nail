export default function Loading() {
  return (
    <div
      className="page-gutter flex min-h-[60vh] items-center justify-center"
      role="status"
    >
      <div className="text-center">
        <span className="mx-auto block size-10 animate-spin rounded-full border border-ink border-r-transparent" />
        <p className="mt-4 text-xs uppercase tracking-[0.08em] text-graphite">
          A preparar
        </p>
      </div>
    </div>
  );
}
