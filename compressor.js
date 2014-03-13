exports.compressReplacements = function(replacements, value) {
    for (var i = 0; i < replacements[0].length; i++) {
        value = value.replace(new RegExp(replacements[0][i], "g"), replacements[1][i]);
    }
    return value;
};