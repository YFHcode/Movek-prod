import React from "react";
import AdminNotificationsPage from "@/components/admin/AdminNotificationsPage";
import { getAdminSentNotifications } from "@/app/actions/admin_notifications";

export default async function Page() {
    const notifications = await getAdminSentNotifications();

    return <AdminNotificationsPage notifications={notifications} />;
}
