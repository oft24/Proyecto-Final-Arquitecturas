import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { Header } from "../../components/layout/Header";

export default function PatientRecordsPage() {
  return (
    <DashboardLayout>
      <Header title="Mi Expediente Medico" subtitle="Informacion medica personal completa" />
      <section className="mb-4 grid grid-cols-1 gap-3 lg:grid-cols-3">
        <div className="card-shell">
          <div className="rounded-t-2xl bg-amber-700 px-4 py-3 text-sm font-semibold text-white">Condiciones Activas</div>
          <div className="p-4 text-sm">Hipertension · Diabetes Tipo 2</div>
        </div>
        <div className="card-shell">
          <div className="rounded-t-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white">Medicamentos</div>
          <div className="p-4 text-sm">Metformina 500mg · Losartan 50mg</div>
        </div>
        <div className="card-shell">
          <div className="rounded-t-2xl bg-red-600 px-4 py-3 text-sm font-semibold text-white">Alergias</div>
          <div className="p-4 text-sm">Penicilina · Polen</div>
        </div>
      </section>
      <section className="card-shell p-4">
        <div className="mb-3 rounded-lg bg-purple-700 px-3 py-2 text-sm font-semibold text-white">Notas Medicas Recientes</div>
        <p className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm">Control rutinario completado. Presion arterial estable.</p>
      </section>
    </DashboardLayout>
  );
}
