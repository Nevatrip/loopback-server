import {readFileSync} from 'fs';
import {resolve} from 'path';

const nodeEval = require('node-eval');

function evalFile(filename: string) {
  return nodeEval(readFileSync(filename, 'utf8'), filename);
}

const templates = {
  BEMTREE: evalFile(resolve('src', 'utils', `email.bemtree.js`)).BEMTREE,
  BEMHTML: evalFile(resolve('src', 'utils', `email.bemhtml.js`)).BEMHTML,
};

export const renderEmail = (data = {}) => {
  const bemtreeCtx = {
    block: 'root',
    level: 'desktop',
    config: {appName: 'NevaTrip'},
    data,
  };

  let bemjson;

  try {
    bemjson = templates.BEMTREE.apply(bemtreeCtx);
  } catch (err) {
    console.error('BEMTREE error', err.stack);
    console.trace('server stack');
  }

  let html;

  try {
    html = templates.BEMHTML.apply(bemjson);
  } catch (err) {
    console.error('BEMHTML error', err.stack);
  }

  return html;
};
