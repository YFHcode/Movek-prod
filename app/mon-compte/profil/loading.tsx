import DashboardSkeleton from "@/components/dashboard/DashboardSkeleton";

export default function ProfileLoading() {
    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <div className="h-6 w-32 animate-pulse rounded bg-movek-navy" />
                <div className="h-4 w-48 animate-pulse rounded bg-movek-navy" />
            </div>
            <DashboardSkeleton type="row" rows={4} />
        </div>
    );
}
