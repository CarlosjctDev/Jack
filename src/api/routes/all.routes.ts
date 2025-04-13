import { Hono } from 'hono';
import { baseRoutes } from '#src/api/routes/base/base.routes.controller.ts';
import { publicRoutes } from '#src/api/routes/public/public.routes.controller.ts';
import { privateRoutes } from '#src/api/routes/private/private.routes.controller.ts';
import { logger } from '#src/util/logger/logger.ts';

export const allRoutes =  async (
    { app } : {app:Hono}
    ) : Promise<void>  => {

    app.get('/robots.txt', (c) =>
        c.text(`User-agent: *
    Disallow: /
    `, 200, {
        'Content-Type': 'text/plain'
        })
    ); 
    await baseRoutes({app});       
    await publicRoutes({app})
    await privateRoutes({app}) 
   
    const ENDPOINT_APP = app.routes
        .map((route) => {
            const { method, path } = route;
            if(method !== 'ALL'){
                return `Method: ${method} EndPoint: ${path}`;
            }        
        })
        .filter(Boolean)
        .join('\n');
    logger.info(`🌳 Routes APP : \n${ENDPOINT_APP}`);   
    
    
}


