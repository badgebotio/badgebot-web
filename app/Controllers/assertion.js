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
const bakery = require('openbadges-bakery'); 
/** this is the unofficial bakery because the official one isn't supported by Mozilla anymore **/

var bbGists = [];

const logger = require('../../config/winston');

const dotenv = require('dotenv');
dotenv.config();

var gistsUsername = process.env.GITHUB_USERNAME;

var s3URL = process.env.S3_BUCKET_URL+process.env.S3_BADGE_IMAGES_FOLDER;

exports.read = function(req,res, next){

    var assertionUrl = 'https://gist.githubusercontent.com/'+gistsUsername+'/'+req.params.assertionId+'/raw';

    async.waterfall([
        getGist, //assertion
        getBadge,
        getBadgeImage
    ], function (err, gist, badge, badgeImage) {

        if (err) {
            logger.error("File: "+__filename+" Error: "+err.message);
            res.status(500);
            return next(err);
        }
        else {
            earner = gist.recipient.identity;
            earner = earner.replace('https://twitter.com/','');
            title = badge.name+" Earned by @"+earner;
            issuerName = badge.issuer.name;
            evidence = gist.evidence.id;
            evidenceNarrative = gist.evidence.narrative;
            issuedOn = moment(gist.issuedOn).format('YYYY-MM-DD HH:mm:ss'); 
            badgeFileName = badge.hashtag_id+'-'+earner+'-'+gist.issuedOn+'.png';
            badgeImageURL = s3URL+"/"+badge.hashtag_id+"-image.png";



            if (req.params.download) {
               // console.log("download this badge " +JSON.stringify(badge));

                const file = Buffer(badgeImage, 'base64');
                bakery.bake({
                    image: file,
                    assertion: gist}, 
                    function (err,imageData) {
                       // console.log("ERR "+err);
                        console.log("imageData "+JSON.stringify(imageData));
                        res.set('Content-Type', 'image/png')
                        res.set('Content-Disposition', 'attachment; filename='+badgeFileName+'');
                        res.set('Content-Length', imageData.length);
                        res.end(imageData, 'binary');
                        return;
                });
            }
            else {

                return res.render('assertion', {
                    id: req.params.assertionId,
                    title: title,
                    description: badge.description,
                    //badgeImage: badgeImage,
                    badgeFileName: badgeFileName,
                    badgeImageURL: badgeImageURL,
                    earner: earner,
                    issuedOn: issuedOn,
                    evidence: evidence,
                    evidenceNarrative: evidenceNarrative,
                    assertionUrl: assertionUrl
                });
            }
        }
    });

    function getGist (callback) {
        request(assertionUrl,
        
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

    function getBadgeImage(gist, badge, callback) {
        var imageRequest = require('request').defaults({ encoding: null });
        var badgeImageURL = s3URL+"/"+badge.hashtag_id+"-image.png";

        imageRequest.get(badgeImageURL, function (err, response, body) {

            if (!err && response.statusCode == 200) {

                badgeImage = new Buffer(body).toString('base64');
                
                callback(null, gist, badge, badgeImage);
            }
            else {
                next(err);
            }
        });

    }

   /* 
    Using a hosted PNG file for now

   function getBadgeImage(gist, badge, callback) {

        var file = fs.createWriteStream("./images/"+hashtag_id+"");

        https.get(badge.image,function(response) {
            response.setEncoding('utf8');
            var body = '';
            response.on('data', function (chunk) {
                body += chunk;
            });
            badgeSVGFile = response.pipe(file);
            response.on('end', function () {
                badgeSVG = body;

                convertSvgToPng(body, []).then((png) => {
                    const base64data = Buffer.from(png).toString('base64');
                    //console.log("here is base64png", base64data);
                    badgeImage = base64data;

                    callback(null, gist, badge, badgeImage);
                });
            });
        });
    }*/
}