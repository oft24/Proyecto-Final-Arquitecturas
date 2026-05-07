import { AlertCircle, Clock3, Users } from "lucide-react";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { Header } from "../../components/layout/Header";
import { StatsCard } from "../../components/cards/StatsCard";
import { AppointmentCard } from "../../components/cards/AppointmentCard";
import { AlertCard } from "../../components/cards/AlertCard";

export default function DoctorDashboardPage() {
  return (
    <DashboardLayout>
      <Header title="Bienvenida, Dra. Gonzalez" subtitle="miercoles, 6 de mayo de 2026 · 10:24 p.m." />
      <section className="mb-4 grid grid-cols-1 gap-3 lg:grid-cols-3">
        <StatsCard title="Pacientes Hoy" value="12" subtitle="+2 vs ayer" tone="blue" icon={Users} />
        <StatsCard title="Citas Pendientes" value="3" subtitle="Requieren confirmacion" tone="yellow" icon={Clock3} />
        <StatsCard title="Canceladas Hoy" value="2" subtitle="12% del total" tone="red" icon={AlertCircle} />
      </section>
      <section className="grid grid-cols-1 gap-4 xl:grid-cols-[2fr_1fr]">
        <div className="card-shell p-4">
          <div className="mb-3 flex items-center justify-between rounded-xl bg-blue-600 p-3 text-white">
            <h3 className="font-semibold">Agenda de Hoy</h3>
            <button className="rounded bg-white px-3 py-1 text-xs font-semibold text-slate-900">+ Nueva Cita</button>
          </div>
          <AppointmentCard time="09:00 AM" patient="Ana Martinez" detail="Consulta general · Consultorio 1" status="Confirmada" />
          <AppointmentCard time="10:30 AM" patient="Carlos Rodriguez" detail="Control cardiologico · Consultorio 1" status="Confirmada" />
          <AppointmentCard time="11:00 AM" patient="Laura Sanchez" detail="Primera cita · Consultorio 1" status="Pendiente" />
        </div>
        <div className="space-y-4">
          <div className="card-shell p-4">
            <h3 className="mb-3 text-lg font-semibold">Acciones Rapidas</h3>
            <div className="space-y-2">
              <button className="w-full rounded-lg bg-blue-600 px-3 py-2 text-left text-sm font-semibold text-white">Nueva Cita</button>
              <button className="w-full rounded-lg border border-slate-300 px-3 py-2 text-left text-sm">Buscar Paciente</button>
              <button className="w-full rounded-lg border border-slate-300 px-3 py-2 text-left text-sm">Ver Agenda Semanal</button>
            </div>
          </div>
          <div className="card-shell bg-amber-50 p-4">
            <h3 className="mb-3 text-lg font-semibold text-amber-900">Alertas</h3>
            <div className="space-y-2">
              <AlertCard title="3 citas sin confirmar" description="Requieren llamada de confirmacion" />
              <AlertCard title="2 expedientes incompletos" description="Pendientes de actualizar" />
            </div>
          </div>
          <div className="card-shell bg-purple-50 p-4">
            <h3 className="mb-3 text-lg font-semibold text-purple-900">Resumen de la Semana</h3>
            <p className="text-sm text-slate-700">Total de pacientes: <strong>58</strong></p>
            <p className="text-sm text-slate-700">Consultas realizadas: <strong>42</strong></p>
            <p className="text-sm text-slate-700">Tasa de asistencia: <strong className="text-emerald-700">89%</strong></p>
          </div>
        </div>
      </section>
    </DashboardLayout>
  );
}
