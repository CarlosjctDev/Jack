import { parse, ValiError } from "valibot";
import { envSchema } from "#src/util/schemas/envSchema.ts";
import { logger } from '#src/util/logger/logger.ts';

const rawEnv = { ...process.env };

export const envConfig = () => {  
  try {    
    return parse(envSchema, rawEnv);
  } catch (error) {
    logger.error("❌ Error al cargar las variables de entorno:");

    if (error instanceof ValiError) {
      error.issues.forEach((issue) => 
        logger.error(`🔴 Variable inválida: ${issue.message}`)
      );
    } else {
      logger.error("Error inesperado al validar las variables de entorno:", error);
    }

    throw new Error("❌ Configuración del entorno fallida. Verifica las variables de entorno y su esquema.");
  }
};