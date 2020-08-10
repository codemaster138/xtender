const error = require('./lib/error');
const debug = require('debug')('plugins:host');
const path = require('path');
const find = require('lodash.find');

function lineSep(s) {
    debug('');
    debug("=".repeat(process.stdout.getWindowSize()[0] - s.length - 42));
    debug('');
}

/**
 * An Authy Plugin Host
 */
class ExtensionHost {
    /**
     * Instatiate the authy plugin host
     */
    constructor(config) {
        this.config = config || {};
        this._hooks = {};
    }

    /**
     * Loads all plugins listed in config.plugins
     */
    load() {
        var loaded = [];
        const containsAll = (arr, target) => target.every(v => arr.includes(v));
        const loadPlugin = (p) => {
            if (loaded.includes(p.id)) return
            loadDependencies(p);
            try {
                require(path.join(process.cwd(), p.source))(this);
                if (p.id) loaded.push(p.id);
            } catch (e) {
                error(`Failed to load plugin ${path.basename(p.source)}: ${e.message}`);
                process.exit(1);
            }
        }

        const loadDependencies = (p) => {
            if (!p.requires || p.requires.length === 0) return
            if (containsAll(loaded, p.requires)) return
            p.requires.forEach(dep => {
                if (!loaded.includes(dep)) {
                    let pl = find(this.config.plugins, {id: dep});
                    if (pl == undefined || pl == null) {
                        error('Failed to resolve dependency ' + dep + ' for ' + (p.id || 'Anonymous'));
                        process.exit(1);
                    }
                    loadPlugin(pl)
                }
            })
        }
        this.config.plugins.forEach((p, n) => {
            if (!p.source) {
                error(`Skipping plugin number ${n + 1}: no source file`);
            }
            loadPlugin(p);
        });
        // this.config.plugins.forEach((p, n) => {
        //     if (!p.source) {
        //         error(`Skipping plugin number ${n+1}: no source file`);
        //     } else {
        //         try {
        //             require(path.join(process.cwd(), p.source))(this);
        //         } catch (e) {
        //             error(`Failed to load plugin ${path.basename(p.source)}: ${e.message}`);
        //             process.exit(1);
        //         }
        //     }
        // });
    }

    /**
     * Listen for a host event
     * @param {string} event The event to listen for
     * @param {function} listener The listener
     */
    on(event, listener) {
        this._hooks[event] = [...(this._hooks[event] || []), listener];
    };

    /**
     * Data and objects to be shared between plugins
     */
    shared = {}

    /**
     * Fire an event
     * @param {string} event The event to fire
     * @param {boolean=} forceSync Whether to force callbacks to be synchronous
     * @param {boolean=} hard Whether to throw an error if callback is asynchronous (default false). Requires forceSync to be `true`
     */
    _fire(event, forceSync, hard, ...args) {
        (this._hooks[event] || []).forEach(listener => {
            if ((forceSync && listener.constructor.name !== 'AsyncFunction') || !forceSync)
                listener(...args);
            else if (hard) {
                error(`Callbacks for ${event} must be synchronous`);
                process.exit(1);
            } else {
                error(`Skipping handler because callbacks for ${event} must be synchronous`);
            }
        });
    }

    start() {
        debug('');
        debug('Initalizing Plugins...');
        debug('');
        this._fire('startup', true, true);
        lineSep('plugins:host');
        this._fire('launched');
    }
}

class Extender {
    constructor() { }
    init(config) {
        return new ExtensionHost(config);
    }
}

module.exports = (...options) => new Extender(...options);