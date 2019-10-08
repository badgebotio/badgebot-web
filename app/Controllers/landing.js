const dotenv = require('dotenv');
dotenv.config();

var twitterUsername = process.env.TWITTER_USERNAME;

exports.read = function(req,res){

    return res.render('index', {
        title: "BadgeBot",
        description: "The world's first Open Badges issuing Twitter bot.",
        twitterUsername: twitterUsername
    });
};