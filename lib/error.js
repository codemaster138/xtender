module.exports = function (...msg) {
    console.log('\x1b[31;1mError:\x1b[0m ', msg.reduce((acc, val) => `${acc} ${val}`));
}