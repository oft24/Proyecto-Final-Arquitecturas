export function AppointmentCard({
  time,
  patient,
  detail,
  status,
}: {
  time: string;
  patient: string;
  detail: string;
  status: "Confirmada" | "Pendiente";
}) {
  return (
    <div className="mb-3 flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex items-center gap-4">
        <div className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-bold text-white">{time}</div>
        <div>
          <p className="font-semibold">{patient}</p>
          <p className="text-xs text-slate-500">{detail}</p>
        </div>
      </div>
      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${status === "Confirmada" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
        {status}
      </span>
    </div>
  );
}
