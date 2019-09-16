exports.read = function(req,res){

    return res.render('index', {
        title: "BadgeBot",
        description: "The world's first Open Badges issuing Twitter bot."
    });
};