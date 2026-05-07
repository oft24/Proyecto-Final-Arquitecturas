import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { AuthLayout } from "../../components/layout/AuthLayout";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { useAuth } from "../../context/AuthContext";

const schema = z
  .object({
    name: z.string().min(3, "Nombre requerido"),
    email: z.email("Correo invalido"),
    password: z.string().min(8, "Minimo 8 caracteres"),
    confirmPassword: z.string(),
    role: z.enum(["doctor", "patient"]),
    terms: z.boolean(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Las contrasenas no coinciden",
  })
  .refine((data) => data.terms, {
    path: ["terms"],
    message: "Debes aceptar terminos",
  });

type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { role: "doctor" },
  });

  const onSubmit = (values: FormData) => {
    login(values.email, values.role);
    toast.success("Registro exitoso");
    navigate(values.role === "doctor" ? "/doctor/dashboard" : "/patient/dashboard");
  };

  return (
    <AuthLayout>
      <h1 className="mb-2 text-2xl font-bold">Crear cuenta</h1>
      <p className="mb-6 text-sm text-slate-500">Registro profesional para portal medico o paciente.</p>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
        <Input placeholder="Nombre completo" {...form.register("name")} />
        <Input placeholder="Correo" {...form.register("email")} />
        <Input type="password" placeholder="Contrasena" {...form.register("password")} />
        <Input type="password" placeholder="Confirmar contrasena" {...form.register("confirmPassword")} />
        <select className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" {...form.register("role")}>
          <option value="doctor">Doctor</option>
          <option value="patient">Paciente</option>
        </select>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" {...form.register("terms")} /> Acepto terminos y condiciones
        </label>
        <p className="text-xs text-red-600">{form.formState.errors.terms?.message ?? form.formState.errors.confirmPassword?.message}</p>
        <Button type="submit" className="w-full bg-emerald-600 text-white hover:bg-emerald-700">Registrar</Button>
      </form>
      <p className="mt-6 text-sm text-slate-500">
        Ya tienes cuenta? <Link to="/login" className="text-blue-600">Inicia sesion</Link>
      </p>
    </AuthLayout>
  );
}
