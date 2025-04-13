import { Hono } from 'hono';
import { opendir } from 'node:fs/promises';
import { join } from 'node:path';
import { logger } from '#src/util/logger/logger.ts';
import { pathToFileURL } from 'node:url';


const isLowerCase = (name: string): boolean => /^[a-z.[\]]+$/.test(name);
const startsWithUpperCase = (name: string): boolean => /^[A-Z]/.test(name);
const regexFilesRaiz = /^raiz\.route\[(\w*)\]$/;


const processFilesInDirectory = async (
  app: Hono,
  routesDir: string,
  baseRoute: string,
  nameDirectorio: string
) => {
  const files = await opendir(join(routesDir, nameDirectorio));
  for await (const file of files) {
    if (!file.isFile()) continue;

    const extension = file.name.split('.').pop();
    const name = file.name.replace(`.${extension}`, '');

    if (!isLowerCase(name)) {      
      const messageEspacios = name.split(' ').length > 1 ? '⚠️ NOTA: EL NOMBRE DEL ARCHIVO NO PUEDE CONTENER ESPACIOS' : '';
      logger.warn(`⛔ El archivo "${name}" ha sido ignorado porque no cumple con las convenciones de nomenclatura 
        (solo se permiten letras minúsculas y corchetes '[]').
         ${messageEspacios} Asegúrate de que el nombre del archivo siga el formato adecuado en el directorio "${routesDir}".`);

      continue;
    }
    
    const match = name.match(regexFilesRaiz);    
    if (!match) {
      logger.warn(`⚠️ El archivo "${name}.${extension}" no sigue la estructura correcta de nombres.
         Debe tener el formato 'raiz.route[AQUI VA EL NOMBRE DE LA RUTA]'
         (puede estar vacío, pero no debe contener espacios).
         Archivo ignorado en el directorio "${routesDir}".`);

      continue;
    }
      
    const baseNameRoute = match[1]?.trim() || "";

    const fullPath = join(routesDir, nameDirectorio, file.name);
    const fileURL = pathToFileURL(fullPath).href;

    const endPoint = `${baseRoute}/${baseNameRoute}`;

    if (app.routes.some(route => route.path === endPoint)) {
      logger.warn(`⚠️ La ruta "${endPoint}" ya está registrada en la aplicación. 
        El archivo "${name}.${extension}" en el directorio "${routesDir}" ha sido ignorado.
        Asegúrate de que la ruta no se duplique.`);
      continue;
    }

    try {
      const mod = await import(fileURL);
      const router = Object.values(mod).find((val) => val instanceof Hono);


      if (!router) {
        logger.warn(`⚠️ No se encontró una instancia de 'Hono' en el archivo "${fullPath}". 
          Asegúrate de que el archivo exporte correctamente una instancia de Hono para que pueda ser utilizado como una ruta.`);
        continue;
      }

      app.route(endPoint, router);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      logger.warn(`⚠️ No se pudo cargar la ruta para "${name}": ${message}`);
    }
  }
};


export const loadRoutesDinamic = async (
    {app,routesDir,baseRoute}: {app: Hono;routesDir: string;baseRoute: string;}
  ) => {
  try {
    const dir = await opendir(routesDir);
    for await (const dirent of dir) {
      if (!dirent.isDirectory()) continue;

      const nameDirectorio = dirent.name;

      if (/^raiz$/i.test(nameDirectorio)) {
        await processFilesInDirectory(app, routesDir, baseRoute, nameDirectorio);
        continue;
      }

      if (!startsWithUpperCase(nameDirectorio)) {
        logger.warn(
          `⛔ Carpeta ignorada (no inicia en MAYÚSCULA): "${nameDirectorio}"`
        );
        continue;
      }

      const name = nameDirectorio.toLocaleLowerCase();
      const filename = `${name}.route.ts`;
      const fullPath = join(routesDir, nameDirectorio, filename);
      const fileURL = pathToFileURL(fullPath).href;

      try {
        const mod = await import(fileURL);
        const router = Object.values(mod).find((val) => val instanceof Hono);
        const endPoint = `${baseRoute}/${name}`;

        if (!router) {
          logger.warn(`⚠️ No se encontró una instancia de 'Hono' en el archivo "${fullPath}". 
            Asegúrate de que el archivo exporte correctamente una instancia de Hono para que pueda ser utilizado como una ruta.`);
          continue;
        }

        app.route(endPoint, router);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        logger.warn(`⚠️ No se pudo cargar la ruta para "${name}": ${message} del directorio :${routesDir}`);
      }
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    logger.fatal(`❌ Error al leer el directorio de rutas "${routesDir}": ${message}. 
      Verifica si el directorio existe y tiene los permisos adecuados.`);

  }
};