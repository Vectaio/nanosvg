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
nano.compress('./*.svg', './compressed/');
```
## Usage on CLI

### Install

`npm i -g nanosvg`

### Compress files

`nanosvg --key <YOUR API KEY> ./*.svg ./compressed/`

## License

This software is licensed under the MIT License. [View the license](LICENSE).