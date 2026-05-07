import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { Header } from "../../components/layout/Header";
import { AppointmentCard } from "../../components/cards/AppointmentCard";

export default function DoctorAgendaPage() {
  return (
    <DashboardLayout>
      <Header title="Mi Agenda" subtitle="Gestiona tus citas y horarios" />
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_2fr]">
        <section className="card-shell p-4">
          <h3 className="mb-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white">Calendario</h3>
          <p className="text-sm text-slate-500">Mayo 2026</p>
          <p className="mt-4 text-sm">Fecha seleccionada: sabado, 9 de mayo de 2026</p>
        </section>
        <section className="card-shell p-4">
          <h3 className="mb-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white">Agenda del Dia</h3>
          <AppointmentCard time="09:00" patient="Ana Martinez" detail="Consulta general" status="Confirmada" />
          <AppointmentCard time="10:30" patient="Carlos Rodriguez" detail="Control cardiologico" status="Confirmada" />
          <AppointmentCard time="11:00" patient="Laura Sanchez" detail="Primera cita" status="Pendiente" />
        </section>
      </div>
    </DashboardLayout>
  );
}
