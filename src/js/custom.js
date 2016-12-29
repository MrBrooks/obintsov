/**************************************/
/* Custom JavaScript files supervisor */
/**************************************/

$(window).load(function(){

});
$(document).ready(function() {
  // mythMenu();
  Popup();
  mainPageInteractive();
  var myth_menu = new MythMenuControll();
  var adaptive_images = new AdaptiveImages();

  var pockets = new AnimOnScroll({
    selector: ".pocket-up, .fade-in",
    // visible: "visible",
    delay: 300
  });

  var window_updater = new WindowUpdater([
    {
      event: "scroll",
      actions: [
        pockets.updateView,
        myth_menu.update
      ]
    },
    {
      event: "resize",
      actions: [
        pockets.updateItems,
        adaptive_images.update
      ]
    }
  ]);

  $(window).trigger('scroll');
});



function Popup(options){
  var def = {
    selector: '.popup-open',
    class: 'active',
    close: '.popup-close'
  };

  var opts = $.extend(def, options);

  var triggers, target, close, body = $('body');

  function init(){
    triggers = $(opts.selector);

    triggers.on('click', openPopup);
  }

  function openPopup(){
    body.addClass('noscroll');
    target = $($(this).attr('data-target'));
    target.addClass(opts.class);
    close = target.find(opts.close);
    close.on('click', closePopup);
  }

  function closePopup(){
    close.off('click');
    target.removeClass(opts.class);
    body.removeClass('noscroll');
  }

  init();
}

function mainPageInteractive(){
  var main, btn, text;

  function init(){
    main = $("#main-page");
    btn = $("#show-grid");
    text = $("#change-text");

    btn.on('click', chahgeText);
  }

  function showGrid(){
    btn.removeClass('visible').css('opacity','0');
    main.css('height', $(window).height());
    main.addClass('auto-height');
    setTimeout(function(){
      main.css('height', '');
    },300);
  }
  function chahgeText(){
    text.removeClass('visible');
    setTimeout(function(){
      text.children().html('Каждый миф – заблуждения, с которыми мы сталкиваемся каждый день в журналах, <br> по телевизору, в разговорах с подругой.');
      text.addClass('visible');
      showGrid();
    },500);
  }

  init();
}
function WindowUpdater(opts){
  var self = this, timer;

  self.add = function(event, func){
    for(var i = 0; i < opts.length; i++){
      if(opts[i].event === event){
        opts[i].actions.push(func);
        break;
      }
    }
  };

  self.update = function(event){
    clearTimeout(timer);
    timer = setTimeout(function(){
      if(event.data !== null){
        for(var i = 0; i < opts[event.data].actions.length; i++){
          opts[event.data].actions[i]();
        }
      }
      //do smthng
    },50);
  };

  self.onEvents = function(){
    for(var i = 0; i < opts.length; i++){
      $(window).on(opts[i].event, i, self.update);
    }
  };

  self.onEvents();
}

function AnimOnScroll(options){
  var def = {
    selector: ".scroll-anim",
    visible: "visible",
    delay: 100
  };

  var self = this;
  var opt = $.extend(def, options);

  var select = $(opt.selector);
  var items = [], anim_on = false;
  var H = $(window).height(), if_mobile = $(window).width() < 768? true : false;


  function isHidden(elem){
    var ws = $(window).scrollTop();
    if( (elem.top >= ws + H) || (elem.top + elem.height <= ws)){
      return true;
    }
    return false;
  }

  function isVisible(elem){
    var ws = $(window).scrollTop();
    if( ((elem.top >= ws) && (elem.top <= ws+H)) || (elem.top + elem.height >= ws && elem.top <= ws)){
      return true;
    }
    return false;
  }

  function isFullyVisible(elem){
    var ws = $(window).scrollTop();
    if(elem.top > ws && elem.top + elem.height < ws + H){
      return true;
    }
    return false;
  }

  function filterVisible(){
    items = _.reject(items,function(item){
      return item.item.hasClass(opt.visible);
    });
    // console.log(items.length);
  }

  self.updateItems = function (){
    items = [];
    H = $(window).height();
    select.each(function(){
      items.push({
        item: $(this),
        top: $(this).offset().top,
        height: $(this).height()
      });
    });
  };

  self.updateView = function(){
    var counter = 0, mass = [];
    for(var i = 0; i < items.length; i++){
      if(!items[i].item.hasClass(opt.visible)){
        if(isVisible(items[i])){
          mass.push(i);
          setTimeout(function(){
            try{
              items[mass[counter++]].item.addClass(opt.visible);
            } catch (e){
              // console.log(e);
            }
          },opt.delay*(counter++))
        }
      }
    }
    setTimeout(filterVisible, opt.delay*counter+100);
    counter = 0;
  };
  self.updateItems();

  if(if_mobile){
    select.addClass(opt.visible);
  }
}
function MythMenuControll(){
  var menu = $("#myth-menu-open");
  var trigger_height = 100, self = this, active = "add-bg";

  self.update = function(){
    if($(window).scrollTop() > trigger_height){
      menu.addClass(active);
    } else{
      menu.removeClass(active);
    }
  };

  self.rebuild = function(){
    menu = $("#myth-menu-open");
  };
}

function AdaptiveImages(){
  var images, mobile_start = 768, self = this;

  function init(){
    images = $("[data-src-desktop]");
    self.update();
  }

  this.update = function(){
    var w = $(window).width();
    if( w <= mobile_start) {
      images.map(loadMobile);
    } else{
      images.map(loadDesktop);
    }
  };

  this.rebuild = function(){
    init();
  };
  function loadMobile(){
    var src = $(this).attr("data-src-mobile");
    if( src ){
      $(this).attr('src', src);
    }
  }

  function loadDesktop(){
    var src = $(this).attr("data-src-desktop");
    if( src ){
      $(this).attr('src', src);
    }
  }

  init();
}