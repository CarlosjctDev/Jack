import { parse, ValiError } from "valibot";
import { envSchema } from "#src/util/schemas/envSchema.ts";
import { logger } from '#src/util/logger/logger.ts';

let rawEnv: Record<string, string | undefined> | null = null;


export const envConfig = async () => {  
  if (!rawEnv && process.env.NODE_ENV !== 'production') {
    const { promises: fs } = await import('fs');
    const path = await import('path');
    const envFilePath = path.resolve(process.cwd(), '.env');

    try {
      if (await fs.access(envFilePath).then(() => true).catch(() => false)) {
        const envFile = await fs.readFile(envFilePath, 'utf8');
        const envVars = envFile
          .split('\n')
          .map(line => line.split('#')[0].trim()) // Ignorar comentarios después de '#'
          .filter(line => line); // Ignorar líneas vacías

        envVars.forEach(line => {
          const [key, value] = line.split('=');
          if (key && value) {
            process.env[key.trim()] = value.trim();
          }
        });
      }
    } catch (error) {
      if (error instanceof Error) {
        logger.error(`Error al cargar el archivo .env: ${error.message}`);
      } else {
        logger.error('Error desconocido al cargar el archivo .env:', error);
      }
      throw new Error("❌ Configuración del entorno fallida. No se pudo cargar el archivo .env.");
    }
  }
  if (!rawEnv) {
    rawEnv = { ...process.env }; 
  }

  try {    
    return parse(envSchema, rawEnv);
  } catch (error) {
    logger.error("❌ Error al cargar las variables de entorno:");

    if (error instanceof ValiError) {
      error.issues.forEach((issue) => 
        logger.error(`🔴 Variable inválida: ${issue.message}`)
      );
    } else if (error instanceof Error) {
      logger.error("Error inesperado al validar las variables de entorno:", error.message);
    } else {
      logger.error("Error desconocido al validar las variables de entorno:", error);
    }

    throw new Error("❌ Configuración del entorno fallida. Verifica las variables de entorno y su esquema.");
  }
};

