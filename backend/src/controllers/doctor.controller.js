import { prisma } from "../config/prisma.js";

export async function getDoctorDashboard(req, res) {
  try {
    const medicoId = req.user.sub;

    // Obtener el perfil del médico
    const medico = await prisma.medico.findUnique({
      where: { medicoId },
      include: {
        usuario: true,
      },
    });

    if (!medico) {
      return res.status(404).json({ message: "Perfil de medico no encontrado" });
    }

    // Obtener estadísticas de citas
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const manana = new Date(hoy);
    manana.setDate(manana.getDate() + 1);

    const [citasHoy, citasPendientes, citasCanceladas] = await Promise.all([
      prisma.cita.count({
        where: {
          medicoId: medico.medicoId,
          fechaHora: { gte: hoy, lt: manana },
        },
      }),
      prisma.cita.count({
        where: {
          medicoId: medico.medicoId,
          estado: "programada",
          fechaHora: { gte: new Date() },
        },
      }),
      prisma.cita.count({
        where: {
          medicoId: medico.medicoId,
          estado: "cancelada",
        },
      }),
    ]);

    // Obtener próximas citas
    const proximasCitas = await prisma.cita.findMany({
      where: {
        medicoId: medico.medicoId,
        fechaHora: { gte: new Date() },
        estado: "programada",
      },
      include: {
        paciente: true,
      },
      orderBy: { fechaHora: "asc" },
      take: 5,
    });

    res.json({
      medico: {
        nombre: medico.nombre,
        especialidad: medico.especialidad,
        costoConsulta: medico.costoConsulta,
      },
      stats: {
        patientsToday: citasHoy,
        pendingAppointments: citasPendientes,
        cancelled: citasCanceladas,
      },
      proximasCitas: proximasCitas.map((c) => ({
        citaId: c.citaId,
        paciente: c.paciente.nombre,
        fechaHora: c.fechaHora,
        motivo: c.motivo,
      })),
      alerts: citasPendientes > 5
        ? [{ title: `${citasPendientes} citas pendientes`, description: "Revisa tu agenda" }]
        : [],
    });
  } catch (error) {
    console.error("Error en getDoctorDashboard:", error);
    res.status(500).json({ message: "Error al obtener dashboard" });
  }
}
