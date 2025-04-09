import { Hono } from 'hono';
import { opendir } from 'node:fs/promises';
import { join } from 'node:path';
import { logger } from '#src/util/logger/logger.ts';
import { pathToFileURL } from 'node:url';

export const loadRoutesDinamic = async (
    { app, routesDir,baseRoute }: { app: Hono, routesDir: string, baseRoute: string}
    ) =>{
    try {
        const dir = await opendir(routesDir);
        for await (const dirent of dir) {
          if (!dirent.isDirectory()) continue;          
          const nameDirectorio = dirent.name;                        
          logger.warn(dirent)
          if (!/^[A-Z]/.test(nameDirectorio)) {
            logger.warn(`⛔ Carpeta ignorada (no inicia en MAYÚSCULA): "${nameDirectorio}"`);
              continue;
          }
          let name = nameDirectorio.toLocaleLowerCase();          
          const filename = `${name}.route.ts`;            
          const fullPath = join(routesDir, nameDirectorio, filename);          
          const fileURL = pathToFileURL(fullPath).href;
          
  
          try {
            const mod = await import(fileURL);                         
            const router = Object.values(mod).find((val) => val instanceof Hono);
            const endPoint =  `${baseRoute}/${name}`;
            if (!router) {
              logger.warn(`⚠️ No se encontró una instancia de Hono en "${fullPath}"`);
              continue;
            }

            app.route(endPoint, router);
            // logger.info(`🌳 Ruta cargada: ${name} EndPoint: ${endPoint}`);
          } catch (err: unknown) {
              const message = err instanceof Error ? err.message : String(err);
              logger.warn(`⚠️ No se pudo cargar la ruta para "${name}": ${message}`);
          }
          
        }
      } catch (err : unknown) {
        const message = err instanceof Error ? err.message : String(err);
        logger.fatal('❌ Error al leer el directorio de rutas:', message);
      }
}
