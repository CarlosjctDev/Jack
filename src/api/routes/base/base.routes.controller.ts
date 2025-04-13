import { Hono } from 'hono';
import { envConfig } from '#src/util/envConfig.controller.ts';
import { loadRoutesDinamic } from '#src/api/routes/routes.controller.ts';

const {    
    API_BASE_PATH
} = await envConfig();

const baseRoute = `${API_BASE_PATH}`;

export const baseRoutes = async ({ app }: { app: Hono }): Promise<void> => {  
    const routesDir = import.meta.dir;
    await loadRoutesDinamic({app,baseRoute,routesDir});

}