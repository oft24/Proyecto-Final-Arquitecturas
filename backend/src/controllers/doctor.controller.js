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

/**
 * Obtener citas del doctor para una fecha específica
 */
export async function getDoctorAppointmentsByDate(req, res) {
  try {
    const medicoId = req.user.sub;
    const { fecha } = req.query;

    if (!fecha) {
      return res.status(400).json({ message: "Parámetro fecha requerido (YYYY-MM-DD)" });
    }

    // Parsear fecha
    const dateStart = new Date(fecha);
    dateStart.setHours(0, 0, 0, 0);
    
    const dateEnd = new Date(fecha);
    dateEnd.setHours(23, 59, 59, 999);

    // Obtener citas del día
    const citas = await prisma.cita.findMany({
      where: {
        medicoId,
        fechaHora: {
          gte: dateStart,
          lte: dateEnd,
        },
      },
      include: {
        paciente: {
          select: {
            pacienteId: true,
            nombre: true,
            email: true,
            telefono: true,
          },
        },
      },
      orderBy: { fechaHora: "asc" },
    });

    res.json({
      fecha,
      totalCitas: citas.length,
      citas: citas.map((c) => ({
        citaId: c.citaId,
        hora: c.fechaHora.toLocaleTimeString("es-ES", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        fechaHora: c.fechaHora,
        paciente: c.paciente.nombre,
        pacienteId: c.paciente.pacienteId,
        email: c.paciente.email,
        telefono: c.paciente.telefono,
        motivo: c.motivo,
        estado: c.estado,
        duracion: c.duracionMin,
      })),
    });
  } catch (error) {
    console.error("Error en getDoctorAppointmentsByDate:", error);
    res.status(500).json({ message: "Error al obtener citas del día" });
  }
}

/**
 * Obtener horario completo del doctor con citas del mes actual
 */
export async function getDoctorSchedule(req, res) {
  try {
    const medicoId = req.user.sub;

    // Obtener médico
    const medico = await prisma.medico.findUnique({
      where: { medicoId },
      select: {
        nombre: true,
        especialidad: true,
        horario: true,
      },
    });

    if (!medico) {
      return res.status(404).json({ message: "Médico no encontrado" });
    }

    // Obtener todas las citas del médico para los próximos 60 días
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    
    const en60Dias = new Date(hoy);
    en60Dias.setDate(en60Dias.getDate() + 60);

    const citas = await prisma.cita.findMany({
      where: {
        medicoId,
        fechaHora: {
          gte: hoy,
          lte: en60Dias,
        },
      },
      include: {
        paciente: {
          select: {
            pacienteId: true,
            nombre: true,
          },
        },
      },
      orderBy: { fechaHora: "asc" },
    });

    // Agrupar citas por fecha
    const citasPorFecha = {};
    citas.forEach((cita) => {
      const fechaStr = cita.fechaHora.toISOString().split("T")[0];
      if (!citasPorFecha[fechaStr]) {
        citasPorFecha[fechaStr] = [];
      }
      citasPorFecha[fechaStr].push({
        citaId: cita.citaId,
        hora: cita.fechaHora.toLocaleTimeString("es-ES", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        paciente: cita.paciente.nombre,
        estado: cita.estado,
        motivo: cita.motivo,
      });
    });

    res.json({
      medico,
      horarioLaboral: medico.horario,
      proximosMeses: {
        inicio: hoy.toISOString().split("T")[0],
        fin: en60Dias.toISOString().split("T")[0],
      },
      citasPorFecha,
      totalCitas: citas.length,
    });
  } catch (error) {
    console.error("Error en getDoctorSchedule:", error);
    res.status(500).json({ message: "Error al obtener horario" });
  }
}

