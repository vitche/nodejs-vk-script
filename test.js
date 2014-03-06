var vk = require('nodejs-vk-api');
var compiler = require('./compiler.js');
var settings = require('./settings.js');
settings = settings.data;
function testAuthenticate() {
    vk = new vk({
        appID: settings.applicationIdentifier,
        appSecret: settings.applicationSecret,
        mode: 'oauth',
        username: settings.userName,
        password: settings.password
    });
    vk.on('acquireTokenReady', function() {
        console.log('VKontakte.Api.acquireTokenReady: ' + vk.getToken());
        vk.request('newsfeed.get', {}, 'newsfeed.get');
    });
    vk.on('acquireTokenNotReady', function() {
        console.log('VKontakte.Api.acquireTokenNotReady');
    });
    vk.on('newsfeed.get', function(result) {
        console.log(result);
    });
    vk.acquireToken();
}
function testCompile() {
    var code = compiler.compile(function() {
        var items = API.newsfeed.get({}).items;
        return items;
    });
    console.log(code);
}
// testAuthenticate();
// testCompile();