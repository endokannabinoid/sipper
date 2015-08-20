"use strict";

var RestClient = require('node-rest-client').Client;
var Q = require('q');

var Client = function Client(options) {
    this.__restClient = new RestClient(options);

    this.get = function (url, args) {
        var deferred = Q.defer();
        this.__restClient.get(url, args, function (data, response) {
            deferred.resolve({data: data, response: response});
        });
        return deferred.promise;
    };

    this.post = function (url, args) {
        var deferred = Q.defer();
        this.__restClient.post(url, args, function (data, response) {
            deferred.resolve({data: data, response: response});
        });
        return deferred.promise;
    };

    this.put = function (url, args) {
        var deferred = Q.defer();
        this.__restClient.put(url, args, function (data, response) {
            deferred.resolve({data: data, response: response});
        });
        return deferred.promise;
    };

    this.delete = function (url, args) {
        var deferred = Q.defer();
        this.__restClient.delete(url, args, function (data, response) {
            deferred.resolve({data: data, response: response});
        });
        return deferred.promise;
    };

    this.patch = function (url, args) {
        var deferred = Q.defer();
        this.__restClient.patch(url, args, function (data, response) {
            deferred.resolve({data: data, response: response});
        });
        return deferred.promise;
    };
};

module.exports = Client;
