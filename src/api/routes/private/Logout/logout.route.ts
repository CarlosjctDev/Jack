import { Hono } from 'hono';
import type { Context } from 'hono';


export const router = new Hono();

router.get('/', (c:Context) => {      
    return c.text("HOLA MUNDO 2")
});






 
