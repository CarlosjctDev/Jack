import { Hono } from 'hono';
import { envConfig } from '#src/util/envConfig.controller.ts';
import { allMiddleware } from '#src/api/middleware/all.middleware.ts';
import { allRoutes } from '#src/api/routes/all.routes.ts';
import { HTTPException } from 'hono/http-exception'
import { logger } from '#src/util/logger/logger.ts';

import { fileURLToPath } from 'url';
import path, { dirname } from 'path';

interface ConfigServer {
    fetch: (request: Request, Env?: unknown, executionCtx?: any) => Response | Promise<Response>;
    port?: number | string;
}

const envConfigVar = await envConfig();
const {
    PORT,
    NODE_ENV
} = envConfigVar;

if (NODE_ENV !== 'production') {    
    const { initWatchEnv } = await import('#src/util/watch/developmentWatchEnv.ts'); 

    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    const targetPath = path.resolve(__dirname, 'app.ts');    
    initWatchEnv(targetPath);
}




const app = new Hono();

allMiddleware({app});
await allRoutes({app});


app.onError(async (err, c) => {   
    const { method, url } = c.req;
    logger.fatal(`Error en la API [${method} ${url}]: ${err.message}`);

    if (err instanceof HTTPException) {    
        const response = err.getResponse();
        logger.fatal(`Error en la API: ${err.message}`);
        return response;
    }
    const msj = `Error interno, intenta más tarde : ${err.message}`;
    logger.fatal(msj);
    return c.text(msj, 500)
})

  
const configServer: ConfigServer = {
    fetch: app.fetch,
    port: PORT
};
  
export default configServer;
