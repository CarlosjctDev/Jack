import pino from 'pino';
import { errorStackOp } from '#src/util/debug/errorStackOp.ts';


const {
  LOG_LEVEL = 'info',
  NODE_ENV = 'development',
} = process.env;

const isProduction = NODE_ENV === 'production';

export const logger = pino({
  level:  LOG_LEVEL ,
  serializers: pino.stdSerializers,
  timestamp: pino.stdTimeFunctions.isoTime,
  formatters: {
    level: (label) => ({ level: label }),
  },
  hooks: !isProduction 
    ? { logMethod(inputArgs, method) {    
        const last = inputArgs[inputArgs.length - 1] ;
        const first = inputArgs[0];                        
        if (typeof first === 'object' && first !== null && !Array.isArray(inputArgs[0])) {
          const objecto  = { ...(first as object), ...errorStackOp() }; 
          inputArgs.unshift(objecto); 
          
          if(typeof last === 'object') { 
            inputArgs[1] = JSON.stringify(last);          
          }         
        }else {
          inputArgs.unshift({ ...errorStackOp() });
        }
        inputArgs[1] = last ?? ""; 
        

        return method.apply(this, inputArgs);
      }
    } : undefined,
    transport: !isProduction
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
        },
      }
    : undefined,
}, pino.destination(1));


