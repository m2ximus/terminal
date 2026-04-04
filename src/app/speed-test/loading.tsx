export default function SpeedTestLoading() {
  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-6">
      <div className="max-w-2xl w-full">
        {/* Header skeleton */}
        <div className="text-center mb-10">
          <div className="w-40 h-5 rounded bg-text-muted/10 mx-auto mb-3" />
          <div className="w-64 h-3 rounded bg-text-muted/10 mx-auto" />
        </div>

        {/* Terminal card skeleton */}
        <div className="rounded-xl border border-card-border bg-card-bg overflow-hidden">
          {/* Toolbar */}
          <div className="h-10 border-b border-card-border flex items-center px-4 gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-text-muted/20" />
            <div className="w-2.5 h-2.5 rounded-full bg-text-muted/20" />
            <div className="w-2.5 h-2.5 rounded-full bg-text-muted/20" />
            <div className="w-20 h-3 rounded bg-text-muted/10 ml-2" />
          </div>

          {/* Body */}
          <div className="p-6 space-y-4">
            <div className="w-48 h-4 rounded bg-text-muted/10" />
            <div className="w-full h-3 rounded bg-text-muted/10" />
            <div className="w-3/4 h-3 rounded bg-text-muted/10" />
            <div className="flex gap-2 items-center mt-6">
              <div className="w-24 h-3 rounded bg-accent/10" />
              <div className="w-2 h-4 rounded-sm bg-accent/30 animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
