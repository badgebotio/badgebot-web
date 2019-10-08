var Gists = require('gists');
const ghConfig = require('../../config/github');
const gists = new Gists(ghConfig);
const request = require("request");
const fs = require('fs');
const https = require('https');
const moment  = require('moment');
const async = require("async");
const convertSvgToPng = require("../helpers/svg-to-png.js");
const _ = require('underscore');
var bbGists = [];

const logger = require('../../config/winston');

const dotenv = require('dotenv');
dotenv.config();

var gistsUsername = process.env.GITHUB_USERNAME;

exports.read = function(req,res, next){

    async.waterfall([
        getGist, //assertion
        getBadge
    ], function (err, gist, badge) {

        if (err) {
            logger.error("File: "+__filename+" Error: "+err.message);
            res.status(500);
            return next(err);
        }
        else {
            earner = gist.recipient.identity;
            earner = earner.replace('https://twitter.com/','');
            title = badge.name+" Earned by @"+earner;
            localBadgeFileName = badge.badgebotName;
            issuerName = badge.issuer.name;
            evidence = gist.evidence.id;
            evidenceNarrative = gist.evidence.narrative;
            issuedOn = moment(gist.issuedOn).format('YYYY-MM-DD HH:mm:ss'); 

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
                        //});
                        badgeSVG = body;

                        convertSvgToPng(body, []).then((png) => {
                            const base64data = Buffer.from(png).toString('base64');
                            //console.log("here is base64png", base64data);
                            badgeImage = base64data;

                        return res.render('assertion', {
                            id: req.params.assertionId,
                            title: title,
                            description: badge.description,
                            // badge: badgeFile,
                            badgeImage: badgeImage,
                            badgeSVGFile: badgeSVGFile,
                            badgeSVG: badgeSVG,
                            earner: earner,
                            issuedOn: issuedOn,
                            evidence: evidence,
                            evidenceNarrative: evidenceNarrative 
                        });
                    });
                });
            });
        }
    });

    function getGist(callback) {
        var assertionId = req.params.assertionId;
        request('https://gist.githubusercontent.com/'+gistsUsername+'/'+assertionId+'/raw',
        
        function(err,response,body) {
            if(err) callback(err);

            if (response.statusCode != '200') next(err);
            
            gist = JSON.parse(body);
            
            if (! gist.badge) next(err);
            
            callback(null,gist);
        });
    }

    function getBadge(gist,callback) {
        request(gist.badge,
        
        function(err,response,body) {
            if(err) callback(err);

            if (response.statusCode != '200') next(err);

            badge = JSON.parse(body);
            
            callback(null,gist,badge);
            
        });
    }
}