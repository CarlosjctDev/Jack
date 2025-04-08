import { 
     parse,
    ValiError
} from "valibot";
import { envSchema } from "#src/util/schemas/envSchema.ts";
import { logger } from '#src/util/logger/logger.ts';

export const envConfig = () => {  
  try {
    return parse(envSchema, process.env);
  } catch (error) {
    logger.error("❌ Error al cargar las variables de entorno:");

    if (error instanceof ValiError) {
      error.issues.forEach((issue) => console.error(`🔴 ${issue.message}`));
    } else {
      logger.error(error);
    }    
    throw new Error("Error en la configuración del entorno. Verifica las variables de entorno.");
  }
};
