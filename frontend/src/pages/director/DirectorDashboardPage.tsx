import { Users, UserCheck, Stethoscope } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { Header } from "../../components/layout/Header";
import { useAuth } from "../../context/AuthContext";

export default function DirectorDashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const currentDate = new Date().toLocaleDateString("es-ES", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <DashboardLayout>
      <Header
        title={`Bienvenido, ${user?.nombre ?? "Director"}`}
        subtitle={currentDate}
      />

      <section className="mb-6">
        <h2 className="mb-4 text-lg font-semibold text-slate-700">Panel de Administración</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">

          {/* Tarjeta: Registrar médico */}
          <button
            onClick={() => navigate("/director/registrar-medico")}
            className="flex flex-col items-start gap-3 rounded-2xl border border-blue-100 bg-white p-6 shadow-sm transition hover:border-blue-400 hover:shadow-md"
          >
            <div className="rounded-xl bg-blue-100 p-3">
              <Stethoscope className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="font-semibold text-slate-800">Registrar Médico</p>
              <p className="text-sm text-slate-500">Agregar un nuevo médico al sistema</p>
            </div>
          </button>

          {/* Tarjeta: Registrar recepcionista */}
          <button
            onClick={() => navigate("/director/registrar-recepcionista")}
            className="flex flex-col items-start gap-3 rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm transition hover:border-emerald-400 hover:shadow-md"
          >
            <div className="rounded-xl bg-emerald-100 p-3">
              <UserCheck className="h-6 w-6 text-emerald-600" />
            </div>
            <div>
              <p className="font-semibold text-slate-800">Registrar Recepcionista</p>
              <p className="text-sm text-slate-500">Agregar una nueva recepcionista</p>
            </div>
          </button>

          {/* Tarjeta: Ver personal */}
          <button
            onClick={() => navigate("/director/personal")}
            className="flex flex-col items-start gap-3 rounded-2xl border border-purple-100 bg-white p-6 shadow-sm transition hover:border-purple-400 hover:shadow-md"
          >
            <div className="rounded-xl bg-purple-100 p-3">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="font-semibold text-slate-800">Ver Personal</p>
              <p className="text-sm text-slate-500">Lista de médicos y recepcionistas</p>
            </div>
          </button>

        </div>
      </section>
    </DashboardLayout>
  );
}
