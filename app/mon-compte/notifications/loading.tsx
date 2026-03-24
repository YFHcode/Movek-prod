import DashboardSkeleton from "@/components/dashboard/DashboardSkeleton";

export default function NotificationsLoading() {
    return (
        <div className="space-y-6">
            <div className="h-6 w-44 animate-pulse rounded bg-movek-navy" />
            <DashboardSkeleton type="row" rows={5} />
        </div>
    );
}
