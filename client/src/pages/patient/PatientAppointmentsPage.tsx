import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { Header } from "../../components/layout/Header";

export default function PatientAppointmentsPage() {
  return (
    <DashboardLayout>
      <Header title="Mis Citas" subtitle="Historial completo y proximas citas medicas" />
      <section className="card-shell p-4">
        <div className="mb-3 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white">Gestion de Citas</div>
        <article className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold">Dra. Maria Gonzalez</p>
              <p className="text-sm text-slate-600">9 May 2026 · 10:00 AM · Control Cardiologico</p>
            </div>
            <div className="space-y-2">
              <button className="block rounded-lg bg-emerald-100 px-3 py-1 text-xs">Ver Detalles</button>
              <button className="block rounded-lg border border-slate-300 px-3 py-1 text-xs">Reagendar</button>
            </div>
          </div>
        </article>
      </section>
    </DashboardLayout>
  );
}
