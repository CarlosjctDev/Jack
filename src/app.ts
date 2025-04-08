import { Hono } from 'hono';
import { envConfig } from '#src/util/envConfig.controller.ts';
import { allMiddleware } from '#src/api/middleware/all.middleware.ts';
import { allRoutes } from '#src/api/routes/all.routes.ts';
import { HTTPException } from 'hono/http-exception'
import { logger } from '#src/util/logger/logger.ts';
import '#src/util/shutdown/shutdownHandler.ts';


const {
    PORT,
} = envConfig();

const app = new Hono();

allMiddleware({app});
await allRoutes({app});



app.onError(async (err, c) => {        
    if (err instanceof HTTPException) {    
        const response = err.getResponse();
        logger.fatal(`Error en la API: ${err.message}`);
        return response;
    }
    const msj = `Error interno, intenta más tarde : ${err.message}`;
    logger.fatal(msj);
    return c.text(msj, 500)
})

export default {
    port: PORT,
    fetch: app.fetch,    
};
