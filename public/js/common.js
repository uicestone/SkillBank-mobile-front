Element.prototype.on = Element.prototype.addEventListener;
NodeList.prototype.on = function (event, fn) {
  []['forEach'].call(this, function (el) {
    el.on(event, fn);
  });
  return this;
};


function addBulletsWeget(){
  // make bullet live
  var len = document.querySelectorAll('#mySlider .slide').length;
  var bulletsStr = "";
  var $bulletsContainer = document.querySelector('#bullets ul');
  var slide = function(event){
    console.log(event.detail.slideNumber);
    var curr = event.detail.slideNumber;
    var $active = $bulletsContainer.querySelector(".active");
    var $next = $bulletsContainer.querySelectorAll('li')[curr];
    $active.classList.remove('active');
    $next.classList.add('active');
  }
  document.querySelector('#mySlider').addEventListener('slide', slide);

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

}

var checkPage = function(){
  if( document.getElementById('mySlider') ) {
    addBulletsWeget();
  }

  // hack for: all modals append to body
  if( document.querySelector('.content .modal') ){

    var $modals = document.querySelectorAll('.content .modal');
    var modalsLen = $modals.length;
    while(modalsLen--){
      document.body.appendChild( $modals[modalsLen] );
    }
  }
  
  // course search
  if( document.getElementById('course-search') ){
    var $serchCat = document.getElementById('search-cat');
    var $courseList = document.querySelector('div.course-list');


    // search cat
    var $allATag = $serchCat.querySelectorAll('a');
    $allATag.on('click', function(){
      var allATag = 
      this.classList.toggle('liked');
    });

    // affix($serchCat);
    $courseList.querySelectorAll('.icon-heart').on('click', function(){
      this.classList.toggle('liked');
    });
  }

  // course page
  if( document.querySelector('.course-page') ){

    // go for comment
    document.querySelectorAll('.goto').on('click', function(event){
      event.preventDefault();
      location.href = '#' + this.dataset.for;
    });
  }

// end of checkPage 
};

checkPage();
window.addEventListener('push', checkPage);
