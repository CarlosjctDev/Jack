import { watch } from 'fs';
import { writeFileSync, readFileSync } from "fs";

let ejecutado = {
    env: false
}

const target = "src/app.ts";

export const initWatchEnv = (envConfigVar:any) => { 
    let {WATCH_ENV_CONFIG = false} = envConfigVar;
    if (WATCH_ENV_CONFIG) return;
    process.env.WATCH_ENV_CONFIG = 'true';  
    watch('.env', (eventType) => {
        if (eventType === 'change') {
          if (ejecutado.env) return;
          ejecutado.env = true;          
          const original = readFileSync(target, "utf-8");
          
      const modified = original + ``;
      writeFileSync(target, modified);      
          setTimeout(() => {        
              ejecutado.env = false;
          }, 1000);     
        }
      });
}




