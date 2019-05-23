/* global Promise, require, process, console, module */
"use strict";

var _path = require('path'),
    _vfs = require('vinyl-fs'),
    _vinyl = require('vinyl'),
    _through = require('through2-concurrent'),
    _request = require('request'),
    URL = 'https://api.vecta.io/nano';

function Nano(opts) {
    this.defs = opts || {};
}

Nano.prototype.compress = function (src, tgt, opts) {
    var stream;

    //override default options if needed
    opts = Object.assign(this.defs, opts || {});

    if (this.defs.key) {
        stream = _vfs.src(src)
            .pipe(_through.obj({ maxConcurrency: 4 }, function (file, enc, next) {
                var obj = {},
                    me = this,
                    stat,
                    newFile =  new _vinyl(file); //create a new file

                if (file.isNull() || file.isStream() || enc !== 'utf8' || _path.extname(file.path).toLowerCase() !== '.svg') {
                    console.error(_path.basename(file.path), ': not a valid SVG file.');
                    return next(null, file);
                }
                if (file.isBuffer()) {
                    stat = file.stat;
                    obj.name = _path.basename(file.path);
                    obj.size = stat.size;
                    obj.str = file.contents.toString('utf8');

                    compressString(obj, opts, 2).then(function (file) {
                        console.log('Compressed: ' + file.name + ' ' + //eslint-disable-line no-console
                            ' ' + (file.old_size / 1024).toFixed(1) + 'KB -> ' + (file.size /1024).toFixed(1) + 'KB' +
                            ' ' + (((file.old_size - file.size) / file.old_size) * 100).toFixed(2) + '% saved');

                        newFile.contents = Buffer.from(file.str, 'utf8');
                        me.push(newFile);
                        next();
                    }).catch(function (err) {
                        console.error(err);
                        next();
                    });
                }
            }))
            .pipe(_vfs.dest(tgt));

        return new Promise(function (resolve) {
            stream.on('finish', function() {
                stream.destroy();
                resolve();
            });
        });
    }
    else { return Promise.reject('No API key provided'); }
};

Nano.prototype.compressString = compressString;

function compressString(file, opts, retry) {
    return new Promise(function (resolve, reject) {
        Object.assign(file, opts || {}); //copy over options
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
            if (err) {
                if (err.code === 'ETIMEDOUT') {
                    if (retry === 0 || retry === undefined) { reject({ msg: 'Unable to compress', name: file.name }); }
                    else {
                        retry -= 1;
                        compressString(file, opts, retry).then(resolve).catch(reject);
                    }
                }
                else { reject(err); }
            }
            else {
                if (res.statusCode !== 200) {
                    reject({ msg: res.body.error || res.body.message, name: file.name });
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