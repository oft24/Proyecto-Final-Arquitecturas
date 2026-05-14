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
  })
  .refine((d) => d.password === d.confirmPassword, {
    path: ["confirmPassword"],
    message: "Las contraseñas no coinciden",
  });

type FormData = z.infer<typeof schema>;

export default function DirectorRegistrarRecepcionistaPage() {
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
        role: "recepcionista",
      });
      toast.success(`Recepcionista ${values.nombre} registrada exitosamente`);
      reset();
      navigate("/director/dashboard");
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.errors?.[0]?.msg ||
        "Error al registrar recepcionista";
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
          <h1 className="text-2xl font-bold text-slate-800">Registrar Recepcionista</h1>
          <p className="text-sm text-slate-500">Agrega una nueva recepcionista al sistema</p>
        </div>
      </div>

      <div className="mx-auto max-w-lg rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Nombre completo</label>
            <Input placeholder="María García" {...register("nombre")} />
            {errors.nombre && <p className="mt-1 text-xs text-red-600">{errors.nombre.message}</p>}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Correo electrónico</label>
            <Input placeholder="recepcion@medisync.com" {...register("email")} />
            {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
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
              className="flex-1 bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50"
            >
              {isLoading ? "Registrando..." : "Registrar Recepcionista"}
            </Button>
          </div>

        </form>
      </div>
    </DashboardLayout>
  );
}
