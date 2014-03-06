function compile(processor) {
    var result = '' + processor;
    result = result.replace(/^(function[ ]*\([ ]*\)[ ]*{[\n]*)/g, '');
    result = result.replace(/([\n]*[ ]*}[ ]*$[\n]*)/g, '');
    result = result.replace(/(^[ ]*|[\n]+[ ]*)/g, '');
    return result;
}
exports.compile = compile;