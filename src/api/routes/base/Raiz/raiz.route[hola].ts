import { Hono } from 'hono';
import type { Context } from 'hono';


export const router = new Hono();

router.get('/', (c:Context) => {  
    const errorAllLanguages = c.get('errorAllLanguages');
    const errorLanguageSelect = c.get('errorLanguageSelect');    
    console.log('errorAllLanguages', errorAllLanguages);
    console.log('errorLanguageSelect', errorLanguageSelect);
    return c.text("HOLA MUNDO")
});