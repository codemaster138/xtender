const debug = require('debug');
/**
 * Returns an authy plugin
 * @param {pluginFunction} f The input function
 * @returns {function}
 */
function make (f, name) {
    return function(s) {
        f(s, debug('plugins:' + name));
    }
}

module.exports = {
    make
}

/**
 * The main thread for a plugin
 * @callback pluginFunction
 * @param {ExtensionHost} host
 * @param {function} debug
 */