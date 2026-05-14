import { useEffect, useState } from "react";
import { Plus, Edit2, Trash2, Eye, Loader2, Search } from "lucide-react";
import { Link } from "react-router-dom";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { Header } from "../../components/layout/Header";
import { api } from "../../lib/api";
import toast from "react-hot-toast";

interface Cita {
  citaId: string;
  paciente: string;
  medico: string;
  especialidad: string;
  fecha: string;
  duracion: number;
  estado: string;
  motivo: string;
}

export default function RecepcionistaCitasPage() {
  const [citas, setCitas] = useState<Cita[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filtroEstado, setFiltroEstado] = useState<string>("todos");

  useEffect(() => {
    const fetchCitas = async () => {
      try {
        const response = await api.get("/appointments");
        setCitas(response.data || []);
      } catch (error: any) {
        toast.error("Error al cargar citas");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchCitas();
  }, []);

  const citasFiltradas = citas.filter((cita) => {
    const matchSearch =
      cita.paciente.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cita.medico.toLowerCase().includes(searchTerm.toLowerCase());
    const matchEstado = filtroEstado === "todos" || cita.estado === filtroEstado;
    return matchSearch && matchEstado;
  });

  const handleDelete = async (citaId: string) => {
    if (!confirm("¿Deseas cancelar esta cita?")) return;

    try {
      await api.delete(`/appointments/${citaId}`, {
        data: { motivoCancelacion: "Cancelada por recepcionista" },
      });
      setCitas(citas.filter((c) => c.citaId !== citaId));
      toast.success("Cita cancelada exitosamente");
    } catch (error: any) {
      toast.error("Error al cancelar cita");
    }
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case "programada":
        return "bg-blue-100 text-blue-800";
      case "completada":
        return "bg-green-100 text-green-800";
      case "cancelada":
        return "bg-red-100 text-red-800";
      default:
        return "bg-slate-100 text-slate-800";
    }
  };

  if (loading) {
    return (
      <DashboardLayout role="recepcionista">
        <div className="flex h-screen items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-2">Cargando citas...</span>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="recepcionista">
      <Header title="Gestión de Citas" subtitle="Administra todas las citas agendadas" />

      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-1 gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar paciente o médico..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-slate-300 pl-10 pr-4 py-2 focus:border-blue-600 focus:outline-none"
            />
          </div>
          <select
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
            className="rounded-lg border border-slate-300 px-4 py-2 focus:border-blue-600 focus:outline-none"
          >
            <option value="todos">Todos los estados</option>
            <option value="programada">Programadas</option>
            <option value="completada">Completadas</option>
            <option value="cancelada">Canceladas</option>
          </select>
        </div>
        <Link
          to="/recepcionista/agendar"
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          Nueva Cita
        </Link>
      </div>

      <section className="card-shell">
        {citasFiltradas.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="px-4 py-3 text-left font-semibold">Paciente</th>
                  <th className="px-4 py-3 text-left font-semibold">Médico</th>
                  <th className="px-4 py-3 text-left font-semibold">Especialidad</th>
                  <th className="px-4 py-3 text-left font-semibold">Fecha y Hora</th>
                  <th className="px-4 py-3 text-left font-semibold">Estado</th>
                  <th className="px-4 py-3 text-left font-semibold">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {citasFiltradas.map((cita) => (
                  <tr key={cita.citaId} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="px-4 py-3 font-semibold">{cita.paciente}</td>
                    <td className="px-4 py-3">{cita.medico}</td>
                    <td className="px-4 py-3 text-slate-600">{cita.especialidad}</td>
                    <td className="px-4 py-3">
                      {new Date(cita.fecha).toLocaleDateString("es-ES", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${getEstadoColor(cita.estado)}`}>
                        {cita.estado}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          className="rounded-md bg-blue-100 p-2 text-blue-600 hover:bg-blue-200"
                          title="Ver detalles"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        {cita.estado === "programada" && (
                          <>
                            <button
                              className="rounded-md bg-yellow-100 p-2 text-yellow-600 hover:bg-yellow-200"
                              title="Editar"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(cita.citaId)}
                              className="rounded-md bg-red-100 p-2 text-red-600 hover:bg-red-200"
                              title="Cancelar"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-8 text-center text-slate-500">
            <p>No hay citas que coincidan con los filtros</p>
          </div>
        )}
      </section>
    </DashboardLayout>
  );
}
