var $ = document.querySelectorAll.bind(document);
Element.prototype.on = Element.prototype.addEventListener;
NodeList.prototype.on = function (event, fn) {
  []['forEach'].call(this, function (el) {
    el.on(event, fn);
  });
  return this;
};

var checkPage = function(){
  if( document.getElementById('mySlider') ) {
    addBulletsWeget();
  }

  removeTrashes();
  hackForModals();
  
  // course search
  if( document.getElementById('course-search') ){
    getCourses();
    affix();

    var $heart = $('.icon-heart')
    toggleLike( $heart );
  }

  // course page
  if( $('.course-page').length ){

    // go for comment
    $('.goto').on('click', function(event){
      event.preventDefault();
      location.href = '#' + this.dataset.for;
    });

    var $sideItem = $('.side-item')[0]
    $sideItem.on('click', function(){
      console.log(' $sideItem')
      return false;
    })

    var $heart = $('.icon-heart')
    toggleLike( $heart );


  }

  // chat page
  if( $('.chat-page').length ){
    jQuery('#write-box').textareaAutoSize();
  }

};

// start here
checkPage();
window.addEventListener('push', checkPage);

function getCourses(){
  // search cat
  var $list = $('#search-cat a');
  $list.on('click', function(){
    [].forEach.call($list, function (el) {
      el.classList.remove('active');
    });
    this.classList.add('active');
  });

}

function toggleLike( el ){
  el.on('click', function(){
    this.classList.toggle('liked');
  });
}

function addBulletsWeget(){
  // make bullet live
  var len = $('#mySlider .slide').length;
  var bulletsStr = "";
  var $bulletsContainer = $('#bullets ul')[0];
  var slide = function(event){
    console.log(event.detail.slideNumber);
    var curr = event.detail.slideNumber;
    var $active = $bulletsContainer.querySelector(".active");
    var $next = $bulletsContainer.querySelectorAll('li')[curr];
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
  var $wrap = $searchCat.querySelector('.search-cat-wrap')
  var offTop = $searchCat.offsetTop
  var $content = $('.content')[0]
  $content.onscroll = function (event) {
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
