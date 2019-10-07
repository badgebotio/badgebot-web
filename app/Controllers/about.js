exports.read = function(req,res){

    return res.render('about', {
        title: "About BadgeBot",
        description: "The world's first Open Badges issuing Twitter bot."
    });
};