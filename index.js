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

/**
 * SVG file object
 * @typedef {object} File
 * @property {string} string SVG in string format
 * @property {number} [size] Size of SVG
 * @property {number} [mode=0] Compression mode
 */

/**
 * Nano client constructor
 * @param {object} opts Options to initialize Nano
 * @param {string} opts.key API key to initialize Nano
 * @param {number} [opts.mode=0] Compression mode for Nano. Can be 0 = image mode or 1 = object mode
 * @namespace
 */
function Nano(opts) {
    this.key = opts.key;
    this.mode = opts.mode || 0;
}

/**
 * Compress a SVG in string format and returns compress SVG in string format
 * @memberOf Nano
 * @param {string|File} file Can be either a string representing a SVG or an object with said string with size
 * @returns {Promise<File>}
 * @example
 * var Nano = require('nanosvg'),
 *     nano = new Nano({ key: <YOUR API KEY> });
 *
 *     compress('<svg>...</svg>').then(function(res){
 *         console.log(res); // { str: '<svg>...</svg>', size: ... }
 *     });
 */
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

/**
 * Compress svg(s) from a directory and output to a target directory
 * @memberOf Nano
 * @param {string} src Glob pattern representing source files.
 * @param {string} tgt Glob pattern representing target directory.
 * @example
 * var Nano = require('nanosvg'),
 *     nano = new Nano({ key: <YOUR API KEY> });
 *
 *     nano.compressFiles('./uncompressed/*.svg', './compressed/');
 *     // Compressed: 0.svg, 0/2
 *     //  Savings: 38.87%
 *     // Compressed: 1.svg, 1/2
 *     //  Savings: 70.32%
 *     // Compressed: 2.svg, 2/2
 *     //  Savings: 69.99%
 */
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