import { prisma } from "./src/config/prisma.js";

async function seedDatabase() {
  console.log("🌱 Iniciando siembra de datos...");

  try {
    // Obtener el médico "Dr. Juan Torres" (el que acaba de registrarse)
    let medicoJuan = await prisma.medico.findFirst({
      where: { email: "doctor@medisync.com" },
    });

    if (!medicoJuan) {
      console.log("⚠️ Dr. Juan Torres no encontrado. Verificar registro.");
      return;
    }

    console.log("✓ Usando médico:", medicoJuan.nombre);

    // Obtener pacientes existentes (los que creamos antes)
    const pacientes = await prisma.paciente.findMany({
      take: 5,
    });

    if (pacientes.length === 0) {
      console.log("⚠️ No hay pacientes. Por favor ejecutar seed primero.");
      return;
    }

    console.log(`✓ Se usarán ${pacientes.length} pacientes existentes`);

    // Crear citas para el Dr. Juan Torres
    const ahora = new Date();
    const citasData = [
      {
        pacienteId: pacientes[0].pacienteId,
        medicoId: medicoJuan.medicoId,
        fechaHora: new Date(ahora.getTime() + 2 * 24 * 60 * 60 * 1000 + 9 * 60 * 60 * 1000), // En 2 días a las 9:00 AM
        motivo: "Consulta general - Revisión cardiaca",
        estado: "programada",
      },
      {
        pacienteId: pacientes[1].pacienteId,
        medicoId: medicoJuan.medicoId,
        fechaHora: new Date(ahora.getTime() + 2 * 24 * 60 * 60 * 1000 + 9.5 * 60 * 60 * 1000), // En 2 días a las 9:30 AM
        motivo: "Control de presión arterial",
        estado: "programada",
      },
      {
        pacienteId: pacientes[2].pacienteId,
        medicoId: medicoJuan.medicoId,
        fechaHora: new Date(ahora.getTime() + 2 * 24 * 60 * 60 * 1000 + 10 * 60 * 60 * 1000), // En 2 días a las 10:00 AM
        motivo: "Primera consulta",
        estado: "programada",
      },
      {
        pacienteId: pacientes[3].pacienteId,
        medicoId: medicoJuan.medicoId,
        fechaHora: new Date(ahora.getTime() + 2 * 24 * 60 * 60 * 1000 + 10.5 * 60 * 60 * 1000), // En 2 días a las 10:30 AM
        motivo: "Revisión de resultado de exámenes",
        estado: "programada",
      },
      {
        pacienteId: pacientes[4].pacienteId,
        medicoId: medicoJuan.medicoId,
        fechaHora: new Date(ahora.getTime() + 3 * 24 * 60 * 60 * 1000 + 11 * 60 * 60 * 1000), // En 3 días a las 11:00 AM
        motivo: "Consulta de seguimiento",
        estado: "programada",
      },
      {
        pacienteId: pacientes[0].pacienteId,
        medicoId: medicoJuan.medicoId,
        fechaHora: new Date(ahora.getTime() + 5 * 24 * 60 * 60 * 1000 + 14 * 60 * 60 * 1000), // En 5 días a las 14:00 (2 PM)
        motivo: "Seguimiento post consulta",
        estado: "programada",
      },
    ];

    let citasCreadas = 0;
    for (const citaData of citasData) {
      const citaExistente = await prisma.cita.findFirst({
        where: {
          pacienteId: citaData.pacienteId,
          medicoId: citaData.medicoId,
          fechaHora: citaData.fechaHora,
        },
      });

      if (!citaExistente) {
        await prisma.cita.create({
          data: {
            ...citaData,
            duracionMin: 30,
          },
        });
        citasCreadas++;
      }
    }
    console.log(`✓ ${citasCreadas} citas creadas para Dr. Juan Torres`);

    console.log("\n✅ ¡Siembra de citas completada!");
  } catch (error) {
    console.error("❌ Error al crear datos:", error);
  } finally {
    await prisma.$disconnect();
  }
}

seedDatabase();
