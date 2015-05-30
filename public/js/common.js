// setting
window.ENV = {
  host : 'http://www.skillbank.cn',
  imgHost : 'http://skillbank.b0.upaiyun.com'
};

var browser={
    versions:function(){
        var u = navigator.userAgent, app = navigator.appVersion;
        return {
            trident: u.indexOf('Trident') > -1, //IE内核
            presto: u.indexOf('Presto') > -1, //opera内核
            webKit: u.indexOf('AppleWebKit') > -1, //苹果、谷歌内核
            gecko: u.indexOf('Gecko') > -1 && u.indexOf('KHTML') == -1,//火狐内核
            mobile: !!u.match(/AppleWebKit.*Mobile.*/), //是否为移动终端
            ios: !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/), //ios终端
            android: u.indexOf('Android') > -1 || u.indexOf('Linux') > -1, //android终端或者uc浏览器
            iPhone: u.indexOf('iPhone') > -1 , //是否为iPhone或者QQHD浏览器
            iPad: u.indexOf('iPad') > -1, //是否iPad
            webApp: u.indexOf('Safari') == -1, //是否web应该程序，没有头部与底部
            weixin: u.indexOf('MicroMessenger') > -1, //是否微信 （2015-01-22新增）
            qq: u.match(/\sQQ/i) == " qq" //是否QQ
        };
    }(),
    language:(navigator.browserLanguage || navigator.language).toLowerCase()
};

function parseURL(url) {
  var parser = document.createElement('a'),
    searchObject = {},
    queries, split, i;
  // Let the browser do the work
  parser.href = url;
  // Convert query string to object
  queries = parser.search.replace(/^\?/, '').split('&');
  for( i = 0; i < queries.length; i++ ) {
    split = queries[i].split('=');
    searchObject[split[0]] = split[1];
  }
  return {
    protocol: parser.protocol,
    host: parser.host,
    hostname: parser.hostname,
    port: parser.port,
    pathname: parser.pathname,
    search: parser.search,
    searchObject: searchObject,
    hash: parser.hash
  };
}

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

var scrollToPrevPos = _.once(function(){
  if(window.history.state && window.history.state.top){
    var offsetTop = window.history.state.top;
    $('.content')[0].scrollTop = offsetTop;
    if( location.hash.slice(1) ) window.history.replaceState(null);
  }
});



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
  fixedPositionBug();

  // course search
  if( document.getElementById('course-search') ){

    // record scrollTop when go to other url
    window.onunload = function(){window.history.pushState({top: $('.content')[0].scrollTop}, 'toTop');};
    if(!location.hash.slice(1)) scrollToPrevPos();

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
    });

    $('#write-box')[0].on('change', function(event){
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
  if( $('.post-course-page.step-1').length ) {
    bindHashChangeToSteps();
    selectSkill();
    checkAllFillInStep1();
    customRange();

    $('.step-1 .btn.next').on('click', function(){
      myAlert('哈哈', 2);
    });
  }
  
  // add course page 2
  if( $('.post-course-page.step-2').length ) {
    limitedText();
    checkAllFillIn();
  } 
  
  // add course page 3
  if( $('.post-course-page.step-3').length ) {
    chooseCover();
  } 
  
  // add course page private
  if( $('.post-course-page.step-private').length ) {
    checkAllFillInPrivate();
    chooseAvatar();
    uploadAvatar();
  } 

  // course manage 
  if( $('.courses-manage-page').length ) {
    confirmManage();
    checkAllEvaluateModal();

    // reservation modal
    $('#contact.modal .accept-reserve').on('click', function(){
      $('#contact')[0].classList.remove('active');
      toAcceptedState($('.teaching.active')[0]);
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

function bindHashChangeToSteps(){
  var changeContent = function(){
    console.log(location.hash);
    var stepName = location.hash.slice(1);
    if(!stepName) return;
    $('.steps.active')[0].classList.remove('active');
    $('.content.active')[0].classList.remove('active');
    $('.steps.step-' + stepName)[0].classList.add('active');
    $('.content.step-' + stepName)[0].classList.add('active');
  }
  changeContent();
  window.onhashchange = changeContent;
}

function switchCourseCat(){
  var load = function(){
    if(!location.hash.slice(1)) return;
    var query = parseURL(location.hash.slice(1)).searchObject;
    var self = this;
    var geo_opts = {
      enableHighAccuracy: true, 
      maximumAge        : 30000, 
      timeout           : 27000
    };

    

    // nearby skill
    if(query.by == 0){
      navigator.geolocation.getCurrentPosition(function (position) {
        var url = ENV.host + '/api/ClassList?' + 'by=' + query.by + '&type=' + query.type +
                  '&PosY=' + position.coords.latitude + '&PosX=' + position.coords.longitude;
        getCourses(url);
      }, function(){
        console.log("Sorry, no position available.")
      }, geo_opts);
    } else if(query.by){
      var url = ENV.host + '/api/ClassList?' + 'by=' + query.by + '&type=' + query.type;
      getCourses(url);
    }
  };

  load();
  window.onhashchange = load;
}

function getCourses(url){
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
      return location.hash == $cat.getAttribute('href');
    });
    $active.classList.add('active');
    $loading[0].style.display = 'none';
    scrollToPrevPos();
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

    // textarea style to origin
    $input.value = '';
    $input.style.height = 'auto';

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
      if($('.setting-fans-page').length){
        var text = isFollow ? '取关' : '关注';
        self.innerHTML = text;
      }
    })
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

function checkAllFillInStep1(){
  var $form = $('.step-1 form')[0];
  var $nextBtn = $('.step-1 .main .next')[0];
  var checkInputs = function(){
    var ifAllFillIn = $form.city.value && 
                      $form['skill-cat'].value &&
                      $form['skill-sub-cat'].value;
    $nextBtn.classList[ifAllFillIn ? 'remove' : 'add']('disabled');
  };
  [].forEach.call( $('.step-1 input[name=city], .step-1 select[name=skill-cat], .step-1 select[name=skill-sub-cat]'), 
    function (el) {
      el.on('change', checkInputs);
      el.on('keyup', checkInputs);
    }
  );

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
  };
  [].forEach.call( $('.custom-radio input[type=radio], input[name=courseName],' + 
    'textarea[name=highlight], textarea[name=intro]'), 
    function (el) {
      el.on('change', checkInputs);
      el.on('keyup', checkInputs);
    }
  );

}

function checkAllEvaluateModal(){
  var $form = $('#evaluate form')[0];
  $('#evaluate .btn-evaluate')[0].on('click', function(){
    if( $('#evaluate input[type="radio"]:checked').length && $form.message.value){
      $('#evaluate')[0].classList.remove('active');
      toDidabledState($('.teaching.active')[0]);
    }             
  });
}

function chooseCover(){
  var $uploader = $('.course input[type=file]')[0];
  $uploader.on('change', function(){
    if(!this.files[0]) return;
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

function chooseAvatar(){
  var $uploader = $('.edit-avatar input[type=file]')[0];
  $uploader.on('change', function(){
    if(!this.files[0]) return;
    var oFReader = new FileReader();
    oFReader.readAsDataURL(this.files[0]);
    oFReader.onload = function (oFREvent) {
      $('.avatar-upload-group')[0].style['background-image'] = 'url(' + oFREvent.target.result + ')';
      [].forEach.call($('.right .btn'), function(el) {
        el.classList.remove('disabled');
      });
      $('.right .btn')[1].classList.add('border-none');
      $('.right .btn')[1].classList.add('btn-olive');
    };
  });
}

function checkAllFillInPrivate(){
  var $form = $('form')[0];
  var $btn1 = $('.main .right .btn')[0];
  var $btn2 = $('.main .right .btn')[1];
  var checkInputs = function(){
    var ifAllFillIn = $('input[type="radio"]:checked').length && 
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
        if (window.confirm("拒绝订课?")) toDidabledState(el);
      } else if( el.classList.contains('content') ){
      } else if( el.classList.contains('refuse-draw-back') ){
        if (window.confirm("拒绝退币?")) toDidabledState(el);
      } else if( el.classList.contains('accept-draw-back') ){
        if (window.confirm("接受退币?")) toDidabledState(el);
      } else {
        if (window.confirm("拒绝订课?")) toDidabledState(el);
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
}

function selectSkill(){
  var allSkills = [
    {
      name: '语言类',
      list: ['英语', '法语', '德语', '日语']
    },
    {
      name: '设计类',
      list: ['油画', '平面', '建筑']
    }
  ];
  var allSkillsNameArr = _.map(allSkills, function(obj){return obj.name; });
  var options_tpl = 
    '<% _.forEach(list, function(name, i) { %>' +
      '<option value="<%- i %>" > <%- name %> </option>' +
    '<% }); %>';
  var provinceOptions = _.template(options_tpl, {list: allSkillsNameArr});
  var $skillCat = $('#skill-cat')[0];
  var $skillSubCat = $('#skill-sub-cat')[0];
  function renderSubCat(subCats){
    var citiesOptions = _.template(options_tpl, {list: subCats});
    $skillSubCat.innerHTML = citiesOptions;
    // jQuery('#skill-sub-cat').html(citiesOptions);
  }
  $skillCat.insertAdjacentHTML('beforeend', provinceOptions);
  // jQuery('#skill-cat').append(provinceOptions);
  $skillCat.on('change', function(){
    renderSubCat(allSkills[this.value]['list']);
    this.classList.remove('lighterOlive');
    $('#skill-sub-cat-wrapper')[0].classList.remove('hide');
  });
}

function fixedPositionBug(){
  if(browser.versions.iPhone || browser.versions.iPad){
    [].forEach.call($('textarea,input,select'), function (el) {
      el.on('focus', function(){
        [].forEach.call($('.bar'), function(el){
          el.style.position = 'absolute';
        });
      });
      el.on('blur', function(){
        [].forEach.call($('.bar'), function(el){
          el.style.position = '';
        });
      });
    });
  }
}

function myAlert(msg, seconds){
  var $warning = $('.my-alert')[0];
  var $inner = $('.my-alert .inner')[0];
  seconds = seconds ? seconds : 2; 
  $inner.innerHTML = msg;
  $warning.style.display = 'block';
  var t = setTimeout(function(){
    $warning.style.display = '';
  }, seconds * 1000)
}


// 示例
function uploadAvatar(){
  $('.btn-uploader')[0].on('click', function(){
    $input = $('.edit-avatar input[type=file]')[0];
    if(!$input.files.length) return;
    uploadFile($input, '/API/UploadAvatar', function(data){
      console.log(data);
    });
  });
}

function uploadFile(input, url, callback){
  var xhr = new XMLHttpRequest();
  var formData = new FormData();
  var file = input.files[0];
  formData.append('file', file);
  xhr.open('POST', url);
  xhr.onload = function () {
    callback(JSON.parse(xhr.response));
  };
  xhr.send(formData);
}

function customRange(){
  var $range = $('.custom-range');
  if( !$range.length ) return;

  var bodyW = $('body')[0].clientWidth;
  
  [].forEach.call($range, function (elRange) {
    // init value
    updateHandlePos( elRange );

    var calRangeHandle = calRangeVal(elRange, bodyW);
    elRange.on('touchend', calRangeHandle);
    elRange.on('touchmove', calRangeHandle);
  });
}

function updateHandlePos( elRange ){
  var $handle = elRange.querySelector('.handle');
  var value = $handle.innerHTML;
  $handle.style.left = value + '%';
  $handle.style.marginLeft = -value*30*0.01 + 'px';
}

function calRangeVal (elRange, bodyW){
  return function(e){
    var x = e.changedTouches[0].pageX;
    if(x<35) x = 35;
    if(x>(bodyW-35)) x = bodyW - 35;
    var val = ((x-35)*100/(bodyW - 35*2)).toFixed();
    elRange.querySelector('.handle').innerHTML = val;
    updateHandlePos( elRange );
    alert(!touch)
    if (touch.x2 && Math.abs(touch.x1 - touch.x2) > 10){
      e.preventDefault()
    }
  }
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


