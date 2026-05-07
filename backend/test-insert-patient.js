import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function insertTestPatient() {
  try {
    console.log('🔄 Insertando paciente de prueba...\n');

    // Hash de la contraseña
    const passwordHash = await bcrypt.hash('Test123456', 10);

    // Generar folio único
    const folio = `PAC-${Date.now()}`;

    // Datos del paciente según el schema
    const paciente = await prisma.paciente.create({
      data: {
        email: 'test.patient@test.com',
        passwordHash: passwordHash,
        nombre: 'Paciente Test',
        fechaNacimiento: new Date('1990-01-01'), // DateTime como Date object
        telefono: '1234567890', // String
        folio: folio, // String único
      }
    });

    console.log('✅ Paciente insertado exitosamente:');
    console.log('   ID:', paciente.pacienteId);
    console.log('   Nombre:', paciente.nombre);
    console.log('   Email:', paciente.email);
    console.log('   Folio:', paciente.folio);
    console.log('   Fecha Nacimiento:', paciente.fechaNacimiento);
    console.log('   Teléfono:', paciente.telefono);
    console.log('   Created At:', paciente.createdAt);

    return paciente;
  } catch (error) {
    console.error('❌ Error al insertar paciente:', error.message);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

insertTestPatient();
