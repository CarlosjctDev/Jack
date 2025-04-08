import { Hono } from 'hono';
import { loadRoutesDinamic } from '#src/api/routes/routes.controller.ts';
import { envConfig } from '#src/util/envConfig.controller.ts';

const { API_BASE_PATH } = envConfig();
const baseRoute = `${API_BASE_PATH}/private`;

export const privateRoutes = async ({ app }: { app: Hono }): Promise<void> => {
  const routesDir = import.meta.dir;
  await loadRoutesDinamic({app,baseRoute,routesDir});
};

