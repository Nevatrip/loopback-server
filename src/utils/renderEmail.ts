import {readFileSync} from 'fs';
import {resolve} from 'path';
import {Order} from '../models';

const nodeEval = require('node-eval');

function evalFile(filename: string) {
  return nodeEval(readFileSync(filename, 'utf8'), filename);
}

const templates = (bundle: string) => ({
  BEMTREE: evalFile(
    resolve(
      'src',
      'utils',
      'bundles',
      `${bundle}-desktop`,
      `${bundle}-desktop.bemtree.js`,
    ),
  ).BEMTREE,
  BEMHTML: evalFile(
    resolve(
      'src',
      'utils',
      'bundles',
      `${bundle}-desktop`,
      `${bundle}-desktop.bemhtml.js`,
    ),
  ).BEMHTML,
});

type Page = 'email' | 'operator' | 'print' | 'web';

interface emailData {
  page: Page | string;
  api: Order;
}

export const renderEmail = (data: emailData): string => {
  const bemtreeCtx = {
    block: 'root',
    level: 'desktop',
    config: {appName: 'NevaTrip'},
    data: data,
  };

  let bemjson;

  try {
    bemjson = templates(data.page).BEMTREE.apply(bemtreeCtx);
  } catch (err) {
    console.error('BEMTREE error', err.stack);
    console.trace('server stack');
  }

  let html;

  try {
    html = templates(data.page).BEMHTML.apply(bemjson);
  } catch (err) {
    console.error('BEMHTML error', err.stack);
  }

  return html;
};
