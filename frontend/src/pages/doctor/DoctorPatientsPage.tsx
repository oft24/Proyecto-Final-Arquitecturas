import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { Header } from "../../components/layout/Header";
import { api } from "../../lib/api";
import toast from "react-hot-toast";

interface Patient {
  pacienteId: string;
  nombre: string;
  email: string;
  folio: string;
  telefono: string;
  fechaNacimiento: string;
}

export default function DoctorPatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    // Cargar todos los pacientes al inicio
    const fetchAllPatients = async () => {
      try {
        const response = await api.get("/patient/list?page=1&limit=50");
        setPatients(response.data.pacientes || []);
      } catch (error: any) {
        console.error("Error cargando pacientes:", error);
        toast.error("Error al cargar los pacientes");
      } finally {
        setLoading(false);
      }
    };

    fetchAllPatients();
  }, []);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    
    if (!query.trim()) {
      // Si está vacío, volver a cargar todos
      try {
        const response = await api.get("/patient/list?page=1&limit=50");
        setPatients(response.data.pacientes || []);
      } catch (error) {
        console.error("Error cargando pacientes:", error);
      }
      return;
    }

    setSearching(true);
    try {
      const response = await api.get(`/patient/search?q=${encodeURIComponent(query)}`);
      setPatients(response.data.pacientes || []);
    } catch (error: any) {
      console.error("Error buscando pacientes:", error);
      toast.error("Error al buscar pacientes");
    } finally {
      setSearching(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const calculateAge = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex h-screen items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-2">Cargando pacientes...</span>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Header title="Mis Pacientes" subtitle="Administra expedientes medicos digitales" />
      <section className="card-shell p-4">
        <div className="mb-4 flex items-center gap-2">
          <input
            type="text"
            placeholder="Buscar paciente por nombre, email, folio o teléfono..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
          {searching && <Loader2 className="h-4 w-4 animate-spin" />}
        </div>

        <div className="mb-3 rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white">
          Lista de Pacientes ({patients.length})
        </div>

        {patients.length === 0 ? (
          <p className="p-4 text-center text-slate-500">No se encontraron pacientes</p>
        ) : (
          <div className="space-y-2">
            {patients.map((patient) => (
              <article
                key={patient.pacienteId}
                className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-3 hover:bg-slate-50"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-xs font-semibold text-blue-700">
                    {getInitials(patient.nombre)}
                  </div>
                  <div>
                    <p className="font-semibold">{patient.nombre}</p>
                    <p className="text-xs text-slate-500">
                      {calculateAge(patient.fechaNacimiento)} años · {patient.email}
                    </p>
                    <p className="text-xs text-slate-500">
                      Folio: {patient.folio} · Tel: {patient.telefono}
                    </p>
                  </div>
                </div>
                <button className="rounded-lg bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700 hover:bg-blue-200">
                  Ver Expediente
                </button>
              </article>
            ))}
          </div>
        )}
      </section>
    </DashboardLayout>
  );
}
