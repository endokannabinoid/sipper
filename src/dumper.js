"use strict";
var fs = require('fs-extra');
var Q = require('q');
var jsDiff = require('diff');

var Dumper = function Dumper(options) {
    this.base_path = options.base_path;
    this.tmp_base_path = options.tmp_base_path;
    this.diff = !options.force;

    this.dump = function (path, obj) {
        var tmp_file = this.tmp_base_path +'/'+ path;
        var file = this.base_path +'/'+ path;
        fs.ensureFileSync(tmp_file);
        fs.ensureFileSync(file);

        var content = prepareContent(obj);
        var deferred = Q.defer();

        fs.writeFileSync(tmp_file, content);

        //if(this.diff) {
        if(false) {
            var _old = fs.readJSONSync(file,{throws: false});
            var _new = fs.readJSONSync(tmp_file,{throws: false});

            var diff = jsDiff.diffJson(_old, _new);

            diff.forEach(function(part){
                // green for additions, red for deletions
                // grey for common parts
                var color = part.added ? 'green' :
                    part.removed ? 'red' : 'grey';

            });
        } else {
            fs.writeFileSync(file, content);
        }


        return deferred.promise;
    };

    var prepareContent = function prepareContent(arg) {
        return JSON.stringify(arg,  null, 4);
    };

};

module.exports = Dumper;
