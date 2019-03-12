![Nano](https://user-images.githubusercontent.com/32937442/50869625-d1d4b380-13ef-11e9-8f97-2cd733203608.png)

SVG files compression tool for Nano. More information in [Nano](https://vecta.io/nano)

## Installation

`npm install nanosvg`

## Authentication

Obtain API Key in [Nano](https://vecta.io/nano)

## Usage

```javascript
var Nano = require('nanosvg'),
    nano = new Nano({ key: <YOUR API KEY> });

// compress in bulk
nano.compressFiles('./*.svg', './compressed/');
```
## Usage on CLI

### Install

`npm i -g nanosvg`

### Compress files

`nanosvg --key <YOUR API KEY> ./*.svg ./compressed/`

## API

## Objects

<dl>
<dt><a href="#Nano">Nano</a> : <code>object</code></dt>
<dd><p>Nano client constructor</p>
</dd>
</dl>

## Typedefs

<dl>
<dt><a href="#File">File</a> : <code>object</code></dt>
<dd><p>SVG file object</p>
</dd>
</dl>

<a name="Nano"></a>

## Nano : <code>object</code>
Nano client constructor

**Kind**: global namespace  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| opts | <code>object</code> |  | Options to initialize Nano |
| opts.key | <code>string</code> |  | API key to initialize Nano |
| [opts.mode] | <code>number</code> | <code>0</code> | Compression mode for Nano. Can be 0 = image mode or 1 = object mode |


* [Nano](#Nano) : <code>object</code>
    * [.compress(file)](#Nano+compress) ⇒ [<code>Promise.&lt;File&gt;</code>](#File)
    * [.compressFiles(src, tgt)](#Nano+compressFiles)

<a name="Nano+compress"></a>

### nano.compress(file) ⇒ [<code>Promise.&lt;File&gt;</code>](#File)
Compress a SVG in string format and returns compress SVG in string format

**Kind**: instance method of [<code>Nano</code>](#Nano)  

| Param | Type | Description |
| --- | --- | --- |
| file | <code>string</code> \| [<code>File</code>](#File) | Can be either a string representing a SVG or an object with said string with size |

**Example**  
```js
var Nano = require('nanosvg'),    nano = new Nano({ key: <YOUR API KEY> });    compress('<svg>...</svg>').then(function(res){        console.log(res); // { str: '<svg>...</svg>', size: ... }    });
```
<a name="Nano+compressFiles"></a>

### nano.compressFiles(src, tgt)
Compress svg(s) from a directory and output to a target directory

**Kind**: instance method of [<code>Nano</code>](#Nano)  

| Param | Type | Description |
| --- | --- | --- |
| src | <code>string</code> | Glob pattern representing source files. |
| tgt | <code>string</code> | Glob pattern representing target directory. |

**Example**  
```js
var Nano = require('nanosvg'),    nano = new Nano({ key: <YOUR API KEY> });    nano.compressFiles('./uncompressed/*.svg', './compressed/');    // Compressed: 0.svg, 0/2    //  Savings: 38.87%    // Compressed: 1.svg, 1/2    //  Savings: 70.32%    // Compressed: 2.svg, 2/2    //  Savings: 69.99%
```
<a name="File"></a>

## File : <code>object</code>
SVG file object

**Kind**: global typedef  
**Properties**

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| string | <code>string</code> |  | SVG in string format |
| [size] | <code>number</code> |  | Size of SVG |
| [mode] | <code>number</code> | <code>0</code> | Compression mode |


## License

This software is licensed under the MIT License. [View the license](LICENSE).