export default function LoadingSkeleton({ cols = 5, count = 5 }: { cols?: number; count?: number }) {
  const colClass: Record<number, string> = {
    2: "grid-cols-2",
    3: "grid-cols-2 md:grid-cols-3",
    4: "grid-cols-2 md:grid-cols-3 lg:grid-cols-4",
    5: "grid-cols-2 md:grid-cols-3 lg:grid-cols-5",
  };
  return (
    <div className={`grid ${colClass[cols] ?? colClass[5]} gap-x-4 gap-y-10`}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i}>
          <div className="bg-grey-100 aspect-[4/5] animate-pulse" />
          <div className="mt-3.5 space-y-2">
            <div className="h-[15px] bg-grey-100 animate-pulse w-3/4" />
            <div className="h-[15px] bg-grey-100 animate-pulse w-1/3" />
          </div>
        </div>
      ))}
    </div>
  );
}
