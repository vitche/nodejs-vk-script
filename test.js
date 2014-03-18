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
        var resultingNews = newsResponse.items;
        var resultingUsers = API.users.get({
            fields: "uid,first_name,last_name,nickname,photo_50,photo_100,photo_200_orig,photo_max_orig,online,contacts,city,country,has_mobile",
            uids: newsResponse.profiles.projection.uid
        });
        var i = 0;
        var postIdentifiers = [];
        while (i < resultingNews.length) {
            var newsItem = resultingNews[i];
            if ("post" === (newsItem.type + "")) {
                var sourceIdentifier = newsItem.source_id;
                if (sourceIdentifier < 0) {
                    sourceIdentifier = 0 - sourceIdentifier;
                }
                postIdentifiers = postIdentifiers + [sourceIdentifier + "_" + newsItem.post_id];
            }
            i = i + 1;
        }
        var resultingWallMessages = API.wall.getById({
            posts: postIdentifiers,
            extended: 1
        });
        resultingWallMessages = resultingWallMessages.wall;
        i = 0;
        var resultingLikes = [];
        while (i < resultingNews.length) {
            var newsItem = resultingNews[i];
            if ("post" === (newsItem.type + "")) {
                var sourceIdentifier = newsItem.source_id;
                if (sourceIdentifier < 0) {
                    sourceIdentifier = 0 - sourceIdentifier;
                }
                resultingLikes = resultingLikes + [API.likes.getList({
                        type: "post",
                        item_id: newsItem.post_id,
                        owner_id: sourceIdentifier
                    })];
            }
            i = i + 1;
        }
        return {items: resultingNews, profiles: resultingUsers, wallMessages: resultingWallMessages, likes: resultingLikes};
    }, function(result) {
        console.log(result);
    }, [[
            'newsResponse',
            'postIdentifiers',
            'newsItem',
            'sourceIdentifier',
            'resultingWallMessages',
            'resultingLikes',
            'resultingNews',
            'resultingUsers',
            '%20=%20',
            '%20==%20',
            '%20{',
            ':%20',
            'while%20',
            'if%20',
            '%20<%20',
            '%20-%20',
            ',%20',
            '%20%2B%20'
        ], [
            'a',
            'b',
            'c',
            'd',
            'e',
            'f',
            'g',
            'h',
            '=',
            '==',
            '{',
            ':',
            'while',
            'if',
            '<',
            '-',
            ',',
            '%2B'
        ]]);
}
// testAuthenticate();
// testCompile();
testProcess();