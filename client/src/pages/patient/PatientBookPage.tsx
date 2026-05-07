import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { Header } from "../../components/layout/Header";

export default function PatientBookPage() {
  return (
    <DashboardLayout>
      <Header title="Agendar Nueva Cita" subtitle="Selecciona un medico especialista y horario disponible" />
      <section className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        <article className="card-shell p-4">
          <p className="text-2xl font-bold">Dra. Maria Gonzalez</p>
          <p className="text-sm text-slate-500">Cardiologia · 4.9</p>
          <p className="my-3 text-sm">Especialista en cardiologia preventiva con enfoque en enfermedades cardiovasculares.</p>
          <button className="w-full rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white">Ver disponibilidad y agendar</button>
        </article>
        <article className="card-shell p-4">
          <p className="text-2xl font-bold">Dr. Jose Ramirez</p>
          <p className="text-sm text-slate-500">Medicina General · 4.8</p>
          <p className="my-3 text-sm">Medico general con amplia experiencia en atencion primaria y prevencion.</p>
          <button className="w-full rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white">Ver disponibilidad y agendar</button>
        </article>
      </section>
    </DashboardLayout>
  );
}
