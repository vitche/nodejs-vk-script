var vk = require('nodejs-vk-api');
var compiler = require('./compiler.js');
var processor = require('./processor.js');
var settings = require('./settings.js');
settings = settings.data;
function testAuthenticate() {
    var client = new vk({
        appID: settings.applicationIdentifier,
        appSecret: settings.applicationSecret,
        mode: 'oauth',
        username: settings.userName,
        password: settings.password
    });
    client.on('acquireTokenReady', function() {
        console.log('VKontakte.Api.acquireTokenReady: ' + vk.getToken());
        client.request('newsfeed.get', {}, 'newsfeed.get');
    });
    client.on('acquireTokenNotReady', function() {
        console.log('VKontakte.Api.acquireTokenNotReady');
    });
    client.on('newsfeed.get', function(result) {
        console.log(result);
    });
    client.acquireToken();
}
function testCompile() {
    var code = compiler.compile(function() {
        var items = API.newsfeed.get({}).items;
        return items;
    });
    console.log(code);
}
function testProcess() {
    var client = processor.create(settings);
    var result = client.process(function() {
        var items = API.newsfeed.get({}).items;
        return items;
    }, function(result) {
        console.log(result);
    });
    console.log(result);
}
// testAuthenticate();
// testCompile();
testProcess();