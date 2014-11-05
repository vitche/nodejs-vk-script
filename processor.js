var vk = require('vksdk');
var compiler = require('./compiler.js');
var compressor = require('./compressor.js');
exports.create = function (settings) {
    return {
        client: function () {
            if (undefined != settings.password) {
                var client = new vk({
                    appID: settings.applicationIdentifier,
                    appSecret: settings.applicationSecret,
                    mode: 'oauth'
                });
                client.on('acquireTokenReady', function () {
                    console.log('VKontakte.Api.acquireTokenReady: ' + client.getToken());
                    client.ready = true;
                });
                client.on('acquireTokenNotReady', function () {
                    console.log('VKontakte.Api.acquireTokenNotReady');
                    client.ready = false;
                });
                client.acquireToken(settings.userName, settings.password);
                return client;
            } else if (undefined != settings.accessToken) {
                var client = new vk({
                    mode: 'oauth'
                });
                client.setToken({
                    token: settings.accessToken
                });
                client.ready = true;
                return client;
            } else {
                return null;
            }
        }(),
        process: function (block, callback, tokenReplacements) {
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
                    self.client.request('execute', {
                        code: code
                    }, 'execute');
                }
            }, 100);
        },
        ready: function () {
            if (undefined !== this.client && undefined !== this.client.ready) {
                return this.client.ready;
            }
        }
    };
};