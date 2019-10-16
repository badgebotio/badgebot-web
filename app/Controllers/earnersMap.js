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
            mapEarnersArr = [];

            async.each(earnersArrJSON, function(earner, callback) {

                if (earner.badgeClassGistId === badgeClassId ) {

                    if (earner.geo) {
                        console.log("USERNAME: "+earner.username);

                        mapEarnersArr.push(earner);   
                    }
                }
                callback();
            },
            function(err){

                if (err) callback(err);

                //console.log("MAP Earners: "+JSON.stringify(mapEarnersArr));

                callback(null, badgeImageURL, mapEarnersArr);
            });
        }
    ],
    function(err, badgeImageURL, mapEarnersArr) {

        if (err) {
            console.log("EARNERS MAP "+err);
            res.status(500).send('err');
        }

        console.log(badgeImageURL);

        return res.render('earners-map', {
            title: "BadgeBot Badges", 
            description: "Map of Earners", //Give this a better description relative to badge name
            mapEarners: mapEarnersArr,
            badgeImage: badgeImageURL
        });

    });
}

//AIzaSyAQz357TW_Kiy6GspJv_R8wGCG6wTQIxvE

//https://developers-dot-devsite-v2-prod.appspot.com/maps/documentation/javascript/examples/infowindow-simple

/**
Write a separate script that queries for all assertion gists and
save data like:

var earnersArr = [
{
username: "@kayaelle", //earner
assertionGistId: "8f99d2cf70238ef3d3fb458ba0885a82", //assertion
"evidence":{
    "id":"https://twitter.com/sadhappyboto/status/1183872777989873664",
    "narrative":"Issued on Twitter by Badgebot from <a href=\"https://twitter.com/sadhappyboto\">@sadhappyboto</a>"
},
issuedOn: "2019-10-08T14:40:43-04:00"
badgeClassGistId: "dfcedd03d5b4897740a39460b9611313", //badge class
"geo": {
      "latitude": 36.025609,
      "longitude": -78.9853813
    }
},
{
username: "ottonomy", //earner
assertionGistId: "8d06d2442d2a7b9c9156bc27fea4cfe4", //assertion
"evidence":{
    "id":"https://twitter.com/sadhappyboto/status/1183872777989873664",
    "narrative":"Issued on Twitter by Badgebot from <a href=\"https://twitter.com/sadhappyboto\">@sadhappyboto</a>"
},
issuedOn: "2019-10-08T14:40:43-04:00"
badgeClassGistId: "dfcedd03d5b4897740a39460b9611313", //badge class
"geo": {
      "latitude": 44.058174,
      "longitude": -121.315308
    }
}];

This is going to be used for:

- earners list
- map of earners

The script will run on a cron so that the list is updated frequently (2 mins?) but not on the fly
because that'd be too slow. 

Map should interate through earnersArr then
Query google maps client 
https://developers.google.com/maps/documentation/geocoding/intro
then
save coordinates to an array
render map page and use coordinates on
https://www.react-simple-maps.io/docs/marker/
**/
