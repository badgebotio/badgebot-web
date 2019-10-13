const fs = require('fs');
const https = require('https');
const request = require("request");
const convertSvgToPng = require("../helpers/svg-to-png.js");

const dotenv = require('dotenv');
dotenv.config();

var gistsUsername = process.env.GITHUB_USERNAME;

exports.read = function(req,res){
  var badgeClassGistId = req.params.gistId;
 // console.log("badgeClassGistId "+req.params.gistId);

  //get badge class gist. Badgebot repo is using request-promise which is better.

  $requestUrl = 'https://gist.githubusercontent.com/'+gistsUsername+'/'+badgeClassGistId+'/raw';
 // console.log("Badge Class Gist "+$requestUrl);

  request('https://gist.githubusercontent.com/'+gistsUsername+'/'+badgeClassGistId+'/raw',
    function(err,response,body) {
if (err || response.statusCode != '200') res.status(404).send('Not found');
            
      var badge = JSON.parse(body);
  
     // console.log("BADGE ");
     // console.log(badge);

      var file = fs.createWriteStream("badgeImage.svg");

      https.get(badge.image,function(response) {
        response.setEncoding('utf8');
          var body = '';
          response.on('data', function (chunk) {
            body += chunk;
          });
          badgeSVGFile = response.pipe(file);
          response.on('end', function () {
            // console.log('BODY: ' + body);
            badgeSVG = body;

            convertSvgToPng(body, []).then((png) => {
            const base64data = Buffer.from(png).toString('base64');

            badgeImage = base64data;

            return res.render('badge', {
              title: badge.name, 
              description: badge.description,
              badge: badge,
              badgeImage: badgeImage,
            });
          });
        });
      });
    }
  );
};