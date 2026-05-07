import type { LucideIcon } from "lucide-react";

export function StatsCard({
  title,
  value,
  subtitle,
  tone,
  icon: Icon,
}: {
  title: string;
  value: string;
  subtitle?: string;
  tone: "blue" | "green" | "yellow" | "red" | "purple";
  icon: LucideIcon;
}) {
  const tones = {
    blue: "bg-blue-100 text-blue-600",
    green: "bg-emerald-100 text-emerald-600",
    yellow: "bg-amber-100 text-amber-600",
    red: "bg-red-100 text-red-600",
    purple: "bg-purple-100 text-purple-600",
  };

  return (
    <div className={`card-shell p-4 ${tones[tone]}`}>
      <div className="mb-2 flex items-center justify-between">
        <h4 className="text-xs font-semibold uppercase tracking-wide">{title}</h4>
        <Icon className="h-5 w-5" />
      </div>
      <p className="text-4xl font-bold">{value}</p>
      {subtitle && <p className="text-xs">{subtitle}</p>}
    </div>
  );
}
