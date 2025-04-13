import { createRequire } from 'node:module';

let require = createRequire(import.meta.url);

interface ReadJsonParams {
  path: string; 
  url?: string; 
}

export const readJson = ({ path, url }: ReadJsonParams): unknown => {
    try {
        if (url) {
            require = createRequire(url);
        }
        return require(path);
    } catch (error) {
        if (error instanceof Error) {
            throw new Error(`Error al cargar el archivo JSON en la ruta "${path}": ${error.message}`);
        }
        throw new Error(`Error desconocido al cargar el archivo JSON en la ruta "${path}".`);
    }
};