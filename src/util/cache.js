"use strict";

var _ = require('lodash');

var Cache = function (options) {

    var collection = this.collection = [];

    var newModel = function newModel(key, value) {
        return {
            key: key,
            id: _.uniqueId(_.get(options, 'id', 'c_')),
            value: JSON.stringify(value)
        }
    };

    this.store = function store(key, value) {

        if (_.findWhere(collection, {'key': key})) {
            throw new Error('Container contains object with this key! ' +
                            'If You wantad to replace it, use replace method');
        }
        collection.push(newModel(key, value))
    };

    this.set = this.replace = function replace(key, value, create) {

        var model = _.remove(collection, function (el) {
            return el.key === key;
        });

        if (model) {
            model.value = JSON.stringify(value);
        } else if (create === true) {
            model = newModel(key, value);
        } else {
            // throw new Error('Container does not contains object with this key! ' +
            //                 'If You want to create it, use replace method');
            return;
        }
        collection.push(model)
    };

    this.get = function get(key) {

        var model = _.findWhere(collection, {key: key});

        return model ? JSON.parse(model.value) : null;
    }

    this.has = function has(key) {
        return this.get(key) ? true : false;
    }
}

module.exports = new Cache();