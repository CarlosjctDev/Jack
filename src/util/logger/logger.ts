import pino from 'pino';
import { errorStackOp } from '#src/util/debug/errorStackOp.ts';


const {
  LOG_LEVEL = 'info',
  NODE_ENV = 'development',
} = process.env;

const isProduction = NODE_ENV === 'production';


const baseOptions: pino.LoggerOptions = {
  level: LOG_LEVEL,
  serializers: pino.stdSerializers,
  timestamp: pino.stdTimeFunctions.isoTime,
  formatters: {
    level: (label) => ({ level: label }),
  }
};

if (!isProduction) {
  baseOptions.hooks = {
    logMethod(inputArgs, method) {
      const last = inputArgs[inputArgs.length - 1];
      const first = inputArgs[0];
      if (typeof first === 'object' && first !== null && !Array.isArray(inputArgs[0])) {
        const objecto = { ...(first as object), ...errorStackOp() };
        inputArgs.unshift(objecto);
        if (typeof last === 'object') {
          inputArgs[1] = JSON.stringify(last);
        }
      } else {
        inputArgs.unshift({ ...errorStackOp() });
      }
      inputArgs[1] = last ?? '';
      return method.apply(this, inputArgs);
    }
  };

  baseOptions.transport = {
    target: 'pino-pretty',
    options: { colorize: true }
  };
}

export const logger = pino(baseOptions);


