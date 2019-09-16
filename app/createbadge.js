/* refer to test.js */

const window   = require('svgdom');
const SVG      = require('svg.js')(window);
const svgpath = require('svgpath');
const document = window.document;
const { convert, convertFile } = require('convert-svg-to-png');
// var svgpath = require('svgpath');
const fs = require('fs');
const path = require('path');

// needed constants
const badgeHeight = 400;
const badgeWidth = 400;

/* example call from inside file */
// completeBadge("testbadge", ["photo", "resource"]);

/* Read the SVG, transform the SVG, then create a PNG and return in base64 encoding. */
module.exports = function(badgeName, completeCriteria) {
  // this makes me nervous
  const badge = require(path.join(__dirname, `badges/${badgeName}.js`));
  console.log("Badge create "+badge);
  const criteria = badge.criteria.filter(c => {
    return completeCriteria.indexOf(c.hashtag_id) > -1;
  });
  const colors = fisherYatesShuffle(getColorsForCriteria(criteria));

  // setup
  const draw = SVG(document.documentElement);
  const svgHtml = fs.readFileSync(path.join(__dirname, badge.svg_file), { encoding: "utf-8" });
  const svg = draw.svg(svgHtml).width(badgeWidth).height(badgeHeight);

  // do math stuff
  const indivWidth = badgeWidth / colors.length;

  // for each color, paint it on the svg
  colors.forEach((color, index) => {
    svg.rect(indivWidth, badgeHeight)
      .attr({ x: indivWidth * index, opacity: 0.4 })
      .fill(color);
  });

  // this will write a file, then return png buffered data
  return localConvert(svg.svg());
}

function getColorsForCriteria(criteria) {
  return criteria.map(c => c.badge_color);
}

function fisherYatesShuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

/* uncomment the line below to see how the localConvert works */
async function localConvert(input, outputFilePath) {
  let options = { width: badgeWidth, height: badgeHeight };
  if (outputFilePath) {
    // options = { ...options, filename: outputFilePath };
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
