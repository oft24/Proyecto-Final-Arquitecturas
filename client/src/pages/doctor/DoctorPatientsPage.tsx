import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { Header } from "../../components/layout/Header";

const patients = [
  { initials: "AM", name: "Ana Martinez Garcia", meta: "34 anos · Femenino · O+", visit: "15 Abr 2026", conditions: 2 },
  { initials: "CR", name: "Carlos Rodriguez Lopez", meta: "45 anos · Masculino · A+", visit: "20 Abr 2026", conditions: 1 },
];

export default function DoctorPatientsPage() {
  return (
    <DashboardLayout>
      <Header title="Mis Pacientes" subtitle="Administra expedientes medicos digitales" />
      <section className="card-shell p-4">
        <div className="mb-3 rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white">Lista de Pacientes</div>
        <div className="space-y-2">
          {patients.map((patient) => (
            <article key={patient.name} className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-xs font-semibold text-blue-700">{patient.initials}</div>
                <div>
                  <p className="font-semibold">{patient.name}</p>
                  <p className="text-xs text-slate-500">{patient.meta}</p>
                </div>
              </div>
              <div className="text-right text-xs">
                <p className="text-slate-500">Ultima visita</p>
                <p className="font-semibold">{patient.visit}</p>
                <span className="rounded-full bg-amber-100 px-2 py-1 text-amber-700">{patient.conditions} condiciones</span>
              </div>
            </article>
          ))}
        </div>
      </section>
    </DashboardLayout>
  );
}
