import { logger } from '#src/util/logger/logger.ts';
import { cleanupResources } from '#src/util/shutdown/cleanup.ts';


let isShuttingDown = false; 


export const shutdownHandler = async (reason: string, err?: unknown) => {
  if (isShuttingDown) {
    logger.warn("⚠️ El proceso ya está en proceso de apagado.");
    return;
  }

  isShuttingDown = true;
  logger.warn(`🛑 Aplicación cerrada por: ${reason}`);

  if (err) {
    logger.error("Error inesperado: " + err);
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


process.on("SIGINT",  () => shutdownHandler("SIGINT (Ctrl+C)"));
process.on("SIGTERM", () => shutdownHandler("SIGTERM (Detención del sistema)"));
process.on("uncaughtException", (err) => {
  logger.fatal("🔥 Excepción no capturada:"+ err);
  shutdownHandler("uncaughtException"+ err);
});
process.on("unhandledRejection", (reason) => {
  logger.fatal("🚨 Rechazo no manejado:"+ reason);
  shutdownHandler("unhandledRejection"+ reason);
});