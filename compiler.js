exports.compile = function(block) {
    var result = '' + block;
    result = result.replace(/^(function[ ]*\([ ]*\)[ ]*{[\n]*)/g, '');
    result = result.replace(/([\n]*[ ]*}[ ]*$[\n]*)/g, '');
    result = result.replace(/(^[ ]*|[\n]+[ ]*)/g, '');
    result = result.replace(/ /g, '%20');
    result = result.replace(/\+/g, '%2B');
    return result;
};