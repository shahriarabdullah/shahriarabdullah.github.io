var button = document.getElementById('hamburger-menu'),
    span = button.getElementsByTagName('span')[0];

button.onclick =  function() {
  span.classList.toggle('hamburger-menu-button-close');
};

 if($(window).width()>=768){
document.getElementById("ham-navigation").className += " on";
}

$(window).resize(function() {

  if($(window).width()<768){
    document.getElementById("ham-navigation").classList.remove("on");


} else if(document.getElementById("ham-navigation").classList.contains(" on")){



} else {
  document.getElementById("ham-navigation").className += " on";
}
});

$('#hamburger-menu').on('click', toggleOnClass);

function toggleOnClass(event) {
  var toggleElementId = '#' + $(this).data('toggle'),
  element = $(toggleElementId);

  element.toggleClass('on');

}

// close hamburger menu after click a
$( '.menu li a' ).on("click", function(){
  $('#hamburger-menu').click();
});

$("#phone").on('click', function(event) {
    alert("Why do you expect my contact number to be publicly available? :p");
});
