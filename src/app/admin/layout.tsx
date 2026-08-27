import { AdminMobileNav } from "./AdminMobileNav";
import { AdminSidebar } from "./AdminSidebar";

export default function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex min-h-[calc(100dvh-57px)]">
      <AdminSidebar />
      <div className="min-w-0 flex-1 pb-14 md:pb-0">{children}</div>
      <AdminMobileNav />
    </div>
  );
}
