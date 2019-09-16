// simple file include mechanism using jquery load
$.getScript("./js/loader.js");

// affix replacement
var toggleAffix = function(affixElement, scrollElement, wrapper) {
    /*  this will add the `affix` class to affixElement when 
        it reaches the top of viewport (or the bottom of scrollElement).
        initially affixElement should be position: static in CSS
    */
    var height = affixElement.outerHeight(),
        top = wrapper.offset().top;
    
    if (scrollElement.scrollTop() >= top){
        wrapper.height(height);
        affixElement.addClass("affix");
    }
    else {
        affixElement.removeClass("affix");
        wrapper.height('auto');
    }
};

/* when doc is ready use jQuery to activate 
/  various components and logic */
$(function(){

    // initialize wow.js to watch when animations are scrolled into view
    new WOW().init();
    
    // smooth scrolling to page sections
    $('a.page-scroll').bind('click', function(e) {
        var $ele = $(this);
        var href = $ele.attr('href');
        var navHeight = 60;
        if (href.indexOf('#')!=-1){
            var hash = href.substring(href.indexOf('#'),href.length);
            if (typeof $(hash).offset() != "undefined") {
                $('html, body').stop().animate({
                    scrollTop: ($(hash).offset().top - navHeight)
                }, 1100, 'easeInOutExpo');
                e.preventDefault();
            }
        }
    });
    
    // always close responsive nav after click
    $('#collapsingNavbar li>a:not("[data-toggle]")').click(function() {
        $('.navbar-toggler:visible').click();
    });

    // page preloader effect -- add preload class to body tag
    setTimeout(function(){
      $('.preload').addClass('showing').delay(800).queue(function(){
        $('.preload').removeClass('showing').removeClass('preload');
      });
    }, 1000);
    
    // populate content of dynamic modals
    $('.loaded-modal').on('show.bs.modal', function (e) {
       var $this = $(this);
       var $rt = $(e.relatedTarget);
       $this.find('.loaded-image').attr("src",$rt.data("image"));
       $this.find('.loaded-caption').html($rt.data("caption")||'');
    });
    
    // nav scrollspy to highlight active section
    $('body').scrollspy({
        target: '.fixed-top',
        offset: ($('.fixed-top').outerHeight(true))||10
    });
    
    // initialize any affix components to use toggleAffix
    $('.wrapper-affix [data-toggle="affix"]').each(function() {
        
        /*  add .wrapper-affix to the affixElement ie: navbar */
        var ele = $(this),
            wrapper = $('<div></div>');
        
        ele.before(wrapper);
        $(window).on('scroll', function() {
            toggleAffix(ele, $(this), wrapper);
        });
        
        // init
        toggleAffix(ele, $(window), wrapper);
    });
    
    // activate all popovers
    $('[data-toggle=popover]').popover();

    // google maps popover    
    var $el = $('[data-map-popover]');
    var getStaticMap = function(opts) {
        var src = "https://maps.googleapis.com/maps/api/staticmap?",
            params = $.extend({
              key: 'AIzaSyCHLJ2Qre0Vpz5NkFfKXDYkWvF49cbP25o', //use your own key
              center: 'New York NY',
              zoom: 13,
              size: '500x300',
              maptype: 'roadmap',
              sensor: false
            }, opts),
            query = [];
        
        $.each(params, function(k, v) {
          query.push(k + '=' + encodeURIComponent(v));
        });
        
        src += query.join('&');
        return '<img src="' + src + '" />';
    };
    $el.each(function(){
       var $e = $(this);
       var l = $e.data("location");
       $e.popover({ 
            title: l, 
            content: getStaticMap({center:l}), 
            html:true, 
            trigger:'hover'
        }); 
    });
});