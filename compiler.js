exports.compile = function(block) {
    var result = '' + block;
    result = result.replace(/^(function[ ]*\([ ]*\)[ ]*{[\n]*)/g, '');
    result = result.replace(/([\n]*[ ]*}[ ]*$[\n]*)/g, '');
    result = result.replace(/(^[ ]*|[\n]+[ ]*)/g, '');
    return result;
};