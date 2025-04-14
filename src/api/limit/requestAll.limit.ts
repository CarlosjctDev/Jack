import type { Context } from 'hono';
import { rateLimiter } from "hono-rate-limiter";
import { isIP } from 'net';


const IGNORE_PATHS = [
  '/api/privada',
];

const isValidIp = (ip: string | undefined): boolean =>
  !!ip && isIP(ip) > 0;

const limiter = rateLimiter({  
    windowMs: 1 * 60 * 1000,
    limit: 15,
    standardHeaders: 'draft-6',
    keyGenerator:(c: Context) => {      
      const ipRaw = 
        c.req.header('x-forwarded-for')?.split(',')[0].trim() ||
        c.req.header('x-real-ip') || c.req.header('cf-connecting-ip');

      const ip = ipRaw && isValidIp(ipRaw) ? ipRaw : 'UNKNOWN_IP';      
      c.set('ip', ip);
      
      return ip;
    },
    message: {
        error: {
          message: 'Limit request exceeded. Try again in',
          code: 429,
        },
      },

  });

export const requestAllLimit = async (c: Context, next: () => Promise<void>) => {
  console.log(IGNORE_PATHS.some((path) => c.req.path.startsWith(path)));
    if (IGNORE_PATHS.some((path) => c.req.path.startsWith(path))) {
        return await next();
    }
    return limiter(c, next);
}
