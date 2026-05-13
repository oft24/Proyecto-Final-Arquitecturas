import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Client } = pg;

// Conectar a "postgres" (admin) usando las credenciales del DATABASE_URL
const adminUrl = process.env.DATABASE_URL.replace(/\/[^/]+(\?|$)/, '/postgres$1');

const client = new Client({
  connectionString: adminUrl,
  ssl: { rejectUnauthorized: false }
});

async function run() {
  try {
    await client.connect();
    console.log('✅ Conectado al servidor RDS');

    const res = await client.query("SELECT datname FROM pg_database WHERE datname='medisync'");
    if (res.rows.length > 0) {
      console.log('✅ Base de datos "medisync" YA EXISTE');
    } else {
      console.log('⚠️  Base de datos "medisync" NO EXISTE - creando...');
      await client.query('CREATE DATABASE medisync');
      console.log('✅ Base de datos "medisync" CREADA exitosamente');
    }

    const dbs = await client.query('SELECT datname FROM pg_database ORDER BY datname');
    console.log('\n📋 Bases de datos disponibles:');
    dbs.rows.forEach(r => console.log('  -', r.datname));

  } catch (err) {
    console.error('❌ ERROR:', err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

run();
