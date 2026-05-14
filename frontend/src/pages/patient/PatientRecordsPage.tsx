import { useEffect, useState } from "react";
import {
  ClipboardList,
  FileText,
  Loader2,
  Stethoscope,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import toast from "react-hot-toast";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { Header } from "../../components/layout/Header";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../lib/api";

interface Expediente {
  expedienteId: string;
  motivoConsulta: string;
  diagnostico: string;
  tratamiento: string;
  observaciones: string | null;
  createdAt: string;
  medico: {
    nombre: string;
    especialidad: string;
  };
  cita: {
    fechaHora: string;
  } | null;
}

export default function PatientRecordsPage() {
  const { user } = useAuth();
  const [expedientes, setExpedientes] = useState<Expediente[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const currentDate = new Date().toLocaleDateString("es-ES", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  useEffect(() => {
    if (!user) return;
    api
      .get(`/patient/${user.usuarioId}/records`)
      .then(({ data }) => setExpedientes(data))
      .catch(() => toast.error("No se pudieron cargar los expedientes"))
      .finally(() => setLoading(false));
  }, [user]);

  const formatFecha = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  const toggle = (id: string) =>
    setExpandedId((prev) => (prev === id ? null : id));

  return (
    <DashboardLayout>
      <Header title="Mi Expediente Médico" subtitle={currentDate} />

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        </div>
      ) : expedientes.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center">
          <ClipboardList className="mb-3 h-10 w-10 text-slate-300" />
          <p className="font-semibold text-slate-500">Sin expedientes aún</p>
          <p className="text-sm text-slate-400">
            Tus registros médicos aparecerán aquí después de una consulta
          </p>
        </div>
      ) : (
        <>
          {/* Resumen */}
          <div className="mb-5 flex items-center gap-3 rounded-2xl border border-blue-100 bg-blue-50 px-5 py-3">
            <FileText className="h-5 w-5 text-blue-500" />
            <p className="text-sm text-blue-700">
              Tienes <span className="font-bold">{expedientes.length}</span>{" "}
              {expedientes.length === 1 ? "registro médico" : "registros médicos"}
            </p>
          </div>

          {/* Lista de expedientes */}
          <div className="space-y-3">
            {expedientes.map((exp) => {
              const isOpen = expandedId === exp.expedienteId;
              return (
                <div
                  key={exp.expedienteId}
                  className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
                >
                  {/* Cabecera — siempre visible */}
                  <button
                    onClick={() => toggle(exp.expedienteId)}
                    className="flex w-full items-center justify-between px-5 py-4 text-left transition hover:bg-slate-50"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100">
                        <Stethoscope className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800">
                          {exp.motivoConsulta}
                        </p>
                        <p className="text-xs text-slate-500">
                          Dr. {exp.medico.nombre} · {exp.medico.especialidad}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-slate-400">
                        {exp.cita
                          ? formatFecha(exp.cita.fechaHora)
                          : formatFecha(exp.createdAt)}
                      </span>
                      {isOpen ? (
                        <ChevronUp className="h-4 w-4 text-slate-400" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-slate-400" />
                      )}
                    </div>
                  </button>

                  {/* Detalle expandible */}
                  {isOpen && (
                    <div className="border-t border-slate-100 px-5 py-4">
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
                            Diagnóstico
                          </p>
                          <p className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
                            {exp.diagnostico}
                          </p>
                        </div>
                        <div>
                          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
                            Tratamiento
                          </p>
                          <p className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
                            {exp.tratamiento}
                          </p>
                        </div>
                        {exp.observaciones && (
                          <div className="sm:col-span-2">
                            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
                              Observaciones
                            </p>
                            <p className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-slate-700">
                              {exp.observaciones}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </DashboardLayout>
  );
}
