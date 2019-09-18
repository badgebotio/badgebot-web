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
            width = 400;
            height = 400;

            var file = fs.createWriteStream("badgeImage.svg");

            https.get('https://gist.githubusercontent.com/badgebotio/d63c82ce789bef941d834293d1fe1a74/raw/b04ff4e83dbb488e8f3958bb6eb4c4c9fb8cbcec/you-rock-badge.svg',function(response) {
                response.setEncoding('utf8');
                var body = '';
                response.on('data', function (chunk) {
                    body += chunk;
                });
                badgeSVGFile = response.pipe(file);
                response.on('end', function () {
                    console.log('BODY: ' + body);
                        //});
                        badgeSVG = body;

                        convertSvgToPng(body, width, height, []).then((png) => {
                            const base64data = Buffer.from(png).toString('base64');
                            //console.log("here is base64png", base64data);
                            badgeImage = base64data;

                        return res.render('assertion', {
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
        request('https://gist.githubusercontent.com/badgebotio/'+assertionId+'/raw',
        
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