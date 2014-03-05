var vk = require('nodejs-vk-api');
vk = new vk({
    appID: '{ApplicationIdentifier}',
    appSecret: '{ApplicationSecret}',
    mode: 'oauth',
    username: '{UserName}',
    password: '{Password}'
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