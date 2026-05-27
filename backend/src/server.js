import app from './app.js';
import { getDatabaseMode, initializeDatabaseIfEnabled, waitForDatabase } from './config/database.js';

const PORT = Number(process.env.PORT || 3000);

async function start() {
  try {
    await waitForDatabase();
    const mode = getDatabaseMode();
    console.log(mode === 'mysql' ? 'Conexión con MySQL correcta' : 'Modo demostración activo: base de datos en memoria cargada');
    await initializeDatabaseIfEnabled();

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Memora Flow escuchando en el puerto ${PORT}`);
    });
  } catch (error) {
    console.error('No se pudo iniciar el backend:', error);
    process.exit(1);
  }
}

start();
