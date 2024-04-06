import { infoLogger, errorLogger } from '.';

async function demo() {
  while (true) {
    infoLogger.track('Hello World ' + new Date().getSeconds());
    errorLogger.track('Hello World ' + new Date().getSeconds());
    console.log(new Date().getSeconds());
    await new Promise(r => setTimeout(r, 1000));
  }
}

demo();