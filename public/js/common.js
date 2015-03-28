// setting
window.ENV = {
  host : 'http://www.skillbank.cn',
  imgHost : 'http://skillbank.b0.upaiyun.com'
};

// fns
window.checkImgHost = function(host, url){
  return url.indexOf('http') === -1 ? host + url : url
}
var $ = document.querySelectorAll.bind(document);
Element.prototype.on = Element.prototype.addEventListener;
NodeList.prototype.on = function (event, fn) {
  []['forEach'].call(this, function (el) {
    el.on(event, fn);
  });
  return this;
};

function closestParent( el, selector ){
  if(el.matches){
    while( !el.matches(selector) ){
      el = el.parentNode;
    }
  } else{
    var className = selector.slice(1);
    while( !el.classList.contains(className) ){
      el = el.parentNode;
    }
  }
  return el
}

// ajax
function request(type, url, opts, callback) {
  var xhr = new XMLHttpRequest();
  if (typeof opts === 'function') {
    callback = opts;
    opts = null;
  }
  xhr.open(type, url);
  xhr.onreadystatechange = function(){
    if(xhr.readyState == 4){
      if( (xhr.status >= 200 && xhr.status <300) || xhr.status == 304 ){
        // console.log(xhr.responseText)
      } else {
        console.log(xhr.status);
      }

      resError(xhr.status);
    }
  }
  var fd = [];
  if (type === 'POST' && opts) {
    for (var key in opts) {
      fd.push( key + '=' + opts[key] );
    }
    fd = fd.join('&');
    xhr.setRequestHeader("Content-type","application/x-www-form-urlencoded");
  }
  xhr.onload = function () {
    callback(JSON.parse(xhr.response));
  };
  xhr.send(opts ? fd : null);
}
function resError(status){
  if(status == 401){
    if (window.confirm("你还没有登陆或注册，现在登录或注册吗？")) { 
      location.href = '/register.html';
    }
  } else if(status == 400){
    alert('400');
  }
}
var get = request.bind(this, 'GET');
var post = request.bind(this, 'POST');


var checkPage = function(){

  addBulletsWeget();
  toggleLike();
  removeTrashes();
  hackForModals();
  privateMsgForm();
  reservationForm();
  followMember();
  customRadio();
  bindCloseEventToModal();

  // course search
  if( document.getElementById('course-search') ){
    switchCourseCat();
    affix();


  }

  // course page
  if( $('.course-page').length ){

    // go for comment
    $('.goto').on('click', function(event){
      event.preventDefault();
      location.href = '#' + this.dataset.for;
    });

    commentForm();
    

  }

  // chat page
  if( $('.chat-page').length ){

    // get chat detail
    var uid = 1;
    var fid = location.hash.slice(1);
    // getChatDetail(uid, fid);

    // init textrea auto size
    jQuery('#write-box').textareaAutoSize();

    $('#write-box')[0].on('keyup', function(event){
      var $submit = $('#form-write button')[0];
      if ( this.value.length ){
        $submit.removeAttribute('disabled');
      } else{
        $submit.setAttribute('disabled', '');
      }
    })

    // bind add msg
    chatForm();

  }

  // register page
  if( $('#register-page').length ){
    var $form = $('form')[0];
    $form.on('submit', function(event){
      event.preventDefault();

    });

    var $verifyBtn = $('.btn-grey');
    var seconds;
    $verifyBtn.on('click', function(){
      if(seconds>0 || !$form.phone.value) return;
      var url = ENV.host + '/api/Validation?mobile=' + $form.phone.value;
      seconds = 60;
      post(url, function(fb){
        // timer
        var t = setInterval(function(){
          if(seconds <= 0){
            $verifyBtn[0].innerText = '获得验证码';
            clearInterval(t);
          } else {
            $verifyBtn[0].innerText = seconds;
          }
          seconds--;
        }, 1000);
      });


    })
  }

  // add course page
  if( $('.add-course-page').length ) {
    addCourse();
  }
  
  // add course page 2
  if( $('.add-course-page.step-2').length ) {
    limitedText();
    checkAllFillIn();
  } 
  
  // add course page 3
  if( $('.add-course-page.step-3').length ) {
    chooseImage();
  } 
  
  // add course page private
  if( $('.add-course-page.step-private').length ) {
    checkAllFillInPrivate();
  } 

  // course manage 
  if( $('.courses-manage-page').length ) {
    confirmManage();

    // reservation modal
    $('#contact.modal .accept-reserve').on('click', function(){
      $('#contact')[0].classList.remove('active');
      toAcceptedState($('.teaching.active')[0]);
    });

    // evaluate modal
    $('#evaluate.modal .btn-evaluate').on('click', function(){
      $('#evaluate')[0].classList.remove('active');
      toDidabledState($('.teaching.active')[0]);
    });

    // set active card
    $('.teaching.card').on('click', function(){
      [].forEach.call($('.teaching.card'), function (el) {
        el.classList.remove('active');
      });
      this.classList.add('active');
    });

    // show modal.  for conflict's sake
    $('[data-modal]').on('click', function(){$('#' + this.dataset.modal)[0].classList.add('active'); });

  } 

  


};

// start here
checkPage();
window.addEventListener('push', checkPage);
function addCourse(){
  page.base('/add-course');
  page('/:stepName', load)
  page('*', check)
  page();
  function check(ctx){
    if(ctx.state.path == '/add-course.html') {
      ctx.params.stepName = 1; 
      load(ctx);
    }
  }
  function load(ctx){
    console.log('load')
    if(ctx.state.path == '/add-course.html') {ctx.params.stepName = 1; }
    $('.content.active')[0].classList.remove('active');
    $('.content.step-' + ctx.params.stepName)[0].classList.add('active');
  }
}
function switchCourseCat(){
  // page('*', parse)
  page('/by:by/type:type', load)
  page();

  function parse(ctx, next) {
    ctx.query = qs.parse(location.search.slice(1));
    load(ctx);
  }

  function load(ctx){
    console.log(arguments);

    // fix bug
    if(location.href.slice(-1) == '#')return;
    
    ctx.query = ctx.params;
    var self = this;
    var geo_opts = {
        enableHighAccuracy: true, 
        maximumAge        : 30000, 
        timeout           : 27000
      };

    // nearby skill
    if(ctx.query.by == 0){
      navigator.geolocation.getCurrentPosition(function (position) {
        var url = ENV.host + '/api/ClassList?' + 'by=' + ctx.query.by + '&type=' + ctx.query.type +
                  '&PosY=' + position.coords.latitude + '&PosX=' + position.coords.longitude;
        getCourses(url, ctx);
      }, function(){
        console.log("Sorry, no position available.")
      }, geo_opts);
    } else if(ctx.query.by){
      var url = ENV.host + '/api/ClassList?' + 'by=' + ctx.query.by + '&type=' + ctx.query.type;
      getCourses(url, ctx);
    }
  }
}

function getCourses(url, ctx){
  var $loading = $('.loading');
  var $cats = $('.search-cat-wrap a');
  $loading[0].style.display = 'block';
  get(url, function(fb){
    if( !_.isArray(fb) ) return;
    // insert html
    var tpl = $('#course-tpl')[0].innerHTML;
    $('.course-list')[0].innerHTML = _.template(tpl, {courses: fb, imgHost: ENV.imgHost});
    // active tab
    [].forEach.call($cats, function (el) {
      el.classList.remove('active');
    });
    var $active = _.find($cats, function($cat){
      return ctx.state.path == $cat.getAttribute('href');
    });
    $active.classList.add('active');
    $loading[0].style.display = 'none';
  });
}

function bindCloseEventToModal(){
  if( !$('.modal').length ) return;
  // jQuery(document).on('touchend click', function(e){
  document.body.addEventListener('click', function(e){
    if( e.target.classList.contains('content') ) {
      var $modal = e.target.parentNode;
      $modal.classList.remove('active');
    }
  })
}

function toggleLike(){
  if( !$('.toggle-like').length ) return;
  document.body.addEventListener('click', function(e){
    if( e.target.classList.contains('toggle-like') ) {
      // e.stopPropagation();
      var $heart = e.target;
      while( !$heart.matches('.toggle-like') ){
        $heart = $heart.parentNode;
      }

      // get card
      var $card =  e.target;
      while( !$card.matches('[data-Member_Id]') ){
        $card = $card.parentNode;
      }

      var data = {
        MemberId: $card.dataset.member_id,
        ClassId: $card.dataset.classid,
        IsLike: !$heart.matches('.liked')
      }
      post(ENV.host + '/api/likeclass', data, function(fb){
        if(!fb)return;
        $heart.classList.toggle('liked');
      })

    }
  });
}

function addBulletsWeget(){
  if( !document.getElementById('mySlider') ) return;
  // make bullet live
  var len = $('#mySlider .slide').length;
  var bulletsStr = "";
  var $bulletsContainer = $('#bullets ul')[0];
  var slide = function(event){
    var curr = event.detail.slideNumber;
    var $active = $("#bullets .active")[0];
    var $next = $('#bullets li')[curr];
    $active.classList.remove('active');
    $next.classList.add('active');
  }
  $('#mySlider')[0].addEventListener('slide', slide);

  // add html
  for(var i=0;i<len;i++){
    if(i === 0) {
      bulletsStr += "<li class='active'></li>\n";
    } else{
      bulletsStr += "<li></li>\n";
    }
  }
  $bulletsContainer.innerHTML = bulletsStr;
}

function affix(){
  var $searchCat = document.getElementById('search-cat');
  var $wrap = jQuery('.search-cat-wrap');
  var offTop = $searchCat.offsetTop;
  var toLeft;

  $('.content')[0].onscroll = function (event) {
    if( this.scrollTop >= offTop ){
      $wrap.addClass('affix');

      // to left as the same after append
      toLeft = jQuery('.search-cat-wrap .inner')[0].scrollLeft;
      if( !jQuery('body > .search-cat-wrap').length ) $wrap.detach().appendTo( 'body' );
      jQuery('.search-cat-wrap .inner')[0].scrollLeft = toLeft;
    } else{
      $wrap.removeClass('affix')

      // to left as the same after append
      toLeft = jQuery('.search-cat-wrap .inner')[0].scrollLeft;
      if( jQuery('body > .search-cat-wrap').length ) $wrap.detach().appendTo( $searchCat );
      jQuery('.search-cat-wrap .inner')[0].scrollLeft = toLeft;
    }
  }
}

function removeTrashes(){
  var $trashes = $('body > .toBeRemoved');
  var len = $trashes.length;
  if(!len) return;
  while(len--){
    document.body.removeChild( $trashes[len] );
  }
}

function hackForModals(){
  // hack for: all modals append to body
  if( $('.content .modal').length ){

    var $modals = $('.content .modal');
    var modalsLen = $modals.length;
    while(modalsLen--){
      document.body.appendChild( $modals[modalsLen] );
    }
  }
}

function getChatDetail(uid, fid){
  var url = ENV.host + '/api/chat/' + uid + '?contact=' + fid;
  var $container = $('.chat-content');
  var tpl = $('#chat-detail-tpl')[0].innerHTML;
  get(url, function(fb){
    if( !_.isArray(fb) ) return;

    // insert html
    $container[0].innerHTML = _.template(tpl, {items: fb, uid: uid});
  });
}

function chatForm(){
  var $form = $('#form-write');
  var $input =  $form[0].querySelector('textarea');
  $form[0].on('submit', function(event){
    event.preventDefault();
    var data = {
      FromId: 1,
      ToId: 7,
      MessageText: $input.value
    };
    post(ENV.host + '/api/chat', data, function(fb){
      if( !_.isNumber(fb) ) return;
      $('.chat-content')[0].insertAdjacentHTML( 'beforeend',
        _.template($('#chat-detail-tpl')[0].innerHTML, {item: data}) );
      $input.value = '';
      $input.focus();

      // scroll to newest msg
      $('.content')[0].scrollTop = 1000000;
    });

  });
}

function privateMsgForm(){
  var $modal = $('#privateMsg');
  if( !$modal.length ) return;
  var $form = $modal[0].querySelectorAll('form');
  var $input = $form[0].querySelector('textarea');
  $form[0].on('submit', function(event){
    event.preventDefault();
    var data = {
      FromId: 1,
      ToId: 7,
      CommentText: $input.value
    };
    post(ENV.host + '/api/chat', data, function(fb){
      // if( !_.isNumber(fb) ) return;
    });
    $modal[0].style.display = 'none';

  });
}

function reservationForm(){
  var $modal = $('#reservation');
  if( !$modal.length ) return;
  var $form = $modal[0].querySelectorAll('form');
  var $input = $form[0].querySelector('textarea');
  $form[0].on('submit', function(event){
    event.preventDefault();
    var data = {
      MemberId: 1,
      ClassId: 7,
      BookDate: this.date.value,
      Remark: this.message.value,
      Name: this.name.value,
    };
    post(ENV.host + '/api/Order', data, function(fb){
      if( !fb ) return;
    });
    $modal[0].style.display = 'none';

  });
}

function commentForm(){
  var $form = $('#comment-form');
  var $input = $form[0].querySelector('input');
  $form[0].on('submit', function(event){
    event.preventDefault();
    var data = {
      MemberId: 1,
      ClassId: 7,
      CommentText: $input.value
    };
    post(ENV.host + '/api/comment', data, function(fb){
      if( !_.isNumber(fb) ) return;
      $('.comment-text')[0].insertAdjacentHTML( 'beforeend',
        _.template($('#comment-tpl')[0].innerHTML, {item: data}) );
      $input.value = '';
      $input.focus();
    });

  });
}

function followMember(){
  if( !$('.follow').length ) return;
  [].forEach.call($('.follow'), function(el) {
    el.on('click', function(event){
      event.preventDefault();
      var self = this;
      var isFollow = self.classList.contains( 'btn-olive' );
      var data = {
        MemberId: 1,
        FollowingId: 7,
        IsFollow: isFollow
      };
        self.classList[ isFollow ? 'add' : 'remove' ]('btn-grey');
        self.classList[ !isFollow ? 'add' : 'remove' ]('btn-olive');
      // post(ENV.host + '/api/followmember', data, function(fb){
      // });

    })
  })
}

function showRangeVal( el ){
  var val = el.value;
  jQuery(el).siblings('.num')
    .text(val)
    .css({
      left: val + '%',
      marginLeft: -val*30*0.01 + 'px'
    })
}

function customRadio(){
  $('.custom-radio input[type=radio]').on('change', function(){
    var $icon = this.parentNode.querySelector('.icon');
    [].forEach.call($('.custom-radio .icon'), function(el) {
      el.classList.remove('selected');
    })
    $icon.classList.add('selected');
  })
}

function limitedText(){
  var $textarea = $('.limitedText textarea')[0];
  var $num = $('.limitedText .warning span')[0];
  var $nextBtn = $('.main .next')[0];
  var changeNum = function(){
    var len = this.value.length
    if(len < 100){
      $num.innerHTML = 100 - len;
    } else{
      $num.innerHTML = 0;
    }
  }
  $textarea.on('change', changeNum);
  $textarea.on('keyup', changeNum);
}

function checkAllFillIn(){
  var $form = $('.step-2 form')[0];
  var $nextBtn = $('.step-2 .main .next')[0];
  var checkInputs = function(){
    var ifAllFillIn = $('input[type="radio"]:checked').length && 
                      $form.courseName.value && 
                      $form.highlight.value &&
                      $form.intro.value.length >= 100 ? true : false;
    $nextBtn.classList[ifAllFillIn ? 'remove' : 'add']('disabled');
  }
  $('.custom-radio input[name=level]').on('change', checkInputs);
  $('input[name=courseName]').on('change', checkInputs);
  $('textarea[name=highlight]').on('change', checkInputs);
  $('textarea[name=intro]').on('change', checkInputs);
}

function chooseImage(){
  var $uploader = $('.course input[type=file]')[0];
  $uploader.on('change', function(){
    var oFReader = new FileReader();
    oFReader.readAsDataURL(this.files[0]);
    oFReader.onload = function (oFREvent) {
      $('.cover-holder')[0].innerHTML = '<img src="' + oFREvent.target.result + '" />'
      $('.step-name')[0].style.display = 'none';
      [].forEach.call($('.right .btn'), function(el) {
        el.classList.remove('disabled');
      });
      $('.right .btn')[1].classList.add('border-none');
      $('.right .btn')[1].classList.add('btn-olive');
      $('h3')[0].innerHTML = '内容已填完并被保存';
    };
  });
}

function checkAllFillInPrivate(){
  var $form = $('form')[0];
  var $btn1 = $('.main .right .btn')[0];
  var $btn2 = $('.main .right .btn')[1];
  var checkInputs = function(){
    var ifAllFillIn = $form.sex.value && 
                      $form.realname.value && 
                      $form.city.value &&
                      $form.introSelf.value ? true : false;
    $btn1.classList[ifAllFillIn ? 'remove' : 'add']('disabled');
    $btn2.classList[ifAllFillIn ? 'remove' : 'add']('disabled');
    $btn2.classList[ifAllFillIn ? 'add' : 'remove']('border-none');
    $btn2.classList[ifAllFillIn ? 'add' : 'remove']('btn-olive');
  };
  [].forEach.call( $('.custom-radio input[type=radio], input[name=realname],' + 
    'input[name=city], textarea[name=introSelf]'), 
    function (el) {
      el.on('change', checkInputs);
      el.on('keyup', checkInputs);
    }
  );
}

function confirmManage(){
  [].forEach.call( $('.confirm'), function (el) {
    el.on('click', function(){
      if( el.classList.contains('confirm-refuse-reserve') ){
      } else if(el.classList.contains('content')){

      }
      if (window.confirm("拒绝订课?")) { 
        toDidabledState(el);
      }
    })
  });
}

function toDidabledState(el){
  var $card = closestParent(el, '.card');
  var  $tpl= $('#teaching-disabled-tpl')[0].innerHTML;
  $tpl = _.template($tpl, {person: $card.dataset});
  $card.outerHTML = $tpl;
}

function toAcceptedState($card){
  var  $tpl= $('#teaching-accepted-tpl')[0].innerHTML;
  $tpl = _.template($tpl, {person: $card.dataset});
  $card.outerHTML = $tpl;
}

function PreviewImage() {
  var oFReader = new FileReader();
  oFReader.readAsDataURL(document.getElementById("uploadImage").files[0]);

  oFReader.onload = function (oFREvent) {
    document.getElementById("uploadPreview").src = oFREvent.target.result;
  };
};

// var courses = [
//   {
//     "ClassId": 736,
//     "IsLike": false,
//     "Member_Id": 1192,
//     "Cover": "/0/class/c_736_141024060947.jpg",
//     "Name": "Aki",
//     "CityId": 1,
//     "PosX": 121.480153,
//     "PosY": 31.207886,
//     "Title": "想脱单？首先认识你自己！",
//     "LikeNum": 5,
//     "Level": 2,
//     "Avatar": "/0/profile/m_1192.jpg",
//     "ReviewNum": 2,
//     "ClassNum": 0
//   },
//   {
//     "ClassId": 25,
//     "IsLike": false,
//     "Member_Id": 16,
//     "Cover": "/0/class/c_25_141224062320.jpg",
//     "Name": "邵杰",
//     "CityId": 1,
//     "PosX": 121.51369,
//     "PosY": 31.306264,
//     "Title": "零起点德语",
//     "LikeNum": 3,
//     "Level": 1,
//     "Avatar": "/0/profile/m_16.jpg",
//     "ReviewNum": 1,
//     "ClassNum": 0
//   }
// ];


