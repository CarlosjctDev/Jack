import { Hono } from 'hono';
import { opendir } from 'node:fs/promises';
import { join } from 'node:path';
import { logger } from '#src/util/logger/logger.ts';
import { pathToFileURL } from 'node:url';
import { readdir } from 'node:fs/promises';

const isProd = process.env.NODE_ENV === 'production';

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
          const extension = isProd ? 'js' : 'ts';
          const filename = `${name}.route.${extension}`;            
          const fullPath = join(routesDir, nameDirectorio, filename);
          await readFilesInDir(routesDir+"/"+nameDirectorio);
          const fileURL = pathToFileURL(fullPath).href;
          logger.info(`🔍 Buscando archivo: ${fullPath}`);
  
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
const readFilesInDir = async (dirPath: string) => {
  try {
    const files = await readdir(dirPath, { withFileTypes: true });

    for (const file of files) {
      if (file.isFile()) {
        console.log('📄 Archivo:', file.name);
      }
    }
  } catch (err) {
    console.error('❌ Error al leer el directorio:', err);
  }
};