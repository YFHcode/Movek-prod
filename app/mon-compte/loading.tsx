import DashboardSkeleton from "@/components/dashboard/DashboardSkeleton";

export default function DashboardLoading() {
    return (
        <div className="space-y-6">
            {/* Welcome banner skeleton */}
            <div className="animate-pulse rounded-xl border border-movek-border bg-gradient-to-r from-movek-card to-[#1E3A5F] p-6">
                <div className="border-l-4 border-movek-orange pl-4 space-y-2">
                    <div className="h-6 w-48 rounded bg-movek-navy" />
                    <div className="h-4 w-32 rounded bg-movek-navy" />
                </div>
            </div>
            <DashboardSkeleton type="stat" />
            <DashboardSkeleton type="row" rows={3} />
        </div>
    );
}
