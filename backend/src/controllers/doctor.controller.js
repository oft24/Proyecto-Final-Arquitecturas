import { prisma } from "../config/prisma.js";
import { validationResult } from "express-validator";

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
 * Obtener todas las citas asignadas al médico autenticado
 */
export async function getDoctorCitas(req, res) {
  try {
    const medicoId = req.user.sub;
    const { estado } = req.query;

    const where = { medicoId };
    if (estado) where.estado = estado;

    const citas = await prisma.cita.findMany({
      where,
      include: {
        paciente: {
          select: {
            pacienteId: true,
            nombre: true,
            email: true,
            telefono: true,
            fechaNacimiento: true,
            folio: true,
          },
        },
      },
      orderBy: { fechaHora: "asc" },
    });

    res.json(citas);
  } catch (error) {
    console.error("Error en getDoctorCitas:", error);
    res.status(500).json({ message: "Error al obtener citas" });
  }
}

/**
 * Atender una cita: crea el expediente y marca la cita como completada
 */
export async function atenderCita(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const medicoId = req.user.sub;
    const { citaId } = req.params;
    const { motivoConsulta, diagnostico, tratamiento, observaciones } = req.body;

    // Verificar que la cita existe y pertenece al médico
    const cita = await prisma.cita.findUnique({
      where: { citaId },
      include: { paciente: true },
    });

    if (!cita) {
      return res.status(404).json({ message: "Cita no encontrada" });
    }

    if (cita.medicoId !== medicoId) {
      return res.status(403).json({ message: "No tienes permiso para atender esta cita" });
    }

    if (cita.estado !== "programada") {
      return res.status(400).json({ message: "Solo se pueden atender citas programadas" });
    }

    // Transacción: crear expediente + marcar cita como completada
    const [expediente] = await prisma.$transaction([
      prisma.expediente.create({
        data: {
          pacienteId: cita.pacienteId,
          medicoId,
          citaId,
          motivoConsulta,
          diagnostico,
          tratamiento,
          observaciones: observaciones || null,
          archivosS3: [],
        },
        include: {
          paciente: { select: { nombre: true, folio: true } },
          medico: { select: { nombre: true, especialidad: true } },
        },
      }),
      prisma.cita.update({
        where: { citaId },
        data: { estado: "completada" },
      }),
    ]);

    res.status(201).json({
      message: "Cita atendida y expediente creado exitosamente",
      expediente,
    });
  } catch (error) {
    console.error("Error en atenderCita:", error);
    res.status(500).json({ message: "Error al atender la cita" });
  }
}
