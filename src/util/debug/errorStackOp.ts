export const errorStackOp = () => {
    const err = new Error();
    const array = err.stack?.split("\n"); 

    if (!array || array.length < 2) return { route: "Desconocida", line: "?" };
    const filterArray = array.filter((line) => !line.includes("node_modules")); 
    const indiceLogMethod = filterArray.findIndex((line) => line.includes("logMethod"));    
    const arrayContent = filterArray[indiceLogMethod + 1 ]; // Intentar obtener la penúltima línea
    const route = arrayContent?.split("(")?.[1] ?? "Desconocida";
    const match = arrayContent?.match(/:(\d+):\d+\)?$/);
    const line = match?.[1] ?? "?"; // Evita errores si `match` es null
  
    return { route, line }; 
};

export default errorStackOp;
