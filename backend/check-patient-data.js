import pg from 'pg';
const { Client } = pg;

const client = new Client({
  host: 'db-dyas.crepubhj4fys.us-east-1.rds.amazonaws.com',
  port: 5432,
  user: 'postgres',
  password: 'MediSync2026!Secure',
  database: 'medisync',
  ssl: {
    rejectUnauthorized: false
  }
});

async function checkPatients() {
  try {
    await client.connect();
    console.log('✅ Conectado a RDS - Base de datos: medisync\n');

    // Consultar todos los pacientes
    const result = await client.query(`
      SELECT 
        paciente_id,
        nombre,
        email,
        telefono,
        fecha_nacimiento,
        folio,
        created_at
      FROM pacientes
      ORDER BY created_at DESC;
    `);

    console.log('========================================');
    console.log(`PACIENTES REGISTRADOS: ${result.rows.length}`);
    console.log('========================================\n');

    if (result.rows.length > 0) {
      result.rows.forEach((paciente, index) => {
        console.log(`${index + 1}. Paciente:`);
        console.log(`   ID:                ${paciente.paciente_id}`);
        console.log(`   Nombre:            ${paciente.nombre}`);
        console.log(`   Email:             ${paciente.email}`);
        console.log(`   Teléfono:          ${paciente.telefono}`);
        console.log(`   Fecha Nacimiento:  ${paciente.fecha_nacimiento}`);
        console.log(`   Folio:             ${paciente.folio}`);
        console.log(`   Registrado:        ${paciente.created_at}`);
        console.log('');
      });
    } else {
      console.log('⚠️  No hay pacientes registrados\n');
    }

    await client.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkPatients();
