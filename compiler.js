exports.compile = function(block) {
    var result = '' + block;
    result = result.replace(/^(function[ ]*\([ ]*\)[ ]*\{[\n]*)/g, '');
    result = result.replace(/([\n]*[ ]*}[ ]*$[\n]*)/g, '');
    result = result.replace(/(^[ ]*|[\n]+[ ]*)/g, '');
    // Such code is not compiled at the server side any more
    // after some changes
    // probably in the "request" library
    // result = result.replace(/ /g, '%20');
    // result = result.replace(/\+/g, '%2B');
    // Compile the VKScript entity projection operator from something
    // closer to JavaScript
    result = result.replace(/.projection./g, '@.');
    // Replace strict comparison to weak comparison
    result = result.replace(/===/g, '==');
    return result;
};
exports.compileCString = function(code) {
    var result = code;
    result = result.replace(/\\/g, '\\\\');
    result = result.replace(/"/g, '\\"');
    return result;
}