const LoadingSkeleton = ({ className = "h-5 w-full", count = 1 }) => (
  <div className="space-y-2">
    {Array.from({ length: count }).map((_, idx) => (
      <div
        key={`skeleton-${idx + 1}`}
        className={`animate-pulse rounded-lg bg-slate-200 ${className}`}
      />
    ))}
  </div>
);

export default LoadingSkeleton;
