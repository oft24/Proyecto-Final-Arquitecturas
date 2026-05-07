export function AlertCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">
      <p className="text-sm font-semibold text-amber-900">{title}</p>
      <p className="text-xs text-amber-700">{description}</p>
    </div>
  );
}
