export default function DashboardSkeleton({
    rows = 3,
    type = "card",
}: {
    rows?: number;
    type?: "card" | "row" | "stat";
}) {
    if (type === "stat") {
        return (
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div
                        key={i}
                        className="animate-pulse rounded-xl border border-movek-border bg-movek-card p-5"
                    >
                        <div className="mb-3 h-8 w-8 rounded-full bg-movek-navy" />
                        <div className="mb-2 h-6 w-16 rounded bg-movek-navy" />
                        <div className="h-4 w-24 rounded bg-movek-navy" />
                    </div>
                ))}
            </div>
        );
    }

    if (type === "row") {
        return (
            <div className="space-y-3">
                {Array.from({ length: rows }).map((_, i) => (
                    <div
                        key={i}
                        className="animate-pulse rounded-xl border border-movek-border bg-movek-card p-4"
                    >
                        <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-full bg-movek-navy" />
                            <div className="flex-1 space-y-2">
                                <div className="h-4 w-3/4 rounded bg-movek-navy" />
                                <div className="h-3 w-1/2 rounded bg-movek-navy" />
                            </div>
                            <div className="h-6 w-20 rounded-full bg-movek-navy" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: rows }).map((_, i) => (
                <div
                    key={i}
                    className="animate-pulse rounded-xl border border-movek-border bg-movek-card overflow-hidden"
                >
                    <div className="aspect-square bg-movek-navy" />
                    <div className="space-y-3 p-4">
                        <div className="h-4 w-3/4 rounded bg-movek-navy" />
                        <div className="h-3 w-full rounded bg-movek-navy" />
                        <div className="h-3 w-1/2 rounded bg-movek-navy" />
                        <div className="h-10 w-full rounded-full bg-movek-navy" />
                    </div>
                </div>
            ))}
        </div>
    );
}
