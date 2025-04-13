import { fileURLToPath } from 'url';
import path, { dirname } from 'path';
import { readdir } from 'fs/promises';
import { readJson } from '#src/util/readJson.ts';
import { logger } from '#src/util/logger/logger.ts';
const url = import.meta.url;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const pathCurrentDir = __dirname;

interface Languages {
    [key: string]: object; 
}

export const initLanguages = async () : Promise<Languages> => {  
    const allLanguages : Languages = {};
    try {
        const files = await readdir(pathCurrentDir);
        const jsonFiles = files.filter(archivo => path.extname(archivo) === '.json');

        for (const archivo of jsonFiles) {
            const clave = path.basename(archivo, '.json');  
            try {
                const filePath = path.resolve(pathCurrentDir, archivo);
                const jsonContent = await readJson({ path: filePath, url });
                if (jsonContent !== null && ( typeof jsonContent === 'object')) {
                    allLanguages[clave] = jsonContent;
                } else {
                    logger.warn(`VERIFICAR QUE EL ARCHIVO "${clave}.json" SEA UN JSON VÁLIDO.`);
                }

              } catch (e) {
                logger.error(`VERIFICAR QUE EL ARCHIVO "${clave}.json" SEA UN JSON VÁLIDO`);
            }          
        }

        return allLanguages;
    } catch (error) {
        let message: string;
    
        if (error instanceof Error) {
            if ((error as any).code === 'ENOENT') {
                message = `El directorio no existe: ${pathCurrentDir}`;
            } else {
                message = `Error leyendo los archivos de languages: ${error.message}`;
            }
            logger.error(`❌ Error al inicializar los idiomas: ${message}`+ error);
            throw new Error(message);
        } else {
            message = `Error desconocido al inicializar los idiomas.`;
            logger.error(`❌ ${message}`+ error);
            throw new Error(message);
        }
    }
}

export const validatorLanguages = ({ allLanguages }: { allLanguages: Languages }): boolean => {
    const languageLengths = new Set<number>();
    const allKeys = new Set<string>();
    const missingKeys: Record<string, string[]> = {};
      
    for (const [_language, translations] of Object.entries(allLanguages)) {
      const keys = Object.keys(translations);
      languageLengths.add(keys.length);
      keys.forEach((key) => allKeys.add(key));
    }
  
    const isConsistent = languageLengths.size === 1;
  
    if (!isConsistent) {
      for (const [language, translations] of Object.entries(allLanguages)) {
        const keys = Object.keys(translations);
        const missing = Array.from(allKeys).filter((key) => !keys.includes(key));
        if (missing.length > 0) {
          missingKeys[language] = missing;
        }
      }
        
      for (const [language, keys] of Object.entries(missingKeys)) {
        keys.forEach((key) => {
          logger.error(`LA LLAVE DE ERROR "${key}" NO EXISTE EN EL IDIOMA "${language}".`);
        });
      }
    }
  
    return isConsistent;
  };