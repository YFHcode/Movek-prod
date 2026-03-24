import DashboardSkeleton from "@/components/dashboard/DashboardSkeleton";

export default function OrdersLoading() {
    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <div className="h-6 w-40 animate-pulse rounded bg-movek-navy" />
                <div className="h-4 w-56 animate-pulse rounded bg-movek-navy" />
            </div>
            <DashboardSkeleton type="row" rows={5} />
        </div>
    );
}
