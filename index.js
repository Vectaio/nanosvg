/* global Promise, require, process, console */
"use strict";

var CWD = process.cwd(),
    _fs = require('fs-extra'),
    _path = require('path'),
    _glob = require('glob-promise'),
    _request = require('request'),
    args = require('minimist')(process.argv.slice(2)),
    URL = 'http://localhost:5000/sizzling-heat-5814/us-central1/nano',
    nano;

function Nano(opts) {
    this.key = opts.key;
    this.mode = opts.mode || 0;
}

Nano.prototype.compress =  function(file) {
    var me = this,
        obj = {};

    if (typeof file === 'string') {
        obj.str = file;
        obj.size = file.length;
        obj.mode = me.mode;
    }
    else {
        obj.str = file.str;
        obj.size = file.size;
        obj.mode = file.mode || me.mode;
    }

    return new Promise(function (resolve, reject) {
        if (me.key) {
            _request(
                {
                    method: 'POST',
                    url: URL,
                    headers: {
                        'content-type': 'application/json',
                        'x-api-key': me.key
                    },
                    body: { file: file },
                    json: true
                }, function (err, res, body) {
                    if (err) { reject(err); }
                    else {
                        if (res && res.statusCode !== 200) { reject(body); }
                        else {
                            resolve(body);
                        }
                    }
                });
        }
        else {
            reject('No API key provided.');
        }
    });
};

Nano.prototype.compressFiles = function(src, tgt) {
    var me = this;

    if (me.key) {
        _glob(_path.join(CWD, src)).then(function (all_paths) {
            var i = 0,
                total_length = all_paths.length;

            if (total_length === 0) { console.error('No files found'); }

            all_paths = splitArray(all_paths, 5); //break paths into 5 each

            all_paths.forEach(function (paths, index) {
                setTimeout(function () {

                    paths.forEach(function (path) {
                        readFile(path).then(function (file) {
                            file.mode = file.mode || me.mode;

                            return me.compress(file).then(function (res) {
                                _fs.outputFileSync(_path.join(CWD, tgt, file.name), res.str);
                                console.log('Compressed: ' + file.name + ', ' + i++ + '/' + total_length);
                                console.log('\x1b[36m', 'Savings: ' + (((file.size - res.size) / file.size) * 100).toFixed(2) + '%', '\x1b[0m');
                            });

                        }).catch(function (err) {
                            console.error(err);
                        });
                    });

                }, index * 1000);
            });
        }).catch(function (err) { console.error(err); });
    }
    else { console.error('No API key provided.'); }

    function splitArray(arr, size) {
        var ret = [];

        while (arr.length) { ret.push(arr.splice(0, size)); }

        return ret;
    }

    function readFile(path) {
        return new Promise(function (resolve, reject) {
            Promise.all([
                _fs.stat(path),
                _fs.readFile(path, 'utf8')
            ]).then(function (ret) {
                var file = {},
                    stat = ret[0],
                    str = ret[1];

                if (stat.isFile()) {
                    file.name = _path.basename(path);
                    file.size = stat.size;
                    file.str = str;

                    resolve(file);
                }
                else { reject('Not a valid file'); }
            }).catch(reject);
        });
    }
};

if (args._.length < 2) { console.log('Usage: nanofy [options] input output'); }
else {
    nano = new Nano(args);
    nano.compressFiles(args._[0], args._[1]);
}

module.exports = Nano;