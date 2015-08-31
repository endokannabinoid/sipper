"use strict";

var Client = require('./client');
var Dumper = require('./dumper');
var optimist = require('optimist');
var path = require('path');
var fs = require('fs-extra');
var _ = require('lodash');
var helper = require('./util/helper');
var cache = require('./util/cache');


var argsBeforeDoubleDash = function (argv) {
    var idx = argv.indexOf('--');

    return idx === -1 ? argv : argv.slice(0, idx);
};

var processArgs = function (argv, options, fs, path) {
    if (argv.help) {
        console.log(optimist.help());
        process.exit(0);
    }
    if (!options.force) {
        options.force = false;
    }

    Object.getOwnPropertyNames(argv).forEach(function (name) {
        var argumentValue = argv[name];
        if (name !== '_' && name !== '$0') {
            if (Array.isArray(argumentValue)) {
                // If the same argument is defined multiple times, override.
                argumentValue = argumentValue.pop()
            }
            options[helper.dashToCamel(name)] = argumentValue
        }
    });

    if (options.requests.length === 0 && _.has(options, ['url', 'method'])) {
        var request = {
            method: options.method,
            base_url: options.base_url,
        };

        options.requests.push(request);
    }


    _.sortBy(options.requests, 'order');

    _.map(options.requests, function (request) {

        request.base_path = path.resolve(
            request.base_path
            || options.base_path + '/' + request.method.toLowerCase()
            || path.relative(process.env.PWD, 'data/' + request.method.toLowerCase())
        );
        request.tmp_base_path = path.resolve(
            request.tmp_base_path
            || options.tmp_base_path + '/' + request.method.toLowerCase()
            || path.relative(process.env.PWD, '.tmp/' + request.method.toLowerCase())
        );

        if (!request.url && ( options.base_url && request.url_path )) {
            request.url = options.base_url + request.url_path;
        }

        if (!request.file) {
            request.file = request.url_path;
        } else {
            request.file = path.relative(request.base_path, request.file);
        }

        if (!path.extname(request.file)) {
            request.file += '.json';
        }

        return request;
    });

    return options
};

exports.process = function () {
    var argv = optimist.parse(argsBeforeDoubleDash(process.argv.slice(2)));
    var options = {

        requests: []
    };

    if (argv.configFile) {
        options = require(path.resolve(argv.configFile));
    } else {
        console.log('HTTP Method must be specified!');
        optimist.showHelp();
        process.exit(1)

        //switch (options.method.toUpperCase()) {
        //    case 'GET':
        //        console.log('GET');
        //        break;
        //    case 'POST':
        //        console.log('POST');
        //        break;
        //    case 'PUT':
        //        console.log('PUT');
        //        break;
        //    case 'PATCH':
        //        console.log('PATCH');
        //        break;
        //    case 'HEAD':
        //        console.log('HEAD');
        //        break;
        //    case 'DELETE':
        //        console.log('DELETE');
        //        break;
        //    default:
        //        console.log('Wrong HTTP Method !');
        //        optimist.showHelp();
        //        process.exit(1);
        //        break;
        //}
    }

    return processArgs(argv, options, fs, path);
};

exports.run = function () {
    var config = exports.process();

    exports.sip(config, true, function () {

    })
};

exports.sip = function (config, _console, done) {

    if (!_console) {
        config = processArgs({}, require(path.resolve(config.configFile)), fs, path);
    }

    config.requests.forEach(function (config) {
        __call(config.method.toLowerCase(), config);
    });

    done();
};

var __call = function (method, config) {

    var client = new Client();
    var dumper = new Dumper({
        base_path: config.base_path,
        tmp_base_path: config.tmp_base_path,
        force: config.force
    });
    var _method = (method !== 'head' ? method : 'get').toLowerCase();

    if (config.onRequest && _.isFunction(config.onRequest)) {
        config.onRequest(cache, config.args);
    }

    client[_method](config.url, config.args)
        .then(function (result) {
                  if (config.onResponse && _.isFunction(config.onResponse)) {
                      config.onResponse(cache, result.data, result.response);
                  }

                  dumper.dump(
                      config.file.replace(
                          helper.extname(config.file),
                          '.headers' + helper.extname(config.file)
                      ),
                      result.response.headers
                  );
                  if (method !== 'head') {
                      dumper.dump(config.file, result.data);
                  }
              });
}
