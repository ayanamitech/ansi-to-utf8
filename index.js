#!/usr/bin/env node
const fs = require('fs');
const process = require('process');
const path = require('path');
const { Iconv } = require('iconv');
const { loadConfig } = require('use-config-json');

const defaultConfig = {
  DIR: null,
  FORMAT: null,
  ENCODED_LANG: null
};

let config = loadConfig(defaultConfig);

/**
  Ignore default config
**/
if ((!config.FORMAT || !config.ENCODED_LANG) && process.argv.length !== 4) {
  throw new Error('Please check your config!');
}

if (!config.ENCODED_LANG && process.argv[2]) {
  config.ENCODED_LANG = process.argv[2];
}

if (!config.FORMAT && process.argv[3]) {
  config.FORMAT = process.argv[3];
}

const convert = (file, encodedLang) => {
  try {
    const iconv = new Iconv(encodedLang, 'UTF-8//TRANSLIT//IGNORE');
    const rawData = fs.readFileSync(file);
    const converted = iconv.convert(rawData).toString('UTF-8');
    fs.writeFileSync(file, converted, { encoding: 'utf8' });
  } catch (e) {
    console.error(`Failed to convert ${file} from ${encodedLang} to UTF-8`);
    console.error(e);
  }
}

const start = (config) => {
  const workingDir = (config.DIR) ? config.DIR : process.cwd();
  try {
    const files = fs.readdirSync(workingDir, { encoding: 'utf8' }).filter(f => f.includes(config.FORMAT) === true);
    files.map(f => convert(path.join(workingDir, f), config.ENCODED_LANG))
  } catch (e) {
    console.error('Failed to run converter function');
    console.error(e);
  }
}

start(config);
