import { Hono } from 'hono';
import type { Context } from 'hono';
import { languageDetector } from 'hono/language'
import { logger } from '#src/util/logger/logger.ts';
import { getConnInfo } from 'hono/bun';
import { bodyLimit } from 'hono/body-limit';
import { secureHeaders } from 'hono/secure-headers'
import { envConfig } from '#src/util/envConfig.controller.ts';
import { requestAllLimit } from '#src/api/limit/requestAll.limit.ts';


const envConfigVar = envConfig();

export const allMiddleware =  (
    { app } : {app:Hono}
    ) =>{

    app.use(
      languageDetector({
        convertDetectedLanguage: (lang) => lang.split('-')[0],
        supportedLanguages: ['en', 'es'], 
        fallbackLanguage: 'en',
        caches: false,
      })
    )      
    app.use(secureHeaders());  
    app.use(bodyLimit({
      maxSize: 5 * 1024 * 1024, // 5MB 
      onError: (c: Context) => {
        return c.text('LIMIT BODY :(', 413)
      },
    }));  
    app.use("*",async (c:Context, next ) =>  await requestAllLimit(c, next));

    app.use("*", async (c: Context, next) => {     
        const start = performance.now();
        c.set('logger', logger);
        c.set('envConfigVar', envConfigVar);

        await next();
        const duration = performance.now() - start;
        c.res.headers.set('X-Response-Time', `${duration.toFixed(2)}ms`);
        logger.info({            
          method: c.req.method,
          url: c.req.url,
          status: c.res.status,
          responseTime: `${duration.toFixed(2)}ms`,
          ...getConnInfo(c).remote
        },"http request");	        
      });
};


export default allMiddleware;
