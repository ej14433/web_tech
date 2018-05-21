'use strict';
const validate = require('./validation.js');
const views    = require('./views.js'     );
const req      = require('./request.js'   );
const user     = require('./user.js'      );
const message  = require('./message.js'   );
const searchjs = require('./search.js'    );
const review   = require('./review.js'    );

window.addEventListener('load', function (e) {

  var bookings        = document.getElementById('bookings'              );
  var register        = document.getElementById('register'              );
  var search          = document.getElementById('search'                );
  var signin          = document.getElementById('signin'                );
  var registerButton  = document.getElementById('register-button'       );
  var loginButton     = document.getElementById('login-button'          );
  var lost            = document.getElementById('lost'                  );
  var lostSignIn      = document.getElementById('lost-signin'           );
  var reset           = document.getElementById('reset-password'        );
  var finishReset     = document.getElementById('reset-account-password');
  var bookButton      = document.getElementById('book-trip'             );
  var myBookings      = document.getElementById('my-bookings'           );
  var readMores       = document.querySelectorAll('.read-more-button'   );
  var logOut          = document.getElementById('log-out'               );
  var forms           = document.querySelectorAll('form'                );
  var reviewButton    = document.querySelector('#review-submit'         );
  var reviewsContainter = document.querySelector('.reviews-container'   );
  var updateDetails   = document.querySelector('.update'         );

  if(bookings) {
    views.populateBookings();
    views.populateAccount();
    updateDetails.addEventListener('click', user.update);
  }

  if(reviewButton) {
    reviewButton.addEventListener(  'click', review.submit       );
  }

  if(logOut) {
    logOut.addEventListener(          'click', user.logOut         );
    var request = req.get('/issignedin');
    request.onreadystatechange = function() {
      if(request.readyState == XMLHttpRequest.DONE) {
        if(request.response == 'yes') {
          views.signedIn();
        }
        if(request.response == 'no') {
          views.signOut();
        }
      }
    }
  }

  if(search) {
    register.addEventListener(      'click', views.register      );
    loginButton.addEventListener(   'click', user.loginUser      );
    signin.addEventListener(        'click', views.signin        );
    registerButton.addEventListener('click', user.registerNewUser);
    lost.addEventListener(          'click', views.lost          );
    lostSignIn.addEventListener(    'click', views.signin        );
    search.addEventListener(        'click', searchjs.available  );
    reset.addEventListener(         'click', user.resetPassword  );
    bookButton.addEventListener(    'click', searchjs.create     );
    readMores.forEach(readMore => readMore.addEventListener('click', views.readMore));
    forms.forEach(form => form.addEventListener('keyup', keyPress));
    review.populate();

  }

  if(finishReset) {
    finishReset.addEventListener(   'click', user.newPassword);
  }
});

function keyPress(e){
  switch(e.keyCode) {
    case 13:
      parent = e.target.parentElement;
      if(parent.id == 'signin-form') {
        user.loginUser();
      }
      break;
  }
}
