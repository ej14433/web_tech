"use strict"

function readmore(id) {
  var section   = document.getElementById(id).parentElement;
  var hidden    = (section.getElementsByClassName('more'))[0];
  var a         = (section.getElementsByTagName('a'))[0];
  var sections  = document.getElementsByClassName('box');
  var hiddens   = document.getElementsByClassName('more');
  var as        = document.getElementsByClassName('readmore-a');
  var x         = window.matchMedia('(min-width: 921px)');
  if(x.matches) {

    if (section.style.gridColumn == 'span 2 / auto') {
      section.style.gridColumn = 'span 1 / auto';
      hidden.style.display = 'none';
      a.innerText = 'Read More';


    } else {

      for(var i = 0; i < sections.length; i++) {
        sections[i].style.gridColumn = 'span 1 / auto';
      }
      for(var i = 0; i < hiddens.length; i++) {
        hiddens[i].style.display = 'none';
      }
      for (var i = 0; i < as.length; i++) {
        as[i].innerText = 'Read More';
      }
      hidden.style.display = 'inherit';
      section.style.gridColumn = 'span 2 / auto';
      a.innerText = 'Read Less';
      //section.style.gridRow = 'span 1 / 3';


    }

  } else {
    if(hidden.style.display == 'inherit') {
      hidden.style.display = 'none';
      a.innerText = 'Read More';
    } else {
      section.style.gridColumn = 'span 3 / auto';
      hidden.style.display = 'inherit';
      a.innerText = 'Read Less';
    }
  }

}

function choice(id){
  var button  = document.getElementById(id);
  var contact = document.getElementById('contact');
  var review  = document.getElementById('review');

  if(button.id == 'review-button') {
    review.style.display = 'inherit';
    contact.style.display = 'none';

  }
  if(button.id == 'contact-button') {
    contact.style.display = 'inherit';
    review.style.display = 'none';
  }
}
