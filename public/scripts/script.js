// responsive navbar function
function responsiveNavbar() {
  var x = document.getElementById("myTopnav");
  if (x.className === "topnav") {
    x.className += " responsive";
  } else {
    x.className = "topnav";
  }
}

// initialize aos library for onscroll animations
AOS.init();

// background of navbar on scroll
$(document).scroll(function () {
  var $nav = $(".topnav");
  $nav.toggleClass('scrolled', $(this).scrollTop() > $nav.height());
});

// typing effect

const textToType = document.querySelector(".typed-text");
const cursorC = document.querySelector(".cursor");

const textArray = ["Health", "Fitness", "Brain", "Lifestyle"];
let textArrayIndex = 0;
let character = 0;

function type() {
  if (character < textArray[textArrayIndex].length) {
    if(!cursorC.classList.contains("typing")) cursorC.classList.add("typing");
    textToType.textContent += textArray[textArrayIndex].charAt(character);
    character++;
    setTimeout(type, 200);
  } 
  else {
    cursorC.classList.remove("typing");
  	setTimeout(erase, 1000);
  }
}

function erase() {
	if (character > 0) {
    if(!cursorC.classList.contains("typing")) cursorC.classList.add("typing");
    textToType.textContent = textArray[textArrayIndex].substring(0, character-1);
    character--;
    setTimeout(erase, 100);
  } 
  else {
    cursorC.classList.remove("typing");
    textArrayIndex++;
    if(textArrayIndex>=textArray.length) textArrayIndex=0;
    setTimeout(type, 1200);
  }
}

document.addEventListener("DOMContentLoaded", function() {
  if(textArray.length){
     setTimeout(type, 2000);
  }
});

