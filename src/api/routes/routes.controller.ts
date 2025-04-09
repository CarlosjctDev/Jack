import { Hono } from 'hono';
import { opendir } from 'node:fs/promises';
import { join } from 'node:path';
import { logger } from '#src/util/logger/logger.ts';

const isProd = process.env.NODE_ENV === 'production';

export const loadRoutesDinamic = async (
    { app, routesDir,baseRoute }: { app: Hono, routesDir: string, baseRoute: string}
    ) =>{
    try {
        const dir = await opendir(routesDir);
        for await (const dirent of dir) {
          if (dirent.isDirectory()) {
            let name = dirent.name;                        
            if (!/^[A-Z]/.test(name)) {
                console.warn(`⛔ Carpeta ignorada (no inicia en MAYÚSCULA): "${name}"`);
                continue;
            }
            name = name.toLocaleLowerCase();
            const extension = isProd ? 'js' : 'ts';
            const filename = `${name}.route.${extension}`;            
            const fullPath = join(routesDir, name, filename);
    
            try {
              const mod = await import(fullPath);              
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
        }
      } catch (err : unknown) {
        const message = err instanceof Error ? err.message : String(err);
        logger.fatal('❌ Error al leer el directorio de rutas:', message);
      }
}