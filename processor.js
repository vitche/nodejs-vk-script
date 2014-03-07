var vk = require('nodejs-vk-api');
var compiler = require('./compiler.js');
exports.create = function(settings) {
    return {
        client: function() {
            var client = new vk({
                appID: settings.applicationIdentifier,
                appSecret: settings.applicationSecret,
                mode: 'oauth',
                username: settings.userName,
                password: settings.password
            });
            client.on('acquireTokenReady', function() {
                console.log('VKontakte.Api.acquireTokenReady: ' + client.getToken());
                client.ready = true;
            });
            client.on('acquireTokenNotReady', function() {
                console.log('VKontakte.Api.acquireTokenNotReady');
                client.ready = false;
            });
            client.acquireToken();
            return client;
        }(),
        process: function(block, callback) {
            var self = this;
            var interval = setInterval(function() {
                if (self.ready()) {
                    // Release interval as soon as possible to avoid doubled
                    // execution
                    clearInterval(interval);
                    // Compile the code block to VKScript
                    var code = compiler.compile(block);
                    self.client.on('execute', function(result) {
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
        ready: function() {
            if (undefined !== this.client && undefined !== this.client.ready) {
                return this.client.ready;
            }
        }
    };
};