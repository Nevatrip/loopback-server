import {NevatripRestApplication} from './application';
import {ApplicationConfig} from '@loopback/core';
import {createMockServer} from './mocks';

export {NevatripRestApplication};

export async function main(options: ApplicationConfig = {}) {
  const app = new NevatripRestApplication(options);
  await app.boot();
  await app.start();

  await createMockServer();

  const url = app.restServer.url;
  console.log(`Server is running at ${url}`);
  console.log(`Try ${url}/ping`);

  return app;
}
