/**************************************/
/* Custom JavaScript files supervisor */
/**************************************/
(function(){

var pockets;

$(window).load(function(){
  setTimeout(function(){
    $("#preloader").addClass('loaded');
    pockets.updateItems();
    pockets.updateView();
  },1000);
  createVideoIframe();
});

$(document).ready(function() {
  // mythMenu();
  var popup = new Popup();
  var main_page = new mainPageInteractive();
  var myth_menu = new MythMenuControll();
  var adaptive_images = new AdaptiveImages();
  var book_form = new AjaxSubmit({
    form: "#form-book"
  });
  var question_form = new AjaxSubmit({
    form: "#form-question"
  });
  var ajax_pages = new ajaxPagesProcesswire({
    content: '#ajax-container'
  });
  
  // $('#share').socialLikes({
  //   counters: true
  // });


  var term_loader = new ajaxGetTermsPopupContent();

  pockets = new AnimOnScroll({
    selector: ".pocket-up, .fade-in",
    // visible: "visible",
    delay: 300
  });

  var window_updater = new WindowUpdater([
    {
      event: "scroll",
      actions: [
        pockets.updateView,
        myth_menu.update,
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
  ajax_pages.setCallback(pockets.rebuild);
  ajax_pages.setCallback(main_page.rebuild);
  ajax_pages.setCallback(popup.rebuild);
  ajax_pages.setCallback(adaptive_images.rebuild);
  ajax_pages.setCallback(term_loader.rebuild);
  ajax_pages.setCallback(myth_menu.rebuild);
  ajax_pages.setCallback(book_form.rebuild);
  ajax_pages.setCallback(question_form.rebuild);

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

  this.rebuild = function(){
    triggers.off('click');
    init();
  };

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
    // main.css('min-height','100vh');
    // main.css('height', 'auto');
    main.addClass('auto-height');
    $(".step2").slideDown(1000);
    setTimeout(function(){
      // main.css('height', '');
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
  this.rebuild = function(){
    btn.off('click');
    init();
  };

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

  self.rebuild = function(){
    select = $(opt.selector);
    setTimeout(function(){
      self.updateItems();
      self.updateView();
    },500);
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
  // self.start = 
  // self.updateItems();

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

function ajaxPagesProcesswire(options){
  var def = {
    menu: '#menu',
    items: 'a.ajax-link',
    content: '#content',
    loader: '#ajax-loader'
  };
  var opt = $.extend(def, options);
  var content = $(opt.content);
  var self = this;
  var callbacks = [];
  var meta_title = $('meta[name=title]'),
    meta_description = $('meta[name=description]'),
    meta_keywords = $('meta[name=keywords]'),
    title = $('title'),
    loader = $(opt.loader);

  function updateContent(pageData){
    content.html(pageData.content);
    meta_title.attr("content",pageData.meta.title);
    meta_description.attr("content",pageData.meta.description);
    meta_keywords.attr("content",pageData.meta.keywords);
    title.text(pageData.meta.title);
    // content.append($pageData);
    content.removeClass('invisible');
  }

  function loadContent(url){
    // variable for page data
    $pageData = '';

    // send Ajax request
    $.ajax({
      type: "POST",
      url: url,
      data: { ajax: true },
      success: function(data,status){
        $pageData = JSON.parse(data);
        // console.log($pageData);
      }
    }).done(function(){
      updateContent($pageData);
      content.removeClass('invisible');
      loader.toggleClass('right');
      setTimeout(function(){
        $(window).scrollTop(0);
        loader.removeClass('active');
      },500);
      rebuild();
    });
    if(url != window.location){
      window.history.pushState({path:url},'',url);
    }
  }
  self.setCallback = function(func){
    callbacks.push(func);
  };

  function rebuild(){
    $(opt.items).off('click');
    initClick();
    for(var i = 0; i < callbacks.length; i++){
      callbacks[i]();
    }
  }

  function initClick(){
    $(opt.items).on('click',function(e) { // nav link clicked
      // load content via AJAX
      loader.addClass('active');
      content.addClass('invisible');

      loadContent($(this).attr("href"));
      // prevent click and reload
      e.preventDefault();
    });
  }

  $(window).on('popstate', function() {
    // console.log(location.pathname);

    content.addClass('invisible');
    // loadContent(location.pathname);
    $.ajax({
      url:location.pathname+'?rel=tab',
      success: function(data){
        $('#content').html(JSON.parse(data).content);
        content.removeClass('invisible');
      }
    });
  });

  initClick();
}


function ajaxGetTermsPopupContent(){
  var trigger, term_title, term_content;

  function init(){
    trigger = $('[data-term]');
    term_title = $('#term-title');
    term_content = $('#term-content');

    trigger.on('click',loadTerm);
  }

  function loadTerm(){
    var url = $(this).attr('data-term');

    $.ajax({
      type: "POST",
      dataType: "json",
      url: url,
      data: { ajax: true },
      success: function(data){
        // console.log(data);
        term_title.text(data.title);
        term_content.html(data.content);
      }
    });
  }

  this.rebuild = function(){
    trigger.off('click');
    init();
  }

  init();
}

function createVideoIframe(){
  var wrapper = $(".video-wrapper");
  var ratio = 640/320;

  var width = $(window).width(), height = 0;

  function evalSizez(){
    if( width > 768){
      width = 640;
    } else{
      width = width - 40;
    }
    height = width / ratio;
  }

  function createIframes(){
    wrapper.each(createIframe);
  }

  function createIframe(){
    var w = $(this);
    var id = getVideoId(w);
    var el = document.createElement("iframe");
    el.id = id;
    el.setAttribute('width',width);
    el.setAttribute('height',height);
    el.setAttribute('allowfullscreen', '')
    el.src = 'http://www.youtube.com/embed/'+id;
    w.append(el);
  }

  function getVideoId(el){
    return el.attr('data-video-id');
  }

  function init(){
    evalSizez();
    createIframes();
  }

  init();

}

})();

//require JQUERY
function AjaxSubmit(options){
  var def = {
    form: '.ajax-submit',
    btn: '[type="submit"]',
    message: '.message',
    isMessageInput: false,
    url: 'send.php',
    inputs: 'input:not([type="submit"]), textarea',
    invalid: 'invalid', //class
    validate: validate, //boolean function(element)
    message_succsess: "Отплавлено",
    succsess_callback: function(){},
    error_callback: function(){},
  };
  var opts = $.extend(def, options);

  var form, btn, message, inputs, sendingFlag = false, message_init = "";

  function init(){
    form = $(opts.form);
    btn = form.find(opts.btn);
    message = form.find(opts.message);
    inputs = form.find(opts.inputs);
    var url = form.attr("data-url");
    if(url){
      opts.url = url;
    }
    form.on("submit", submit);
  }

  function submit(){
    var err = false;

    inputs.each(function(){
      if(opts.validate($(this))){
        $(this).removeClass(opts.invalid);
      } else{
        $(this).addClass(opts.invalid);
        err = true;
      }

    });

    if (!err){
      var data = form.serialize();
      $.ajax({
        type: 'POST',
        url: opts.url,
        dataType: 'json',
        data: data,
        beforeSend: beforeSend,
        success: success,
        error: error,
        complete: complete
      });
    }
    return false;
  }

  function beforeSend(){
    if(opts.isMessageInput){
      message_init = message.val();
      message.val("Идет отправка...");
    } else{
      message_init = message.text();
      message.text("Идет отправка...");
    }
    btn.prop('disabled', true);
    sendingFlag = true;
  }

  function success(data){
    sendingFlag = false;
    if (data['error']) {
      if(opts.isMessageInput){
        message.val("Ошибка");
      } else{
        message.text("Ошибка");
      }
    } else {
      if(opts.isMessageInput){
        message.val(opts.message_succsess);
      } else{
        message.text(opts.message_succsess);
      }
    }
    opts.succsess_callback();
  }

  function error(xhr, ajaxOptions, thrownError){
    sendingFlag = false;
    if(opts.isMessageInput){
      message.val("Ошибка");
    } else{
      message.text("Ошибка");
    }
    opts.error_callback();
    // console.log(xhr);
    // console.log(ajaxOptions);
    // console.log(thrownError);
    // btn.prop('disabled', false);
  }
  function complete(){
    if(sendingFlag){
      message.text(message_init);
      sendingFlag = false;
    }
    btn.prop('disabled', false);
  }
  function validate(el){
    var field_type = el.attr('data-type');
    switch(field_type){
      case 'required':
        if (el.val() === ''){
          return false;
        }
        break;
      case 'email':
        var isemail = /.+@.+\..+/i;
        var t = el.val();
        if(t === '' || !isemail.test(t)){
          return false;
        }
        break;
      default: ;
    }

    return true;
  }

  this.rebuild = function(){
    init();
  };
  init();
}

// 'use strict';
//require jquery

// class SocialShareCounter {
//   constructor(url,callback){
//     this.count = undefined;
//     this.socialAnswer = '';
//     this.url = url;
//     this.callback = callback;
//   }
  
//   get countShares(){
//     return this.count;
//   }
  
//   sendRequest(){
//     $.getJSON(this.buildRequestUrl()).done((data)=>{
//       console.log(data);
//     });
//     // $.ajax({
//     //   crossDomain: true,
//     //   dataType: 'json',
//     //   type: 'POST',
//     //   url: this.buildRequestUrl(),
//     //   success: (data)=>{
//     //     this.socialAnswer = data;
//     //     console.log(data);
//     //     // parseAnswer();
//     //     // this.callback(this.count);
//     //   },
//     //   error: ()=>{
//     //     throw new Error('send request error in SocialShareCouneter::sendRequest');
//     //   },
//     // });
//   }
  
//   buildRequestUrl(){
    
//   }
  
//   parseAnswer(){
    
//   }
  
//   init(){
//     this.answer =  this.sendRequest();
//     // this.count = this.parseAnswer();
//   }
// }

// class VKShareCounter extends SocialShareCounter {
//   buildRequestUrl(){
//     return "http://vk.com/share.php?act=count&index=1&url="+this.url;
//   }
//   parseAnswer(){
//     this.count = 666;
//   }
// }

// let vk = new VKShareCounter('https://gist.github.com/jonathanmoore/2640302',(data)=>{
//   console.log(data);
// });
// vk.init();

// let VK = {
//   count: 0,
//   Share: {
//     count: function(i, count){
//       VK.count = count;
//     }
//   }
// };