"use strict";

var Client = require('./client');
var Dumper = require('./dumper');
var optimist = require('optimist');
var path = require('path');
var fs = require('fs-extra');
var helper = require('./util/helper');

exports.get = function (config) {
    var client = new Client();
    var dumper = new Dumper({
        base_path: config.base_path,
        tmp_base_path: config.tmp_base_path,
        force: config.force
    });

    client
        .get(config.url, config.args)
        .then(function (result) {

            dumper.dump(
                config.file.replace(
                    helper.extname(config.file),
                    '.headers' + helper.extname(config.file)
                ),
                result.response.headers
            );
            dumper.dump(config.file, result.data);
        });
};
exports.post = function (config) {
    var client = new Client();
    var dumper = new Dumper({
        base_path: config.base_path,
        tmp_base_path: config.tmp_base_path,
        force: config.force
    });

    client
        .post(config.url, config.args)
        .then(function (result) {
            dumper.dump(
                config.file.replace(
                    helper.extname(config.file),
                    '.headers' + helper.extname(config.file)
                ),
                result.response.headers
            );
            dumper.dump(config.file, result.data);
        });
};
exports.patch = function (config) {
    var client = new Client();
    var dumper = new Dumper({
        base_path: config.base_path,
        tmp_base_path: config.tmp_base_path,
        force: config.force
    });

    client
        .patch(config.url, config.args)
        .then(function (result) {
            dumper.dump(
                config.file.replace(
                    helper.extname(config.file),
                    '.headers' + helper.extname(config.file)
                ),
                result.response.headers
            );
            dumper.dump(config.file, result.data);
        });
};
exports.put = function (config) {
    var client = new Client();
    var dumper = new Dumper({
        base_path: config.base_path,
        tmp_base_path: config.tmp_base_path,
        force: config.force
    });

    client
        .put(config.url, config.args)
        .then(function (result) {
            dumper.dump(
                config.file.replace(
                    helper.extname(config.file),
                    '.headers' + helper.extname(config.file)
                ),
                result.response.headers
            );
            dumper.dump(config.file, result.data);
        });
};
exports.delete = function (config) {
    var client = new Client();
    var dumper = new Dumper({
        base_path: config.base_path,
        tmp_base_path: config.tmp_base_path,
        force: config.force
    });

    client
        .delete(config.url, config.args)
        .then(function (result) {
            dumper.dump(
                config.file.replace(
                    helper.extname(config.file),
                    '.headers' + helper.extname(config.file)
                ),
                result.response.headers
            );
            dumper.dump(config.file, result.data);
        });
};
exports.head = function (config) {
    var client = new Client();
    var dumper = new Dumper({
        base_path: config.base_path,
        tmp_base_path: config.tmp_base_path,
        force: config.force
    });

    client
        .get(config.url, config.args)
        .then(function (result) {
            dumper.dump(
                config.file.replace(
                    helper.extname(config.file),
                    '.headers' + helper.extname(config.file)
                ),
                result.response.headers
            );
        });
};

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
    //console.log();
    options.base_path = path.resolve(path.relative(options.base_path || process.env.PWD, 'data/'+ options.cmd.toUpperCase()));
    options.tmp_base_path = path.resolve(path.relative(options.tmp_base_path || process.env.PWD, '.tmp/'+ options.cmd.toUpperCase()));

    if (!options.base_url) {
        options.base_url = helper.urlRoot(options.url);
    }
    if (!options.url_path) {
        options.url_path = helper.trimUrlRoot(options.url, options.base_url)

    }

    if (!options.file) {
        options.file = options.url_path;
    } else {
        options.file = path.relative(options.base_path, options.file);
    }

    if (!path.extname(options.file)) {
        options.file += '.json';
    }

    helper.mkdirIfNotExists(options.base_path);
    helper.mkdirIfNotExists(options.tmp_base_path);

    return options
};

exports.process = function () {
    var argv = optimist.parse(argsBeforeDoubleDash(process.argv.slice(2)));
    var options = {
        cmd: argv._.shift()
    };

    if (!options.cmd) {
        console.log('HTTP Method must be specified!');
        optimist.showHelp();
        process.exit(1)
    }

    switch (options.cmd.toUpperCase()) {
        case 'GET':
            console.log('GET');
            break;
        case 'POST':
            console.log('POST');
            break;
        case 'PUT':
            console.log('PUT');
            break;
        case 'PATCH':
            console.log('PATCH');
            break;
        case 'HEAD':
            console.log('HEAD');
            break;
        case 'DELETE':
            console.log('DELETE');
            break;
        default:
            console.log('Wrong HTTP Method !');
            optimist.showHelp();
            process.exit(1);
            break;
    }

    return processArgs(argv, options, fs, path)
};

exports.run = function () {
    var config = exports.process();

    console.log(config);

    switch (config.cmd.toUpperCase()) {
        case 'GET':
            exports.get(config);
            break;
        case 'POST':
            exports.post(config);
            break;
        case 'PUT':
            exports.put(config);
            break;
        case 'PATCH':
            exports.patch(config);
            break;
        case 'HEAD':
            exports.head(config);
            break;
        case 'DELETE':
            exports.delete(config);
            break;
        default:
            break;
    }
};
