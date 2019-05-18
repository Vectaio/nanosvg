![Nano](logo.png)

SVG files compression tool for Nano. For more information, visit [Nano](https://vecta.io/nano)

## Installation

`npm install nanosvg`

## Authentication

Obtain API Key in [Nano](https://vecta.io/nano)

## Usage

```javascript
var Nano = require('nanosvg'),
    nano = new Nano({ 
                key: <YOUR API KEY>,
                mode: <COMPRESSION MODE> // image mode = 0 [default], object mode = 1
            });

// compress in bulk
nano.compress('./*.svg', './compressed/').then(function () {
    console.log('Compression done');
});
```
## Usage on CLI

### Install

`npm i -g nanosvg`

### Compress files

`nanosvg "./*.svg" ./compressed/ --key <YOUR API KEY> --mode <COMPRESSION MODE>`

### Options

`key <string>` 

- API key obtained from [Nano](https://vecta.io/nano)

`mode <number>` 

- 0 = image mode [default] (with font embedding)
- 1 = object mode (without font embedding)

`precision <number>`

- Precision of numerical values in SVG.
- 3 [default]

## License

This software is licensed under the MIT License. [View the license](LICENSE).
