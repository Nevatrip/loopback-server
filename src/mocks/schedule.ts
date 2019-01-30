import * as express from 'express';
const jsf = require('json-schema-faker');
import * as schema from './schedule.json';

export default async function(app: express.Application) {
  app.get('/schedule', async (req: express.Request, res: express.Response) => {
    const schedule = await jsf.resolve(schema);

    res.json(schedule);
  });
}
