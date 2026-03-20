export const LoadingSkeleton = () => (
  <div className="container mx-auto px-4 py-8 max-w-6xl animate-pulse">
    <div className="h-12 bg-muted rounded-xl mb-8 w-1/2"></div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-6">
        <div className="h-64 bg-muted rounded-xl"></div>
        <div className="h-32 bg-muted rounded-xl"></div>
      </div>
      <div className="space-y-6">
        <div className="h-48 bg-muted rounded-xl"></div>
        <div className="h-32 bg-muted rounded-xl"></div>
      </div>
    </div>
  </div>
);
