import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { api } from "../../lib/api";

const schema = z
  .object({
    nombre: z.string().min(3, "Nombre requerido (mínimo 3 caracteres)"),
    email: z.string().email("Correo inválido"),
    password: z.string().min(6, "Mínimo 6 caracteres"),
    confirmPassword: z.string(),
    especialidad: z.string().min(2, "Especialidad requerida"),
    costoConsulta: z.string().min(1, "Costo requerido"),
  })
  .refine((d) => d.password === d.confirmPassword, {
    path: ["confirmPassword"],
    message: "Las contraseñas no coinciden",
  });

type FormData = z.infer<typeof schema>;

export default function DirectorRegistrarMedicoPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (values: FormData) => {
    setIsLoading(true);
    try {
      await api.post("/auth/register", {
        nombre: values.nombre,
        email: values.email,
        password: values.password,
        role: "medico",
        especialidad: values.especialidad,
        costoConsulta: Number(values.costoConsulta),
      });
      toast.success(`Médico ${values.nombre} registrado exitosamente`);
      reset();
      navigate("/director/dashboard");
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.errors?.[0]?.msg ||
        "Error al registrar médico";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="mb-6 flex items-center gap-3">
        <button
          onClick={() => navigate("/director/dashboard")}
          className="rounded-lg border border-slate-200 bg-white p-2 hover:bg-slate-50"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Registrar Médico</h1>
          <p className="text-sm text-slate-500">Agrega un nuevo médico al sistema</p>
        </div>
      </div>

      <div className="mx-auto max-w-lg rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Nombre completo</label>
            <Input placeholder="Dr. Juan Pérez" {...register("nombre")} />
            {errors.nombre && <p className="mt-1 text-xs text-red-600">{errors.nombre.message}</p>}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Correo electrónico</label>
            <Input placeholder="doctor@medisync.com" {...register("email")} />
            {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Especialidad</label>
            <Input placeholder="Ej: Cardiología, Pediatría..." {...register("especialidad")} />
            {errors.especialidad && <p className="mt-1 text-xs text-red-600">{errors.especialidad.message}</p>}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Costo de consulta ($)</label>
            <Input type="number" placeholder="500" {...register("costoConsulta")} />
            {errors.costoConsulta && <p className="mt-1 text-xs text-red-600">{errors.costoConsulta.message}</p>}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Contraseña</label>
            <Input type="password" placeholder="Mínimo 6 caracteres" {...register("password")} />
            {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Confirmar contraseña</label>
            <Input type="password" placeholder="Repite la contraseña" {...register("confirmPassword")} />
            {errors.confirmPassword && <p className="mt-1 text-xs text-red-600">{errors.confirmPassword.message}</p>}
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              onClick={() => navigate("/director/dashboard")}
              className="flex-1 border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? "Registrando..." : "Registrar Médico"}
            </Button>
          </div>

        </form>
      </div>
    </DashboardLayout>
  );
}
