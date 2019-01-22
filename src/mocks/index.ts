import * as express from 'express';
import * as schedule from './schedule';

export async function createMockServer(port: number = 3001) {
  const app = express();

  await schedule.default(app);

  return app.listen(port, () => {
    console.log(`Mock server started on port ${port}`);
  });
}
