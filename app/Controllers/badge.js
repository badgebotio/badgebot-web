const fs = require('fs');
const https = require('https');
const request = require("request");
const convertSvgToPng = require("../helpers/svg-to-png.js");

exports.read = function(req,res){
  var badgeClassGistId = req.params.gistId;
  console.log("badgeClassGistId "+req.params.gistId);

  //get badge class gist. Badgebot repo is using request-promise which is better.

  request('https://gist.githubusercontent.com/badgebotio/'+badgeClassGistId+'/raw',
    function(err,response,body) {
      if (err || response.statusCode != '200') res.status(404).send('Not found');
            
      var badge = JSON.parse(body);
  
      console.log("BADGE ");
      console.log(badge);

      var file = fs.createWriteStream("badgeImage.svg");

      https.get('https://gist.githubusercontent.com/badgebotio/d63c82ce789bef941d834293d1fe1a74/raw/b04ff4e83dbb488e8f3958bb6eb4c4c9fb8cbcec/you-rock-badge.svg',function(response) {
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