import { requireUser } from "@/lib/auth-utils";
import { DashboardNav } from "@/components/dashboard-nav";
import { ReportNotificationBell } from "@/components/report-notification-bell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();
  const showReportNotifications = user.role === "ADMIN" || user.role === "ANALISTA_DATOS";

  return (
    <div className="flex min-h-screen">
      <DashboardNav user={user} />
      <main className="flex-1 overflow-y-auto">
        {showReportNotifications && (
          <div className="sticky top-0 z-[1200] border-b border-border bg-background/90 backdrop-blur">
            <div className="flex justify-end px-8 py-3">
              <ReportNotificationBell role={user.role} />
            </div>
          </div>
        )}
        <div className="container mx-auto max-w-7xl p-8">{children}</div>
      </main>
    </div>
  );
}
