
// load partials using jquery load and the run global scripts
$('[class^="inc_"]').each(function(i,e){
    try {
        var $root = $(e);
        var templatePath = $root.data("template");
        //console.log(templatePath);
        var $div = $('<div>');
        $div.load(templatePath,function(){
           
            var par = $(this);
            if (par.find('.inc_').length==0) {
                // no child includes
                $root.replaceWith(par.contents().unwrap());
                $.getScript("./js/scripts.js");
            }   
            else {
                // handle nested child includes
                var done = function(parent,element){
                    parent.replaceWith(element.contents().unwrap());
                    $root.replaceWith(parent.html());
                };
                
                // find includes in the child
                par.find('.inc_').each(function(i,el){
                    var ele = $(el);
                    var tPath= ele.data("template");
                    
                    // load the content for the child include
                    var $sub = $('<div>');
                    $sub.load(tPath, function(){
                        ele.replaceWith($sub.contents().unwrap());
                        done(par,ele);
                    });
                });
            } 
            
        });
    } catch (er) {
        console.log("error loading: " + templatePath + "-" + er);
    }
});