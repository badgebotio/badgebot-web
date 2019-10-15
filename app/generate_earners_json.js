var Gists = require('gists');
const fs = require('fs');
const rp = require('request-promise');
const async = require("async");
const dotenv = require('dotenv');
dotenv.config({path: __dirname + '/../.env'});

var gistsUsername = process.env.GITHUB_USERNAME;

gists = new Gists({
    username: gistsUsername, 
    password: process.env.GITHUB_PASSWORD
});

/*function JSONStringify(object) {
    var cache = [];        
    var str = JSON.stringify(object,
        // custom replacer fxn - gets around "TypeError: Converting circular structure to JSON" 
        function(key, value) {
            if (typeof value === 'object' && value !== null) {
                if (cache.indexOf(value) !== -1) {
                    // Circular reference found, discard key
                    return;
                }
                // Store value in our collection
                cache.push(value);
            }
            return value;
        }, 4);
    cache = null; // enable garbage collection
    return str;
};

console.log("USERNAME "+gistsUsername);*/

/**

Assumptions: 
- Only getting first page of results for prototype. Future issue: pagination
- There is only one file per gist**/

gists.all(function(err, res){
  console.log("GISTS Body "+ JSON.stringify(res.body));
  var gistResults = res.body;
  async.each(gistResults, function(gist, callback) {
    var filename = Object.keys(gist.files)[0];
      //console.log("filename "+ filename);
    if (filename.match(/assertion/)) {
      //console.log(" badge url "+ gist.files[filename].raw_url);

      var raw_url = gist.files[filename].raw_url.split('/');
      var assertionGistId = raw_url[4];
      var assertionURL = 'https://gist.githubusercontent.com/'+gistsUsername+'/'+assertionGistId+'/raw/';

      rp({uri:assertionURL, simple:false})
        .then(function(body) {
          assertion = JSON.parse(body);
           // console.log("ASSERTION "+assertion );
          earner = assertion.recipient.identity;
          earner = earner.replace('https://twitter.com/','');
          console.log("EARNER "+earner);

          /** next:
          -evidence
          -issued
          -badgeclass gist id

          save to file

          pull from file and generate map

          save geolocation to apprpriate tweets

          **

        }
      );    

            //earner = gist.recipient.identity;
      //earner = earner.replace('https://twitter.com/','');   
    }
        callback();
    
  }, function (){

  });
});


/**

This script will generate a file that will export a json array of earners to be used for
- earners list
- map of earners

1. Get all badgebotio gists
2. Find if gist has a file name with "assertion"
3. Get assertion, earner, badge info & save to object
4. Push object to array
5. Save array to file that exports it to be used on the site
6. Set up cron to run every 2 mins

// Writing...
var fs = require("fs");
var myJson = {
    key: "myvalue"
};

fs.writeFile( "filename.json", JSON.stringify( myJson ), "utf8", yourCallback );

// And then, to read it...
myJson = require("./filename.json");


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

**/
