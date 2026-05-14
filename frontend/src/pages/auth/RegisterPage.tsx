import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import toast from "react-hot-toast";
import { AuthLayout } from "../../components/layout/AuthLayout";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { useAuth } from "../../context/AuthContext";

// // Schema para personal médico (recepcionista, médico, director)
// const staffSchema = z
//   .object({
//     name: z.string().min(3, "Nombre requerido"),
//     email: z.string().email("Correo inválido"),
//     password: z.string().min(6, "Mínimo 6 caracteres"),
//     confirmPassword: z.string(),
//     role: z.enum(["recepcionista", "medico", "director"]),
//     especialidad: z.string().optional(),
//     costoConsulta: z.string().optional(),
//     terms: z.boolean(),
//   })
//   .refine((data) => data.password === data.confirmPassword, {
//     path: ["confirmPassword"],
//     message: "Las contraseñas no coinciden",
//   })
//   .refine((data) => data.terms, {
//     path: ["terms"],
//     message: "Debes aceptar términos",
//   });

// Schema para pacientes
const patientSchema = z
  .object({
    name: z.string().min(3, "Nombre requerido"),
    email: z.string().email("Correo inválido"),
    password: z.string().min(6, "Mínimo 6 caracteres"),
    confirmPassword: z.string(),
    fechaNacimiento: z.string().min(1, "Fecha de nacimiento requerida"),
    telefono: z.string().min(10, "Teléfono mínimo 10 dígitos"),
    terms: z.boolean(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Las contraseñas no coinciden",
  })
  .refine((data) => data.terms, {
    path: ["terms"],
    message: "Debes aceptar términos",
  });

// type StaffFormData = z.infer<typeof staffSchema>;
type PatientFormData = z.infer<typeof patientSchema>;

export default function RegisterPage() {
  const { registerPatient } = useAuth();
  const navigate = useNavigate();
  // const [userType, setUserType] = useState<"staff" | "patient">("staff");
  const [isLoading, setIsLoading] = useState(false);

  // const staffForm = useForm<StaffFormData>({
  //   resolver: zodResolver(staffSchema),
  //   defaultValues: { role: "medico" },
  // });

  const patientForm = useForm<PatientFormData>({
    resolver: zodResolver(patientSchema),
  });

  const onSubmitPatient = async (values: PatientFormData) => {
    setIsLoading(true);
    try {
      await registerPatient({
        nombre: values.name,
        email: values.email,
        password: values.password,
        fechaNacimiento: values.fechaNacimiento,
        telefono: values.telefono,
      });
      toast.success("¡Paciente registrado exitosamente! Bienvenido a MediSync");
      navigate("/patient/dashboard");
    } catch (error: any) {
      const message = error.response?.data?.message || error.response?.data?.errors?.[0]?.msg || "Error al registrar paciente. Intente nuevamente.";
      toast.error(message);
      console.error("Error registro paciente:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      <h1 className="mb-2 text-2xl font-bold">Crear cuenta</h1>
      <p className="mb-4 text-sm text-slate-500">Registro para pacientes del portal médico.</p>

      {/* Toggle entre Paciente y Personal Médico — comentado temporalmente */}
      {/* <div className="mb-4 flex rounded-lg border border-slate-300 p-1">
        <button
          type="button"
          onClick={() => setUserType("staff")}
          className={`flex-1 rounded-md py-2 text-sm font-medium transition-colors ${
            userType === "staff" ? "bg-blue-600 text-white" : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          Personal Médico
        </button>
        <button
          type="button"
          onClick={() => setUserType("patient")}
          className={`flex-1 rounded-md py-2 text-sm font-medium transition-colors ${
            userType === "patient" ? "bg-emerald-600 text-white" : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          Paciente
        </button>
      </div> */}

      <form onSubmit={patientForm.handleSubmit(onSubmitPatient)} className="space-y-3">
        <Input placeholder="Nombre completo" {...patientForm.register("name")} />
        <p className="text-xs text-red-600">{patientForm.formState.errors.name?.message}</p>

        <Input placeholder="Correo electrónico" {...patientForm.register("email")} />
        <p className="text-xs text-red-600">{patientForm.formState.errors.email?.message}</p>

        <Input type="password" placeholder="Contraseña" {...patientForm.register("password")} />
        <p className="text-xs text-red-600">{patientForm.formState.errors.password?.message}</p>

        <Input type="password" placeholder="Confirmar contraseña" {...patientForm.register("confirmPassword")} />
        <p className="text-xs text-red-600">{patientForm.formState.errors.confirmPassword?.message}</p>

        {/* Campos de personal médico — comentados temporalmente */}
        {/* {userType === "staff" && (
          <>
            <select
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              {...staffForm.register("role")}
            >
              <option value="recepcionista">Recepcionista</option>
              <option value="medico">Médico</option>
              <option value="director">Director</option>
            </select>

            {staffForm.watch("role") === "medico" && (
              <>
                <Input
                  placeholder="Especialidad (ej: Cardiología)"
                  {...staffForm.register("especialidad")}
                />
                <Input
                  type="number"
                  placeholder="Costo de consulta ($)"
                  {...staffForm.register("costoConsulta")}
                />
              </>
            )}
          </>
        )} */}

        <Input
          type="date"
          placeholder="Fecha de nacimiento"
          {...patientForm.register("fechaNacimiento")}
        />
        <p className="text-xs text-red-600">{patientForm.formState.errors.fechaNacimiento?.message}</p>

        <Input
          placeholder="Teléfono (10 dígitos)"
          {...patientForm.register("telefono")}
        />
        <p className="text-xs text-red-600">{patientForm.formState.errors.telefono?.message}</p>

        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" {...patientForm.register("terms")} />
          Acepto términos y condiciones
        </label>
        <p className="text-xs text-red-600">{patientForm.formState.errors.terms?.message}</p>

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50"
        >
          {isLoading ? "Registrando..." : "Registrar"}
        </Button>
      </form>

      <p className="mt-6 text-sm text-slate-500">
        ¿Ya tienes cuenta? <Link to="/login" className="text-blue-600">Inicia sesión</Link>
      </p>
    </AuthLayout>
  );
}
