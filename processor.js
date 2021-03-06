var vk = require('./patches/vksdk.js');
var compiler = require('./compiler.js');
var compressor = require('./compressor.js');
exports.vk = vk;
exports.create = function (settings) {
    return {
        client: function () {
            if (undefined != settings.password) {
                var client = new vk({
                    appId: settings.applicationIdentifier,
                    appSecret: settings.applicationSecret,
                    mode: 'oauth',
                    secure: true
                });
                client.on('serverTokenReady', function (token) {
                    client.setToken(token.access_token);
                    console.log('VKontakte.Api.serverTokenReady: ' + client.getToken());
                    client.ready = true;
                });
                client.requestServerToken(settings.userName, settings.password);
                return client;
            } else if (undefined != settings.accessToken) {
                var client = new vk({
                    appId: null,
                    appSecret: null,
                    mode: 'oauth',
                    secure: true
                });
                client.setToken(settings.accessToken);
                client.ready = true;
                return client;
            } else {
                return null;
            }
        }(),
        process: function (block, callback, tokenReplacements, captcha) {
            var self = this;
            var interval = setInterval(function () {
                if (self.ready()) {
                    // Release interval as soon as possible to avoid doubled
                    // execution
                    clearInterval(interval);
                    // Compile the code block to VKScript
                    var code = compiler.compile(block);
                    if (undefined != tokenReplacements) {
                        code = compressor.compressReplacements(tokenReplacements, code);
                    }
                    // console.log(compiler.compileCString(code));
                    self.client.on('execute', function (result) {
                        if (undefined !== callback) {
                            callback(result);
                        }
                    });
                    var arguments = {
                        code: code
                    };
                    if (undefined != captcha) {
                        arguments.captcha_sid = captcha.id;
                        arguments.captcha_key = captcha.text;
                    }
                    self.client.request('execute', arguments, 'execute');
                }
            }, 100);
        },
        // Whether there was an error in the given response
        checkErrorResponse: function (response) {
            if (undefined != response.error) {
                return true;
            }
            return false;
        },
        // Try to process error response depending on the error code
        processErrorResponse: function (response, callback) {
            var error = response.error;
            var errorParameter = {};
            errorParameter.type = error.error_code;
            if (14 == error.error_code) {
                // Server has signaled that CAPTCHA is needed
                errorParameter.id = error.captcha_sid;
                errorParameter.uri = error.captcha_img;
            } else if (5 == response.error_code) {
                // Server has signaled of an invalid session
            }
            callback(errorParameter);
        },
        ready: function () {
            if (undefined !== this.client && undefined !== this.client.ready) {
                return this.client.ready;
            }
        }
    };
};