import { cn } from "@/lib/utils";

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-surface-high", className)}
      {...props}
    />
  );
}

export function TableSkeleton({ cols, rows = 5 }: { cols: number; rows?: number }) {
  return (
    <div className="rounded-lg border border-outline overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="bg-surface-high border-b border-outline-low">
            {Array.from({ length: cols }).map((_, i) => (
              <th key={i} className="px-4 py-3">
                <Skeleton className="h-4 w-24" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, rowIdx) => (
            <tr key={rowIdx} className="border-b border-outline-low last:border-0">
              {Array.from({ length: cols }).map((_, colIdx) => (
                <td key={colIdx} className="px-4 py-3">
                  <Skeleton
                    className={cn(
                      "h-4",
                      colIdx === 0 ? "w-32" : colIdx === cols - 1 ? "w-16 ml-auto" : "w-24"
                    )}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
