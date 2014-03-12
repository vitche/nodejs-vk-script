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
    client.process(function() {
        var newsResponse = API.newsfeed.get({
            offset: 0,
            count: 20
        });
        var news = newsResponse.items;
        var users = API.users.get({
            fields: "uid,first_name,last_name,nickname,photo_50,photo_100,photo_200_orig,photo_max_orig,online,contacts,city,country,has_mobile",
            uids: newsResponse.profiles.projection.uid
        });
        var i = 0;
        var postIdentifiers = [];
        while (i < news.length) {
            var newsItem = news[i];
            if ("post" === (newsItem.type + "")) {
                var sourceIdentifier = newsItem.source_id;
                if (sourceIdentifier < 0) {
                    sourceIdentifier = 0 - sourceIdentifier;
                }
                postIdentifiers = postIdentifiers + [sourceIdentifier + "_" + newsItem.post_id];
            }
            i = i + 1;
        }
        var wallMessages = API.wall.getById({
            posts: postIdentifiers,
            extended: 1
        });
        wallMessages = wallMessages.wall;
        i = 0;
        var likes = [];
        while (i < news.length) {
            var newsItem = news[i];
            if ("post" === (newsItem.type + "")) {
                var sourceIdentifier = newsItem.source_id;
                if (sourceIdentifier < 0) {
                    sourceIdentifier = 0 - sourceIdentifier;
                }
                likes = likes + API.likes.getList({
                    type: "post",
                    item_id: newsItem.post_id,
                    owner_id: sourceIdentifier
                });
            }
            i = i + 1;
        }
        return {items: news, profiles: users, wallMessages: wallMessages, likes: likes};
    }, function(result) {
        console.log(result);
    });
}
// testAuthenticate();
// testCompile();
testProcess();