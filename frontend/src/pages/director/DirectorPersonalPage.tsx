import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2, Stethoscope, UserCheck, UserX } from "lucide-react";
import toast from "react-hot-toast";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { Header } from "../../components/layout/Header";
import { api } from "../../lib/api";

interface Medico {
  medicoId: string;
  nombre: string;
  email: string;
  especialidad: string;
  costoConsulta: number;
  activo: boolean;
  createdAt: string;
}

interface Recepcionista {
  usuarioId: string;
  nombre: string;
  email: string;
  rol: string;
  activo: boolean;
  createdAt: string;
}

type Tab = "medicos" | "recepcionistas";

export default function DirectorPersonalPage() {
  const navigate = useNavigate();
  const [medicos, setMedicos] = useState<Medico[]>([]);
  const [recepcionistas, setRecepcionistas] = useState<Recepcionista[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("medicos");

  useEffect(() => {
    const fetchPersonal = async () => {
      try {
        const { data } = await api.get("/users/personal");
        setMedicos(data.medicos);
        setRecepcionistas(data.recepcionistas);
      } catch (error: any) {
        toast.error(error.response?.data?.message || "Error al cargar el personal");
      } finally {
        setLoading(false);
      }
    };
    fetchPersonal();
  }, []);

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  const currentDate = new Date().toLocaleDateString("es-ES", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <DashboardLayout>
      <Header title="Personal del Sistema" subtitle={currentDate} />

      <div className="mb-6 flex items-center gap-3">
        <button
          onClick={() => navigate("/director/dashboard")}
          className="rounded-lg border border-slate-200 bg-white p-2 hover:bg-slate-50"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="flex gap-2">
          <button
            onClick={() => navigate("/director/registrar-medico")}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            + Médico
          </button>
          <button
            onClick={() => navigate("/director/registrar-recepcionista")}
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
          >
            + Recepcionista
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-4 flex rounded-lg border border-slate-200 bg-white p-1 w-fit">
        <button
          onClick={() => setTab("medicos")}
          className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
            tab === "medicos" ? "bg-blue-600 text-white" : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Stethoscope className="h-4 w-4" />
          Médicos ({medicos.length})
        </button>
        <button
          onClick={() => setTab("recepcionistas")}
          className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
            tab === "recepcionistas" ? "bg-emerald-600 text-white" : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <UserCheck className="h-4 w-4" />
          Recepcionistas ({recepcionistas.length})
        </button>
      </div>

      {/* Contenido */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-2 text-slate-500">Cargando personal...</span>
        </div>
      ) : (
        <>
          {/* Tabla de médicos */}
          {tab === "medicos" && (
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
              {medicos.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                  <Stethoscope className="mb-3 h-10 w-10" />
                  <p className="font-medium">No hay médicos registrados</p>
                  <button
                    onClick={() => navigate("/director/registrar-medico")}
                    className="mt-3 text-sm text-blue-600 hover:underline"
                  >
                    Registrar el primero
                  </button>
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead className="border-b border-slate-200 bg-slate-50">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold text-slate-600">Nombre</th>
                      <th className="px-4 py-3 text-left font-semibold text-slate-600">Email</th>
                      <th className="px-4 py-3 text-left font-semibold text-slate-600">Especialidad</th>
                      <th className="px-4 py-3 text-left font-semibold text-slate-600">Costo</th>
                      <th className="px-4 py-3 text-left font-semibold text-slate-600">Estado</th>
                      <th className="px-4 py-3 text-left font-semibold text-slate-600">Registrado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {medicos.map((m) => (
                      <tr key={m.medicoId} className="hover:bg-slate-50">
                        <td className="px-4 py-3 font-medium text-slate-800">{m.nombre}</td>
                        <td className="px-4 py-3 text-slate-500">{m.email}</td>
                        <td className="px-4 py-3 text-slate-600">{m.especialidad}</td>
                        <td className="px-4 py-3 text-slate-600">${Number(m.costoConsulta).toFixed(2)}</td>
                        <td className="px-4 py-3">
                          {m.activo ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
                              Activo
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
                              <UserX className="h-3 w-3" /> Inactivo
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-slate-400">{formatDate(m.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* Tabla de recepcionistas */}
          {tab === "recepcionistas" && (
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
              {recepcionistas.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                  <UserCheck className="mb-3 h-10 w-10" />
                  <p className="font-medium">No hay recepcionistas registradas</p>
                  <button
                    onClick={() => navigate("/director/registrar-recepcionista")}
                    className="mt-3 text-sm text-emerald-600 hover:underline"
                  >
                    Registrar la primera
                  </button>
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead className="border-b border-slate-200 bg-slate-50">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold text-slate-600">Nombre</th>
                      <th className="px-4 py-3 text-left font-semibold text-slate-600">Email</th>
                      <th className="px-4 py-3 text-left font-semibold text-slate-600">Rol</th>
                      <th className="px-4 py-3 text-left font-semibold text-slate-600">Estado</th>
                      <th className="px-4 py-3 text-left font-semibold text-slate-600">Registrado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {recepcionistas.map((r) => (
                      <tr key={r.usuarioId} className="hover:bg-slate-50">
                        <td className="px-4 py-3 font-medium text-slate-800">{r.nombre}</td>
                        <td className="px-4 py-3 text-slate-500">{r.email}</td>
                        <td className="px-4 py-3">
                          <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700 capitalize">
                            {r.rol}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {r.activo ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
                              Activo
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
                              <UserX className="h-3 w-3" /> Inactivo
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-slate-400">{formatDate(r.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </>
      )}
    </DashboardLayout>
  );
}
