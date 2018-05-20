'use strict'
const req      = require('./request.js');
const message  = require('./message.js');

function submit() {
  var email     = document.querySelector('#review-email'    ).value;
  var firstname = document.querySelector('#review-firstname').value;
  var lastname  = document.querySelector('#review-lastname' ).value;
  var review    = document.querySelector('#review-entry'    ).value;

  var params = `email=${email}&firstname=${firstname}&lastname=${lastname}&review=${review}`
  var url = '/review';
  var request = req.post(url);
  request.send(params)

  request.onreadystatechange = function () {
    if(request.readyState == XMLHttpRequest.DONE) {
      console.log(request.response);
    }
  }

}

function populate() {
  var reviewsElement = document.querySelector('.reviews-container');
  var request = req.get('/latestreviews');
  request.onreadystatechange = function () {
    if(request.readyState == XMLHttpRequest.DONE) {
      var reviews = JSON.parse(request.response);
      for(var i = 0; i < reviews.length; i ++) {
        var template = `
          <div class="reviews">
            <img src="./img/default.svg" alt="">
            <h2>${reviews[i].name}</h2>
            <p>${reviews[i].review}</p>
          </div>
        `;
        reviewsElement.innerHTML += template;
      }
    }
  }
}

module.exports = {
  submit : submit,
  populate : populate
}
