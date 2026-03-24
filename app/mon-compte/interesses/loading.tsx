import DashboardSkeleton from "@/components/dashboard/DashboardSkeleton";

export default function InterestsLoading() {
    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <div className="h-6 w-48 animate-pulse rounded bg-movek-navy" />
                <div className="h-4 w-64 animate-pulse rounded bg-movek-navy" />
            </div>
            <DashboardSkeleton type="card" rows={6} />
        </div>
    );
}
