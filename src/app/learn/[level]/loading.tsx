export default function LevelLoading() {
  return (
    <div className="min-h-screen bg-bg flex">
      {/* Terminal pane skeleton */}
      <div className="flex-1 flex flex-col">
        {/* Toolbar skeleton */}
        <div className="h-10 border-b border-card-border bg-card-bg flex items-center px-4 gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-text-muted/20" />
          <div className="w-2.5 h-2.5 rounded-full bg-text-muted/20" />
          <div className="w-2.5 h-2.5 rounded-full bg-text-muted/20" />
          <div className="w-20 h-3 rounded bg-text-muted/10 ml-2" />
        </div>

        {/* Terminal body skeleton */}
        <div className="flex-1 bg-bg-terminal p-5 space-y-3">
          <div className="flex gap-2 items-center">
            <div className="w-24 h-3 rounded bg-accent/10" />
            <div className="w-32 h-3 rounded bg-text-muted/10" />
          </div>
          <div className="flex gap-2 items-center">
            <div className="w-24 h-3 rounded bg-accent/10" />
            <div className="w-40 h-3 rounded bg-text-muted/10" />
          </div>
          <div className="flex gap-2 items-center">
            <div className="w-24 h-3 rounded bg-accent/10" />
            <div className="w-2 h-4 rounded-sm bg-accent/30 animate-pulse" />
          </div>
        </div>
      </div>

      {/* Sidebar skeleton */}
      <div className="hidden md:flex w-80 border-l border-card-border bg-card-bg flex-col">
        <div className="h-10 border-b border-card-border flex items-center px-4">
          <div className="w-24 h-3 rounded bg-text-muted/10" />
        </div>
        <div className="p-4 space-y-4">
          <div className="w-full h-4 rounded bg-text-muted/10" />
          <div className="w-3/4 h-4 rounded bg-text-muted/10" />
          <div className="w-5/6 h-4 rounded bg-text-muted/10" />
          <div className="w-2/3 h-4 rounded bg-text-muted/10" />
        </div>
      </div>
    </div>
  );
}
