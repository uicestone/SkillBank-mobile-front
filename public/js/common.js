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

var checkPage = function(){
  if(document.getElementById('mySlider')) {
    addBulletsWeget();
  }
};
checkPage();

window.addEventListener('push', checkPage);
