#!/usr/bin/env node
const File = require('./lib/easyfs');
const debug = require('debug')('authy:server');
const error = require('./lib/error');
const yargs = require('yargs');
const yaml = require('yaml');
const authy = require('./xtender.js')();
const path = require('path');
debug("Authy starting up...");

// Set up command-line args
const argv = yargs
    .option("config", {
        alias: [
            'c',
            'src'
        ],
        description: '(Optional) path to config file',
        type: 'string'
    })
    .help()
    .alias('help', 'h')
    .alias('version', 'v')
    .argv;

debug("    Reading Config...");

// Recursive function to handle `extends` directive
function readConf(src) {
    // Use try-catch bock to handle inexistant config files
    let conf;
    try {
        let data = File(src).readToStringSync();
        conf = yaml.parse(data) || {};
        if (conf.extends) {
            conf = {...readConf(conf.extends), ...conf};
        }
    } catch (err){
        error(`${err.message}`);
        process.exit(1);
    }
    return conf
}
const config = readConf(argv.config || 'xtender.config.yaml');

debug('Config loaded.')
debug('Loading Plugins...');
// Enforce at least one plugin
if (!config || !config.plugins || config.plugins.length < 1) {
    error('Please specify at least one plugin in the config file');
    process.exit(1);
}

// Create an extension host
const system = authy.init(config);

// Loads all plugins
system.load();

system.start();