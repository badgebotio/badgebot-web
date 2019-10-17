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
                    var badgeImageURL = s3URL+"/"+badge.hashtag_id+"-image.png";
                    callback(null,badgeImageURL);
                }
            );
        },

        function (badgeImageURL, callback) {

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

                callback(null, badgeImageURL, earnersArr);
            });
        }
    ],
    function(err, badgeImageURL, earnersArr) {

        if (err) {
            console.log("EARNERS MAP "+err);
            res.status(500).send('err');
        }

       // console.log(badgeImageURL);

        return res.render('earners-list', {
            title: "BadgeBot Badges Earners", 
            description: "Earners List", 
            earners: earnersArr,
            badgeImage: badgeImageURL
        });

    });
}