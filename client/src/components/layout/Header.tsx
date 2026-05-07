import { Bell } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export function Header({ title, subtitle }: { title: string; subtitle: string }) {
  const { user } = useAuth();
  return (
    <header className="mb-4 flex items-center justify-between">
      <div>
        <h1 className="text-4xl font-bold">{title}</h1>
        <p className="text-sm text-slate-500">{subtitle}</p>
      </div>
      <div className="flex items-center gap-3">
        <button className="rounded-lg border border-slate-200 bg-white p-2"><Bell className="h-4 w-4" /></button>
        <div className="rounded-lg bg-white px-3 py-2 text-right text-xs shadow-sm">
          <p className="font-semibold">{user?.name}</p>
          <p className="text-slate-500">{user?.role}</p>
        </div>
      </div>
    </header>
  );
}
