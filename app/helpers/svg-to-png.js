const window   = require('svgdom');
const SVG      = require('svg.js')(window);
const svgpath = require('svgpath');
const document = window.document;
const { convert, convertFile } = require('convert-svg-to-png');
const fs = require('fs');
const path = require('path');

// needed constants
const badgeHeight = 400;
const badgeWidth = 400;


module.exports = function(svgData, width, height) {

const draw = SVG(document.documentElement);
const svg = draw.svg(svgData).width(width).height(height);

return localConvert(svg.svg());
}


async function localConvert(input, outputFilePath) {
    let options = { width: width, height: height };
    if (outputFilePath) {
        options = { ...options, filename: outputFilePath };
    }

  //console.log("options", options);
    return await convert(input, options).then((data) => {
        console.log("Successfully converted");
        return data;
    }, (error) => {
        const errorString = "ERROR:" + error;
        console.log(errorString);
        return errorString;
    });
}