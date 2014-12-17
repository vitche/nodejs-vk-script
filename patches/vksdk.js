var vk = require('vksdk');
var patch = require('patch');
patch.replace(vk, '_oauthRequest', function (_method, _arguments, _response, _responseType) {
    var arguments = (!!_arguments ? _arguments : {});
    arguments["access_token"] = vk.token;
    arguments['v'] = vk.options.version || vk.default.version;
    arguments['lang'] = vk.options.language || vk.default.language;
    if ("undefined" !== typeof _arguments) {
        arguments['v'] = _arguments['v'] || arguments['v'];
        arguments['lang'] = _arguments['lang'] || arguments['lang'];
    }
    var path = '/method/' + _method + '?' + vk._buildQuery(arguments);
    var options = {
        host: 'api.vk.com',
        port: 443,
        path: path
    };
    https.get(options, function (response) {
        var apiResponse = new String();
        response.setEncoding('utf8');
        response.on('data', function (chunk) {
            apiResponse += chunk;
        });
        response.on('end', function () {
            var result = undefined;
            try {
                result = JSON.parse(apiResponse);
            } catch (exception) {
                result = exception;
            }
            if (_responseType === 'callback' && typeof _response === 'function') {
                _response(result);
            } else {
                if (!_response) {
                    vk.emit('done:' + _method, result);
                } else {
                    vk.emit(_response, result);
                }
            }
        });
    }).on('error', function (error) {
        vk.emit('http-error', error);
    });
});
module.exports = vk;