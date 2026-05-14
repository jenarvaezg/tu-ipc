export default function LazyFallback() {
  return (
    <div className="mb-6 rounded-xl border border-border bg-card p-6 animate-pulse">
      <div className="mb-4 h-5 w-40 rounded bg-muted" />
      <div className="h-56 rounded bg-muted/70" />
      <span className="sr-only">Cargando contenido</span>
    </div>
  );
}
