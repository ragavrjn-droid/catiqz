import React from 'react';

export function SkeletonLoader({ className = '' }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-muted rounded ${className}`} />
  );
}

export function EventCardSkeleton() {
  return (
    <div className="bg-card border border-border rounded-xl p-4 space-y-3">
      <div className="flex items-start gap-3">
        <SkeletonLoader className="w-8 h-8 rounded-full" />
        <div className="flex-1 space-y-2">
          <SkeletonLoader className="h-4 w-20" />
          <SkeletonLoader className="h-5 w-full" />
          <SkeletonLoader className="h-4 w-3/4" />
        </div>
      </div>
      <div className="flex gap-2">
        <SkeletonLoader className="h-8 w-16" />
        <SkeletonLoader className="h-8 w-20" />
        <SkeletonLoader className="h-8 w-16" />
      </div>
    </div>
  );
}

export function StockCardSkeleton() {
  return (
    <div className="bg-card border border-border rounded-xl p-4 space-y-3">
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <SkeletonLoader className="h-6 w-24" />
          <SkeletonLoader className="h-4 w-32" />
        </div>
        <SkeletonLoader className="h-8 w-20" />
      </div>
      <SkeletonLoader className="h-16 w-full" />
    </div>
  );
}
