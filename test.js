var vk = require('./patches/vksdk');
var compiler = require('./compiler.js');
var processor = require('./processor.js');
var settings = require('./settings.js');
settings = settings.data;
function testAuthenticate() {
    var client = new vk({
        appId: settings.applicationIdentifier,
        appSecret: settings.applicationSecret,
        mode: 'oauth',
        secure: true
    });
    client.on('serverTokenReady', function (token) {
        client.setToken(token.access_token)
        console.log('VKontakte.Api.serverTokenReady: ' + client.getToken());
        client.request('newsfeed.get', {}, 'newsfeed.get');
    });
    client.on('newsfeed.get', function (result) {
        console.log(result);
    });
    client.requestServerToken(settings.userName, settings.password);
}
function testCompile() {
    var code = compiler.compile(function () {
        var items = API.newsfeed.get({}).items;
        return items;
    });
    console.log(code);
}
function testNews() {
    var client = processor.create(settings);
    var script = function () {
        var newsResponse = API.newsfeed.get({
            start_from: 0,
            count: 5
        });
        var resultingLikes = [];
        var resultingNews = newsResponse.items;
        var postIdentifiers = [];
        var groupIdentifiers = [];
        var friendIdentifiers = [];
        var i = 0;
        while (i < resultingNews.length + 0) {
            var newsItem = resultingNews[i];
            var loadedLike = false;
            if ("post" === (newsItem.type + "")) {
                var sourceIdentifier = newsItem.source_id;
                if (sourceIdentifier < 0) {
                    var groupIdentifier = 0 - sourceIdentifier;
                    groupIdentifiers = groupIdentifiers + [groupIdentifier];
                    sourceIdentifier = groupIdentifier;
                }
                postIdentifiers = postIdentifiers + [sourceIdentifier + "_" + newsItem.post_id];
                resultingLikes = resultingLikes + [API.likes.getList({
                    type: "post",
                    item_id: newsItem.post_id,
                    owner_id: sourceIdentifier
                })];
                loadedLike = true;
            } else if ("friend" === (newsItem.type + "")) {
                var k = 0;
                var friendUsers = newsItem.friends;
                while (k < friendUsers.length) {
                    friendIdentifiers = friendIdentifiers + [friendUsers[k].uid];
                    k = k + 1;
                }
            }
            if (!loadedLike) {
                resultingLikes = resultingLikes + [{}];
            }
            i = i + 1;
        }
        var resultingUsers = API.users.get({
            fields: "uid,first_name,last_name,nickname,photo_50,photo_100,photo_200_orig,photo_max_orig,online,contacts,city,country,has_mobile",
            uids: newsResponse.profiles.projection.uid + friendIdentifiers
        });
        var resultingWallMessages = API.wall.getById({
            posts: postIdentifiers,
            extended: 1
        });
        resultingWallMessages = resultingWallMessages.wall;
        var resultingGroups = API.groups.getById({
            group_ids: groupIdentifiers
        });
        return {
            items: resultingNews,
            profiles: resultingUsers,
            wallMessages: resultingWallMessages,
            likes: resultingLikes,
            from: newsResponse.next_from,
            groups: resultingGroups
        };
    };
    var tokenReplacements = [[
        'newsResponse',
        'postIdentifiers',
        'newsItem',
        'sourceIdentifier',
        'resultingWallMessages',
        'resultingLikes',
        'resultingNews',
        'resultingUsers',
        'friendIdentifiers',
        'friendUsers',
        'loadedLike',
        'groupIdentifier',
        'resultingGroups',
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
        'j',
        'o',
        'p',
        'q',
        'r',
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
    ]];
    client.process(script, function (result) {
        console.log(result);
    }, tokenReplacements);
}
function testKeepOnline() {
    var client = processor.create(settings);
    var script = function () {
        return API.account.setOnline();
    };
    client.process(script, function (result) {
        console.log(JSON.stringify(result));
    }, [[],[]]);
}
//testAuthenticate();
//testCompile();
//testNews();
//testKeepOnline();