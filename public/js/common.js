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
var get = request.bind(this, 'GET');
var post = request.bind(this, 'POST');


var checkPage = function(){

  addBulletsWeget();
  toggleLike();
  removeTrashes();
  hackForModals();

  // course search
  if( document.getElementById('course-search') ){
    getCourses();
    affix();



  }

  // course page
  if( $('.course-page').length ){

    // go for comment
    $('.goto').on('click', function(event){
      event.preventDefault();
      location.href = '#' + this.dataset.for;
    });



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
    msgForm();

  }

};

// start here
checkPage();
window.addEventListener('push', checkPage);

function getCourses(){
  var $container = $('.course-list');

  var courses = [
    {
      "ClassId": 736,
      "IsLike": false,
      "Member_Id": 1192,
      "Cover": "/0/class/c_736_141024060947.jpg",
      "Name": "Aki",
      "CityId": 1,
      "PosX": 121.480153,
      "PosY": 31.207886,
      "Title": "想脱单？首先认识你自己！",
      "LikeNum": 5,
      "Level": 2,
      "Avatar": "/0/profile/m_1192.jpg",
      "ReviewNum": 2,
      "ClassNum": 0
    },
    {
      "ClassId": 25,
      "IsLike": false,
      "Member_Id": 16,
      "Cover": "/0/class/c_25_141224062320.jpg",
      "Name": "邵杰",
      "CityId": 1,
      "PosX": 121.51369,
      "PosY": 31.306264,
      "Title": "零起点德语",
      "LikeNum": 3,
      "Level": 1,
      "Avatar": "/0/profile/m_16.jpg",
      "ReviewNum": 1,
      "ClassNum": 0
    }
  ];

  var tpl = $('#course-tpl')[0].innerHTML;
  // search cat
  var $list = $('#search-cat a');
  $list.on('click', function(){
    var self = this;
    var url = ENV.host + '/api/ClassList?' + 'by=' + this.dataset.by + '&type=' + this.dataset.type;
    get(url, function(fb){
      if( !_.isArray(fb) ) return;

      // insert html
      $container[0].innerHTML = _.template(tpl, {courses: fb, imgHost: ENV.imgHost});

      // active tab
      [].forEach.call($list, function (el) {
        el.classList.remove('active');
      });
      self.classList.add('active');
    });
  });
}

function toggleLike(){
  if( !$('.toggle-like').length ) return;
  document.body.addEventListener('touchend', function(e){
    if( e.target.matches('.toggle-like, .toggle-like *') ) {
      // e.stopPropagation();
      var $heart = e.target;
      while( !$heart.matches('.toggle-like') ){
        $heart = $heart.parentNode;
      }
      $heart.classList.toggle('liked');
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

function request(type, url, opts, callback) {
  var xhr = new XMLHttpRequest();
  if (typeof opts === 'function') {
    callback = opts;
    opts = null;
  }
  xhr.open(type, url);
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

function msgForm(){
  var $form = $('#form-write');
  var $container = $('.chat-content');
  var tpl = $('#chat-detail-tpl')[0].innerHTML;
  var $textarea =  $form[0].querySelector('textarea');
  $form[0].on('submit', function(event){
    event.preventDefault();
    var url = ENV.host + '/api/chat';
    var data = {
      FromId: 1,
      ToId: 7,
      MessageText: $textarea.value
    };
    post(url, data, function(fb){
      if( !_.isNumber(fb) ) return;
      // $container[0].appendChild( _.template(tpl, {item: data}) );
      $container[0].insertAdjacentHTML( 'beforeend', _.template(tpl, {item: data}) );
      $textarea.value = '';
      $textarea.focus();
    });

  });
}
