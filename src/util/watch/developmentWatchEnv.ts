import { watch } from 'fs';
import { writeFileSync, readFileSync } from "fs";

let booleanEnv = false;

export const initWatchEnv = (targetPath:string) => {     
    watch('.env', (eventType) => {        
        if (eventType === 'change') {
          if (booleanEnv) return; 
          booleanEnv = true;         
          const original = readFileSync(targetPath, "utf-8");
          
      const modified = original + ``;
      writeFileSync(targetPath, modified);      
          setTimeout(() => {        
            booleanEnv = false;
          }, 1000);     
        }
      });            
}




