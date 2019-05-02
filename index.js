/* global Promise, require, process, console, module */
"use strict";

var CWD = process.cwd(),
    _fs = require('fs-extra'),
    _path = require('path'),
    _glob = require('glob-promise'),
    _request = require('request'),
    URL = 'https://api.vecta.io/nano';

function Nano(opts) {
    opts = opts || {};
    this.key = opts.key || null;
    this.mode = opts.mode || 0;
}

Nano.prototype.compress = function (src, tgt, opts) {
    opts = opts || {};
    opts.key = opts.key || this.key;
    opts.mode = opts.mode || this.mode || 0; //0 === IMG mode, 1 === OBJ mode

    return _glob(src).then(function (files) {
        if (files.length === 0) { console.error("No files found"); }

        return compressBatch(files, tgt, opts);
    });

    function compressBatch(files, tgt, opts) {
        var LIMIT = 100,
            i = 0,
            tasks = [];

        opts = opts || {};
        opts._total = opts._total || files.length;
        opts._index = opts._index || 0;

        for (; i < LIMIT; i++) {
            if (files[i]) {
                tasks.push(
                    compressFile(files[i], tgt, opts).then(function (file) {
                        opts._index++;

                        _fs.outputFileSync(_path.join(CWD, tgt, file.name), file.str);

                        console.log('Compressed: ' + file.name + ' ' + //eslint-disable-line no-console
                            opts._index + '/' + opts._total +
                            ' ' + (file.old_size / 1024).toFixed(1) + 'KB -> ' + (file.size /1024).toFixed(1) + 'KB' +
                            ' ' + (((file.old_size - file.size) / file.old_size) * 100).toFixed(2) + '% saved');

                        return;
                    }).catch(function (err) {
                        opts._index++;
                        console.error('Compression failed (' + err.name + ') : ', err.msg);
                        return;
                    })
                );
            }
        }

        files.splice(0, LIMIT);

        return Promise.all(tasks).then(function () {
            if (files.length > 0) {
                return compressBatch(files, tgt, opts);
            }
            else { return; }
        }).catch(function (err) {
            console.error(err);
            return;
        });
    }

    function compressFile(src, tgt, opts) {
        return new Promise(function (resolve, reject) {
            _fs.stat(src).then(function (stats) {
                var file = {};

                if (stats.isFile()) {
                    file.name = _path.basename(src);
                    file.size = stats.size;
                    file.mode = opts.mode || 0;

                    _fs.readFile(src, 'utf8').then(function (str) {
                        file.str = str;

                        compressString(file, opts).then(resolve).catch(reject);
                    }).catch(function (err) {
                        console.error(err);
                        reject(err);
                    });
                }
                else { reject({ msg: 'Not a valid SVG file.' }) }
            });
        });
    }
};

Nano.prototype.compressString = compressString;

function compressString(file, opts) {
    return new Promise(function (resolve, reject) {
        _request({
            method: 'POST',
            url: URL,
            headers: {
                'content-type': 'application/json',
                'x-api-key': opts.key
            },
            body: { file: file },
            json: true
        }, function (err, res, body) {
            if (err) { reject(err); }
            else {
                if (res.statusCode !== 200) {
                    reject({ msg: res.body.error, name: file.name });
                }
                else {
                    body.name = file.name;
                    body.old_size = file.size;
                    resolve(body);
                }
            }
        });
    });
}

module.exports = Nano;