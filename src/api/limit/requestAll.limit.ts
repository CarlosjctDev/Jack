import type { Context } from 'hono';
import { rateLimiter } from "hono-rate-limiter";

const IGNORE_PATHS = [
  '/api/privada',
];

const isValidIp = (ip: string | undefined) =>
  !!ip && /^[\d:.]+$/.test(ip);

const limiter = rateLimiter({
    windowMs: 1 * 60 * 1000,
    limit: 15,
    standardHeaders: 'draft-6',
    keyGenerator:(c: Context) => {      
      const ipRaw = 
        c.req.header('cf-connecting-ip') ||
        c.req.header('x-forwarded-for')?.split(',')[0].trim() ||
        c.req.header('x-real-ip');

      if(!ipRaw) {
        return 'UNKNOWN_IP';
      }
      const ip = isValidIp(ipRaw) ? ipRaw : 'UNKNOWN_IP';

      return ip;
    },
    message: {
        error: {
          message: 'Limit request exceeded. Try again in',
          code: 429,
        },
      }

  });

export const requestAllLimit = async (c: Context, next: () => Promise<void>) => {

    if (IGNORE_PATHS.some((path) => c.req.path.startsWith(path))) {
        return await next();
    }
    return await limiter(c, next);
}
