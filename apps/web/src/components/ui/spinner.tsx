export function Spinner({ label = "A carregar" }: { label?: string }) {
  return (
    <span className="inline-flex items-center gap-2" role="status">
      <span className="size-4 animate-spin rounded-full border border-current border-r-transparent" />
      <span className="sr-only">{label}</span>
    </span>
  );
}
