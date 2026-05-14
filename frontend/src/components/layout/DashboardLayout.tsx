import { Sidebar } from "./Sidebar";
import type { ReactNode } from "react";
import type { UserRole } from "../../context/AuthContext";

export function DashboardLayout({ children, role }: { children: ReactNode; role?: UserRole }) {
  return (
    <div className="flex min-h-screen bg-slate-100">
      <Sidebar role={role} />
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
