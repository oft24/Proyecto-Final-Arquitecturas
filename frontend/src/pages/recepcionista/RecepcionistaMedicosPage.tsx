import { useEffect, useState } from "react";
import { Loader2, Search, MapPin, DollarSign, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { Header } from "../../components/layout/Header";
import { api } from "../../lib/api";
import toast from "react-hot-toast";

interface Medico {
  medicoId: string;
  nombre: string;
  especialidad: string;
  costoConsulta: number;
  fotoUrl?: string;
}

export default function RecepcionistaMedicosPage() {
  const [medicos, setMedicos] = useState<Medico[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchMedicos = async () => {
      try {
        const response = await api.get("/appointments/doctors");
        setMedicos(response.data || []);
      } catch (error: any) {
        toast.error("Error al cargar médicos");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchMedicos();
  }, []);

  const medicosFiltrados = medicos.filter(
    (medico) =>
      medico.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      medico.especialidad.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <DashboardLayout role="recepcionista">
        <div className="flex h-screen items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-2">Cargando médicos...</span>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="recepcionista">
      <Header 
        title="Directorio de Médicos" 
        subtitle="Consulta disponibilidad y especialidades"
      />

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por nombre o especialidad..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-slate-300 pl-10 pr-4 py-2 focus:border-blue-600 focus:outline-none"
          />
        </div>
      </div>

      {medicosFiltrados.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {medicosFiltrados.map((medico) => (
            <div key={medico.medicoId} className="card-shell flex flex-col">
              {medico.fotoUrl && (
                <img
                  src={medico.fotoUrl}
                  alt={medico.nombre}
                  className="mb-3 h-32 w-full rounded-lg object-cover"
                />
              )}
              <h3 className="mb-1 text-lg font-bold">{medico.nombre}</h3>
              <p className="mb-3 text-sm text-slate-600">{medico.especialidad}</p>

              <div className="mb-3 space-y-2 border-t border-slate-200 pt-3">
                <div className="flex items-center gap-2 text-sm">
                  <DollarSign className="h-4 w-4 text-slate-500" />
                  <span className="font-semibold">${medico.costoConsulta.toFixed(2)}</span>
                  <span className="text-slate-500">por consulta</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-slate-500" />
                  <span className="text-slate-600">Disponible</span>
                </div>
              </div>

              <div className="flex gap-2 border-t border-slate-200 pt-3">
                <Link to="/recepcionista/agendar" className="flex-1 rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700 text-center">
                  Agendar Cita
                </Link>
                <button className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold hover:bg-slate-50">
                  Ver Detalles
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card-shell py-12 text-center text-slate-500">
          <p>No hay médicos que coincidan con tu búsqueda</p>
        </div>
      )}
    </DashboardLayout>
  );
}
