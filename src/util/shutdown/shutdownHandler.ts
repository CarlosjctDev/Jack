import { logger } from '#src/util/logger/logger.ts';
import { cleanupResources } from '#src/util/shutdown/cleanup.ts';

let isShuttingDown = false;


export const shutdownHandler = async (reason: string, err?: unknown) => {
  if (isShuttingDown) {
    logger.warn("⚠️ El proceso ya está en proceso de apagado.");
    return;
  }

  isShuttingDown = true;
  logger.warn(`[${new Date().toISOString()}] 🛑 Aplicación cerrada por: ${reason}`);

  if (err) {
    logger.error("Error inesperado: " , err);
  }

  try {
    await cleanupResources();
  } catch (cleanupError) {
    logger.error("❌ Error durante la limpieza de recursos: " + cleanupError);
  } finally {
    logger.info("✅ Proceso terminado.");
    process.exit(err ? 1 : 0);
  }
};

process.removeAllListeners("SIGINT");
process.removeAllListeners("SIGTERM");  
process.removeAllListeners("uncaughtException");
process.removeAllListeners("unhandledRejection");

process.on("SIGINT", async (err) => {
  try {
    await shutdownHandler("SIGINT (Ctrl+C)", err);
  } catch (error) {
    logger.error("❌ Error al manejar SIGINT: " + error);
  }
});

process.on("SIGTERM", async (err) => {
  try {
    await shutdownHandler("SIGTERM (Detención del sistema)", err);
  } catch (error) {
    logger.error("❌ Error al manejar SIGTERM: " + error);
  }
});

process.on("uncaughtException", async (err) => {
  try {
    logger.fatal("🔥 Excepción no capturada:" + err);
    await shutdownHandler("uncaughtException", err);
  } catch (error) {
    logger.error("❌ Error al manejar uncaughtException: " + error);
  }
});

process.on("unhandledRejection", async (reason) => {
  try {
    logger.fatal("🚨 Rechazo no manejado:" + reason);
    await shutdownHandler("unhandledRejection", reason);
  } catch (error) {
    logger.error("❌ Error al manejar unhandledRejection: " + error);
  }
});

logger.info("✅ Manejadores de apagado inicializados.");

