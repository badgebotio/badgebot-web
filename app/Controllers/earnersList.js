const request = require("request");
const dotenv = require('dotenv');
dotenv.config();
const async = require("async");

var gistsUsername = process.env.GITHUB_USERNAME;
var s3URL = process.env.S3_BUCKET_URL+process.env.S3_BADGE_IMAGES_FOLDER;

exports.read = function(req,res){

var badgeClassId = req.params.badgeClassId;

    async.waterfall([
        function(callback) {
            // get badge Image

            request('https://gist.githubusercontent.com/'+gistsUsername+'/'+badgeClassId+'/raw',
                function(err,response,body) {
                    var badge = JSON.parse(body);
                    badge.badgeImageURL = s3URL+"/"+badge.hashtag_id+"-image.png";
                    callback(null,badge);
                }
            );
        },

        function (badge, callback) {

            earnersArrJSON = require("../earners.json");
            earnersArr = [];

            async.each(earnersArrJSON, function(earner, callback) {

                if (earner.badgeClassGistId === badgeClassId ) {

                    //console.log("USERNAME: "+earner.username);

                    earnersArr.push(earner);   
                }
                callback();
            },
            function(err){

                if (err) callback(err);

                //console.log("MAP Earners: "+JSON.stringify(mapEarnersArr));

                callback(null, badge, earnersArr);
            });
        }
    ],
    function(err, badge, earnersArr) {

        if (err) {
            console.log("EARNERS MAP "+err);
            res.status(500).send('err');
        }

       // console.log(badgeImageURL);

        return res.render('earners-list', {
            title: badge.name + " Earners", 
            description: badge.name + " Earners List", 
            countEarners: earnersArr.length,
            earners: earnersArr,
            badge: badge
        });

    });
}