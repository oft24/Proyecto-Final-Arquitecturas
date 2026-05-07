import { Bell, CalendarClock, HeartPulse, NotebookTabs } from "lucide-react";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { Header } from "../../components/layout/Header";
import { StatsCard } from "../../components/cards/StatsCard";

export default function PatientDashboardPage() {
  return (
    <DashboardLayout>
      <Header title="Bienvenido, Juan" subtitle="miercoles, 6 de mayo de 2026 · 10:26 p.m." />
      <section className="card-shell mb-4 border-emerald-300 bg-emerald-50 p-4">
        <h3 className="mb-2 text-xl font-bold text-emerald-900">Tu Proxima Cita</h3>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-[2fr_1fr]">
          <div>
            <p className="text-2xl font-bold">Dra. Maria Gonzalez</p>
            <p className="text-sm text-slate-600">Viernes, 9 de Mayo 2026 · 10:00 AM · Consultorio 1</p>
          </div>
          <div className="space-y-2">
            <button className="w-full rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white">Confirmar Asistencia</button>
            <button className="w-full rounded-lg border border-red-300 bg-white px-3 py-2 text-sm text-red-600">Cancelar Cita</button>
            <button className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm">Reagendar</button>
          </div>
        </div>
      </section>
      <section className="mb-4 grid grid-cols-1 gap-3 lg:grid-cols-4">
        <StatsCard title="Citas Completadas" value="12" tone="red" icon={HeartPulse} />
        <StatsCard title="Proximas Citas" value="2" tone="blue" icon={CalendarClock} />
        <StatsCard title="Recordatorios" value="3" tone="green" icon={Bell} />
        <StatsCard title="Medicos Visitados" value="4" tone="purple" icon={NotebookTabs} />
      </section>
    </DashboardLayout>
  );
}
