const fs = require('fs');

/**
 * This class represents a file
 */
class FileStream {
    /**
     * Create a FileStream Object
     * @param {string} src Path to the file
     */
    constructor (src) {
        this.name = src;
    }

    /**
     * Read synchronously and return buffer
     * @returns {Buffer}
     */
    readToBufferSync() {
        return fs.readFileSync(this.name);
    }

    /**
     * Read Synchronously and return string
     * @returns {string}
     */
    readToStringSync() {
        return this.readToBufferSync().toString();
    }

    /**
     * Create a read stream from file
     * @param {Object} options Options for fs.createReadStream
     * @returns {fs.ReadStream}
     */
    createReadStream(options) {
        return fs.createReadStream(this.name);
    }
}

function File(src) {
    return new FileStream(src);
}

module.exports = File;