const fs = require('fs');
const https = require('https');
const request = require("request");
const convertSvgToPng = require("../helpers/svg-to-png.js");

const dotenv = require('dotenv');
dotenv.config();

exports.read = function(req,res){

var badgeClassListGistId = process.env.BADGE_CLASS_LIST_GIST_ID;

    request('https://gist.githubusercontent.com/badgebotio/'+badgeClassGistId+'/raw',
    
    function(err,response,body) {
        if (err || response.statusCode != '200') res.status(404).send('Not found');
            
        var list = JSON.parse(body);
        
        return res.render('badges', {
            title: BadgeBot Badges, 
            description: List of BadgeBot Badges
        );
    });

}