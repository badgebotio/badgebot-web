var Gists = require('gists');
const ghConfig = require('../../config/github');
const gists = new Gists(ghConfig);
const request = require("request");
const fs = require('fs');
const https = require('https');
const moment  = require('moment');
const async = require("async");
//const createBadge = require("../createbadge.js");
const _ = require('underscore');
var bbGists = [];

//http://sharp.pixelplumbing.com/en/stable/install/

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
            // badgeFile = require('../badges/'+localBadgeFileName+'.js');

            var file = fs.createWriteStream("badgeImage.svg");

            https.get('https://gist.githubusercontent.com/badgebotio/d63c82ce789bef941d834293d1fe1a74/raw/b04ff4e83dbb488e8f3958bb6eb4c4c9fb8cbcec/you-rock-badge.svg',function(response) {
                response.setEncoding('utf8');
                /*response.on('data', function (body) {
                    console.log(body);*/
                var body = '';
                response.on('data', function (chunk) {
                    body += chunk;
                });
                badgeSVGFile = response.pipe(file);
                response.on('end', function () {
                    console.log('BODY: ' + body);
                        //});
                        badgeSVG = body;
            

                    /* createBadge(localBadgeFileName, []).then((png) => {
                    const base64data = Buffer.from(png).toString('base64');
                    //console.log("here is base64png", base64data);
                    badgeImage = base64data;

                    console.log("LocalFilename "+JSON.stringify(localBadgeFileName));

                    console.log("GIST "+JSON.stringify(gist));
                    console.log("BADGE "+JSON.stringify(badge));

                    console.log("EARNER "+JSON.stringify(earner));

                    console.log("LOCAL BADGE "+JSON.stringify(badgeFile));

                    console.log("ISSUER NAME "+JSON.stringify(issuerName));

                    console.log("EVIDENCE "+JSON.stringify(evidence));

                    console.log("EVIDENCE "+JSON.stringify(evidenceNarrative));

                    onsole.log("ISSUED ON "+JSON.stringify(issuedOn));*/


                    return res.render('assertion', {
                        title: title,
                        description: badge.description,
                        // badge: badgeFile,
                        // badgeImage: badgeImage,
                        badgeSVGFile: badgeSVGFile,
                        badgeSVG: badgeSVG,
                        earner: earner,
                        issuedOn: issuedOn,
                        evidence: evidence,
                        evidenceNarrative: evidenceNarrative 
                    });
                });
            });
        }
   // });
    });

    function getGist(callback) {
        var assertionId = req.params.assertionId;
        //.log("assertionId "+assertionId);
        request('https://gist.githubusercontent.com/badgebotio/'+assertionId+'/raw',
        
        function(err,response,body) {
            if(err) callback(err);

            try {
                gist = JSON.parse(body);
                // console.log("GIST "+JSON.stringify(gist.badge));
                callback(null,gist);
            } catch (err) {
                callback(err);
            }
        });
    }

    function getBadge(gist,callback) {
        request(gist.badge,
        function(err,response,body) {
            if(err) callback(err);

            try {
                badge = JSON.parse(body);
                //console.log("BADGE "+JSON.stringify(badge));
            
                callback(null,gist,badge);
            } catch (err) {
                callback(err);
            }

            
        });
    }
}