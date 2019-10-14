const fs = require('fs');
const https = require('https');
const request = require("request");
const rp = require('request-promise');
const async = require("async");
const convertSvgToPng = require("../helpers/svg-to-png.js");

const dotenv = require('dotenv');
dotenv.config();

var gistsUsername = process.env.GITHUB_USERNAME;
var badgeClassListGistId = process.env.BADGE_CLASS_LIST_GIST_ID;


exports.read = function(req,res){

    request('https://gist.githubusercontent.com/'+gistsUsername+'/'+badgeClassListGistId+'/raw',
    
        function(err,response,body) {

            if (err || response.statusCode != '200') res.status(404).send('Not found');
            
            var badgeListArr = body.split(",");

         //   console.log("badgeListArr "+JSON.stringify(badgeListArr));

            var badges = [];

            async.eachSeries(badgeListArr, function(badgeGistId, callback) {
                rp({uri:'https://gist.githubusercontent.com/'+gistsUsername+'/'+badgeGistId+'/raw', simple:false})
                .then(function(body) {
                    var badge = JSON.parse(body);
                    badge.gistId = badgeGistId;

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

                                badge.badgeImage = base64data;
                                badges.push(badge);
                                callback();
                            });
                        });
                    });
                });
            }, function(){
               // console.log("Badges Length" +badges.length);

               //Future Issue: Consider sorting badges alphabetically or by a sort
                return res.render('badges', {
                title: "BadgeBot Badges", 
                description: "List of BadgeBot Badges",
                badges: badges
            });
        });
    });
}