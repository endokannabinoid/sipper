var fs = require('fs-extra');
var path = require('path');
var _ = require('lodash');

exports.isDefined = function (value) {
    return !_.isUndefined(value)
}

exports.isFunction = _.isFunction
exports.isString = _.isString
exports.isObject = _.isObject
exports.isArray = _.isArray

var ABS_URL = /^https?:\/\//
exports.isUrlAbsolute = function (url) {
    return ABS_URL.test(url)
}

exports.urlRoot = function (url) {
    var domain;
    var protocol;
    //find & remove protocol (http, ftp, etc.) and get domain
    if (url.indexOf("://") > -1) {
        protocol = url.split('/')[0];
        domain = url.split('/')[2];
    }
    else {
        protocol = 'http:'
        domain = url.split('/')[0];
    }

    return protocol+ '//' +domain + '/';
}
exports.trimUrlRoot = function(url, urlRoot){
    var root = exports.isUrlAbsolute(url) ? exports.urlRoot(url): urlRoot;
    if(!root) {
        throw new Error('urlRoot mus be deined!');
    }
    return url.replace(root, '');
};

exports.camelToSnake = function (camelCase) {
    return camelCase.replace(/[A-Z]/g, function (match, pos) {
        return (pos > 0 ? '_' : '') + match.toLowerCase()
    })
}

exports.ucFirst = function (word) {
    return word.charAt(0).toUpperCase() + word.substr(1)
}

exports.dashToCamel = function (dash) {
    var words = dash.split('-')
    return words.shift() + words.map(exports.ucFirst).join('')
}

exports.arrayRemove = function (collection, item) {
    var idx = collection.indexOf(item)

    if (idx !== -1) {
        collection.splice(idx, 1)
        return true
    }

    return false
};

exports.merge = function () {
    var args = Array.prototype.slice.call(arguments, 0)
    args.unshift({})
    return _.merge.apply({}, args)
}

exports.formatTimeInterval = function (time) {
    var mins = Math.floor(time / 60000);
    var secs = (time - mins * 60000) / 1000;
    var str = secs + (secs === 1 ? ' sec' : ' secs');

    if (mins) {
        str = mins + (mins === 1 ? ' min ' : ' mins ') + str
    }

    return str
}

var replaceWinPath = function (path) {
    return exports.isDefined(path) ? path.replace(/\\/g, '/') : path
}

exports.normalizeWinPath = process.platform === 'win32' ? replaceWinPath : _.identity

exports.mkdirIfNotExists = function mkdir (directory, done) {
    // TODO(vojta): handle if it's a file
    /* eslint-disable handle-callback-err */
    fs.stat(directory, function (err, stat) {
        if (stat && stat.isDirectory()) {
            if(typeof done === 'function') done();
        } else {
            mkdir(path.dirname(directory), function () {
                fs.mkdirsSync(directory, done)
            })
        }
    })
    /* eslint-enable handle-callback-err */
}
exports.extensionExists = function (filepath) {
    return path.extname(filepath).length > 0;

};
exports.jsonExtension = function (filepath){
    return path.extname(filepath) === '.json';
};

exports.applyJSONExtension = function (filepath) {
    return filepath + '.json';
}
exports.extname = function(filepath){
    return path.extname(filepath)
}

// export lodash
exports._ = _
