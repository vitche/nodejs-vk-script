var compiler = require('./compiler.js');
exports.create = function(settings) {
    return {
        process: function(block) {
            return compiler.compile(block);
        }
    };
};