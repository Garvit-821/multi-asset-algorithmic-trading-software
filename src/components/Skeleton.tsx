/**
 * Skeleton Loading Components
 * Reusable shimmer-based skeleton primitives that mirror the real UI layouts.
 */

interface SkeletonProps {
  className?: string;
}

/** Base shimmer block */
export function Skeleton({ className = '' }: SkeletonProps) {
  return <div className={`skeleton-shimmer rounded-md ${className}`} />;
}

/** ─── Page-level Skeletons ─────────────────────────────────────────── */

/** Skeleton for UserDashboard (Trading Feed) */
export function UserDashboardSkeleton() {
  return (
    <div className="space-y-6 p-6 bg-gray-50">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-4 w-56" />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-2 bg-white border border-gray-200 rounded-lg p-1">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-24 rounded-md" />
        ))}
      </div>

      {/* Feed Cards */}
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="bg-white border border-gray-200 rounded-lg p-5 space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start space-x-3 flex-1">
                <Skeleton className="w-10 h-10 rounded-lg shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-5 w-28" />
                    <Skeleton className="h-5 w-20 rounded-full" />
                  </div>
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-4 w-36" />
                </div>
              </div>
              <Skeleton className="h-4 w-16 shrink-0" />
            </div>
            <Skeleton className="h-16 w-full rounded-lg" />
            <div className="grid grid-cols-3 gap-3">
              <Skeleton className="h-14 rounded-lg" />
              <Skeleton className="h-14 rounded-lg" />
              <Skeleton className="h-14 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Skeleton for Dashboard (Analytics) */
export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-36" />
        <Skeleton className="h-4 w-64" />
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white border border-gray-200 rounded-lg p-6 space-y-3 shadow-sm">
            <div className="flex items-center justify-between">
              <Skeleton className="w-8 h-8 rounded-lg" />
              <Skeleton className="h-9 w-16" />
            </div>
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-3 w-20" />
          </div>
        ))}
      </div>

      {/* Two-column grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm space-y-4">
          <Skeleton className="h-5 w-40" />
          <div className="space-y-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Skeleton className="w-2 h-2 rounded-full" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <div className="flex items-center space-x-4">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-12" />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm space-y-4">
          <Skeleton className="h-5 w-36" />
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                <Skeleton className="w-2 h-2 rounded-full mt-2 shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom banner */}
      <Skeleton className="h-24 w-full rounded-lg" />
    </div>
  );
}

/** Skeleton for MarketDashboard (Trading Terminal) */
export function MarketDashboardSkeleton() {
  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Top Nav Bar */}
      <div className="border-b border-gray-200 bg-white px-6 py-4 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <Skeleton className="h-10 w-full max-w-xl rounded-lg" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-64 rounded-lg" />
            <Skeleton className="h-9 w-32 rounded-lg" />
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-7 w-28" />
          </div>
          <div className="flex items-center space-x-2">
            <Skeleton className="w-9 h-9 rounded-lg" />
            <Skeleton className="w-9 h-9 rounded-lg" />
          </div>
        </div>
      </div>

      {/* Main Layout */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Chart Area */}
        <div className="flex-1 p-4 sm:p-6">
          <Skeleton className="w-full h-full min-h-[400px] rounded-xl" />
        </div>

        {/* Right Panel */}
        <div className="w-full lg:w-80 bg-white border-t lg:border-t-0 lg:border-l border-gray-200 p-6 space-y-6 shrink-0">
          <div className="space-y-2">
            <Skeleton className="h-6 w-36" />
            <Skeleton className="h-4 w-48" />
          </div>
          <Skeleton className="h-10 w-full rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
          <Skeleton className="h-28 w-full rounded-lg" />
          <Skeleton className="h-12 w-full rounded-lg" />
        </div>
      </div>
    </div>
  );
}

/** Skeleton for SocialSentiment */
export function SocialSentimentSkeleton() {
  return (
    <div className="space-y-8 p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <Skeleton className="w-6 h-6 rounded" />
          <Skeleton className="h-7 w-80" />
        </div>
        <Skeleton className="h-4 w-2/3" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Panel */}
        <div className="space-y-8">
          {/* Fear & Greed Index */}
          <div className="bg-white border border-gray-200 rounded-3xl p-6 space-y-4">
            <Skeleton className="h-3 w-32 mx-auto" />
            <div className="flex flex-col items-center space-y-3 py-4">
              <Skeleton className="h-14 w-24" />
              <Skeleton className="h-7 w-28 rounded-full" />
            </div>
            <Skeleton className="h-2.5 w-full rounded-full" />
          </div>
          {/* Alert config */}
          <div className="bg-white border border-gray-200 rounded-3xl p-6 space-y-4">
            <Skeleton className="h-3 w-40" />
            <Skeleton className="h-9 w-full rounded-full" />
            <Skeleton className="h-9 w-full rounded-full" />
            <Skeleton className="h-9 w-full rounded-full" />
            <Skeleton className="h-9 w-full rounded-full" />
          </div>
        </div>

        {/* Right Panel */}
        <div className="lg:col-span-2 space-y-8">
          {/* Chart */}
          <div className="bg-white border border-gray-200 rounded-3xl p-6 space-y-4">
            <Skeleton className="h-3 w-52" />
            <Skeleton className="h-[180px] w-full rounded-xl" />
          </div>
          {/* Feed */}
          <div className="bg-white border border-gray-200 rounded-3xl p-6 space-y-4">
            <Skeleton className="h-5 w-40" />
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="space-y-2 pt-3 border-t border-gray-100 first:border-0 first:pt-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Skeleton className="h-4 w-14 rounded" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                    <Skeleton className="h-3 w-14" />
                  </div>
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-3 w-32" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Skeleton for MarketReplay */
export function MarketReplaySkeleton() {
  return (
    <div className="space-y-8 p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <Skeleton className="w-6 h-6 rounded" />
          <Skeleton className="h-7 w-72" />
        </div>
        <Skeleton className="h-4 w-3/5" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Event Selector */}
        <div className="bg-white border border-gray-200 rounded-3xl p-6 space-y-6">
          <div className="space-y-2">
            <Skeleton className="h-3 w-40" />
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="p-4 rounded-2xl border border-gray-200 space-y-2">
                <Skeleton className="h-4 w-36" />
                <Skeleton className="h-8 w-full" />
              </div>
            ))}
          </div>
          <div className="border-t border-gray-100 pt-4 space-y-3">
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-9 w-full rounded-full" />
            <div className="grid grid-cols-3 gap-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-8 rounded-full" />
              ))}
            </div>
          </div>
        </div>

        {/* Chart Panel */}
        <div className="bg-white border border-gray-200 rounded-3xl p-6 lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1.5">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-3 w-24" />
            </div>
            <div className="text-right space-y-1.5">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-7 w-28" />
            </div>
          </div>
          <Skeleton className="h-[250px] w-full rounded-xl" />
          <div className="border-t border-gray-100 pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <Skeleton className="h-4 w-48" />
              <div className="grid grid-cols-2 gap-3">
                <Skeleton className="h-16 rounded-2xl" />
                <Skeleton className="h-16 rounded-2xl" />
              </div>
            </div>
            <div className="flex flex-col justify-center space-y-3">
              <Skeleton className="h-12 w-full rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Skeleton for AdvancedBacktester */
export function BacktesterSkeleton() {
  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8">
      {/* Top Banner Header */}
      <Skeleton className="h-36 w-full rounded-3xl" />

      {/* Configuration Panel */}
      <div className="bg-white border border-gray-200 rounded-3xl p-6 space-y-6">
        <Skeleton className="h-5 w-56" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Skeleton className="h-12 w-full rounded-2xl" />
          <Skeleton className="h-12 w-full rounded-2xl" />
          <Skeleton className="h-12 w-full rounded-2xl" />
          <Skeleton className="h-12 w-full rounded-2xl" />
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-white border border-gray-200 rounded-3xl p-5 space-y-3">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-8 w-28" />
            <Skeleton className="h-3 w-16" />
          </div>
        ))}
      </div>

      {/* Main Chart Card */}
      <div className="bg-white border border-gray-200 rounded-3xl p-6 space-y-6">
        <Skeleton className="h-6 w-64" />
        <Skeleton className="h-[320px] w-full rounded-2xl" />
      </div>
    </div>
  );
}

/** Skeleton for the generic list-based views (PaperTrading, AIStrategy, etc.) */
export function GenericPageSkeleton() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-72" />
      </div>

      {/* Action Bar */}
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-48 rounded-lg" />
        <Skeleton className="h-10 w-32 rounded-lg" />
      </div>

      {/* Content Cards */}
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white border border-gray-200 rounded-lg p-5 space-y-3 shadow-sm">
            <div className="flex items-center justify-between">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-5 w-20 rounded-full" />
            </div>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <div className="grid grid-cols-3 gap-3 pt-2">
              <Skeleton className="h-12 rounded-lg" />
              <Skeleton className="h-12 rounded-lg" />
              <Skeleton className="h-12 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
