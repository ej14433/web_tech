"use strict"

function readmore(id) {
  var section = document.getElementById(id).parentElement;
  var sections = document.getElementsByClassName("box");

  if (section.style.gridColumn == 'span 2 / auto') {
    section.style.gridColumn = 'span 1 / auto';

  }

  else {

    for(var i = 0; i < sections.length; i++) {
      sections[i].style.gridColumn = 'span 1 / auto';
    }

    section.style.gridColumn = 'span 2 / auto';
  }
}
