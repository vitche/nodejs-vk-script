var vk = require('vksdk');
var patch = require('nodejs-patch');
var https = require('https');
patch.replace(vk.prototype, 'requestServerToken', function (userName, password, _response) {
    var responseType = 'event';
    if (typeof(_response) === 'function') {
        responseType = 'callback';
    }
    var options = {
        host: 'oauth.vk.com',
        port: 443,
        path: '/access_token?client_id=' + this.options.appId + '&client_secret=' + this.options.appSecret +
        '&v=' + this.options.version + '&grant_type=password&scope=notify,friends,photos,audio,video,docs,messages,notifications,offline,wall&username=' + userName + '&password=' + password
    };
    var self = this;
    https.get(options, function (res) {
        var apiResponse = new String();
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
            apiResponse += chunk;
        });
        res.on('end', function () {
            var result = undefined;
            try {
                result = JSON.parse(apiResponse);
            } catch (exception) {
                // TODO: A better way to signal about that exception
                result = exception;
            }
            if (responseType === 'callback' && typeof _response === 'function') {
                _response(result);
            } else {
                if (responseType === 'event' && !!_response) {
                    return self.emit(_response, result);
                }
                return self.emit('serverTokenReady', result);
            }
        });
    }).on('error', function (e) {
        self.emit('http-error', e);
    });
});
patch.replace(vk.prototype, 'request', function (_method, _requestParams, _response) {
    var responseType = 'event';
    if (typeof(_response) === 'function') {
        responseType = 'callback';
    }
    var self = this;
    var params = {
        'lang': this.options.lang,
        // This breaks some behavior specific to mobile API
        // TODO: A way to specify from outside or do not specify at all
        //'v'     : this.options.version,
        'https': (this.options.https) ? 1 : 0
    };
    if (this.isEmpty(_requestParams) === false) {
        for (var i in _requestParams) {
            params[i] = _requestParams[i];
        }
    }
    var requestString = this.buildQuery(params);
    if (this.options.secure) {
        if (this.token) {
            requestString = requestString + '&access_token=' + this.token;
        }
        if (this.options.appSecret) {
            requestString = requestString + '&client_secret=' + this.options.appSecret;
        }
    }
    var options = {
        host: 'api.vk.com',
        port: 443,
        path: '/method/' + _method + '?' + requestString
    };
    https.get(options, function (res) {
        var apiResponse = new String();
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
            apiResponse += chunk;
        });
        res.on('end', function () {
            var result = undefined;
            try {
                result = JSON.parse(apiResponse);
            } catch (exception) {
                // TODO: A better way to handle this exception
                result = exception;
            }
            if (responseType === 'callback' && typeof _response === 'function') {
                _response(result);
            } else {
                if (responseType === 'event' && !!_response) {
                    return self.emit(_response, result);
                }
                return self.emit('done:' + _method, result);
            }
        });
    }).on('error', function (e) {
        self.emit('http-error', e);
    });
});
module.exports = vk;