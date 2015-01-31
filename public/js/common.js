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
    followMember();

  }

  // chat page
  if( $('.chat-page').length ){

    // get chat detail
    var uid = 1;
    var fid = location.hash.slice(1);
    // getChatDetail(uid, fid);

    // init textrea auto size
    jQuery('#write-box').textareaAutoSize();

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
    $verifyBtn.on('click', function(){
      var url = ENV.host + '/api/Validation?mobile=' + $form.phone.value;
      post(url, function(fb){
        console.log(fb);
      })
    })
  }

};

// start here
checkPage();
window.addEventListener('push', checkPage);

function switchCourseCat(){
  // search cat
  $('#search-cat a').on('click', function(){
    var self = this;
    var geo_opts = {
        enableHighAccuracy: true, 
        maximumAge        : 30000, 
        timeout           : 27000
      };

    // nearby skill
    if(this.dataset.by == 0){
      navigator.geolocation.getCurrentPosition(function (position) {
        var url = ENV.host + '/api/ClassList?' + 'by=' + self.dataset.by + '&type=' + self.dataset.type +
                  '&PosY=' + position.coords.latitude + '&PosX=' + position.coords.longitude;
        getCourses(url, self);
      }, function(){
        console.log("Sorry, no position available.")
      }, geo_opts);
    } else{
      var url = ENV.host + '/api/ClassList?' + 'by=' + self.dataset.by + '&type=' + self.dataset.type;
      getCourses(url, self);
    }

  });
}

function getCourses(url, el){
  get(url, function(fb){
    if( !_.isArray(fb) ) return;
    // insert html
    var tpl = $('#course-tpl')[0].innerHTML;
    $('.course-list')[0].innerHTML = _.template(tpl, {courses: fb, imgHost: ENV.imgHost});
    // active tab
    [].forEach.call($('#search-cat a'), function (el) {
      el.classList.remove('active');
    });
    el.classList.add('active');
  });
}

function toggleLike(){
  if( !$('.toggle-like').length ) return;
  document.body.addEventListener('click', function(e){
    if( e.target.matches('.toggle-like, .toggle-like *') ) {
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
  var $wrap = $('#search-cat .search-cat-wrap')[0]
  var offTop = $searchCat.offsetTop
  $('.content')[0].onscroll = function (event) {
    if( this.scrollTop >= offTop ){
      $wrap.classList.add('affix');
      document.body.appendChild( $wrap )
    } else{
      $wrap.classList.remove('affix')
      $searchCat.appendChild( $wrap )
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
  $('.follow')[0].on('click', function(event){
    event.preventDefault();
    var data = {
      MemberId: 1,
      FollowingId: 7,
      IsFollow: true
    };
    post(ENV.host + '/api/followmember', data, function(fb){
      console.log(fb);
    });

  })
}

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


