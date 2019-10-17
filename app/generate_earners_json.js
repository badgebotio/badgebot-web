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

/**

Assumptions: 
- Only getting first page of results for prototype. Future issue: pagination
- There is only one file per gist**/

var earners = [];

gists.all(function(err, res){
 // console.log("GISTS Body "+ JSON.stringify(res.body));
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
          var username = earner.replace('https://twitter.com/','');
          var evidence = assertion.evidence;
          var issuedOn = assertion.issuedOn;

          var badgeclass_raw_url = assertion.badge.split('/');
          var badgeClassGistId = badgeclass_raw_url[4];
          //console.log("username "+username);
          //console.log("assertionGistId "+assertionGistId);
          //console.log("evidence "+JSON.stringify(evidence));
          //console.log("badgeClassGistId "+badgeClassGistId);

          var earner = {
            "username": username,
            "assertionGistId": assertionGistId,
            "evidence": evidence,
            "issuedOn":assertion.issuedOn,
            "badgeClassGistId": badgeClassGistId
          };

          //if (assertion['schema:location']) console.log(JSON.stringify(assertion['schema:location'].geo));

          if (assertion['schema:location']) earner.geo = assertion['schema:location'].geo;


          earners.push(earner);

          fs.writeFile( "earners.json", JSON.stringify( earners ), "utf8", (err) => {
            if (err) callback(err);
            callback();
          });
        }
      );    
  
    }
    
  }, function (err){
    console.log("Complete: earners.json");
  });
});
