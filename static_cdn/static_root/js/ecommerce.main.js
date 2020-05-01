$(document).ready(function(){

var stripeFormModule = $(".stripe-payment-form")
  var stripeModuleToken = stripeFormModule.attr("data-token")
  var stripeModulNextUrl = stripeFormModule.attr("data-next-url")
  var stripeModuleBtnTitle = stripeFormModule.attr("data-btn-title") || "Add card"
  var stripeTemplate = $.templates("#stripeTemplate")
  var stripeTemplateDataContext = {
    publishKey: stripeModuleToken,
    nextUrl: stripeModulNextUrl,
    btnTitle: stripeModuleBtnTitle
  }
  var stripeTemplateHtml = stripeTemplate.render(stripeTemplateDataContext)
  stripeFormModule.html(stripeTemplateHtml)

// http secure site when live

var paymentForm = $('.payment-form')
if (paymentForm.length > 1) {
    alert("Only one payment form is allowed per page")
    paymentForm.css('display', 'none')
}
else if (paymentForm.length == 1){

var pubKey = paymentForm.attr('data-token')
var nextUrl = paymentForm.attr('data-next-url')

    // Create a Stripe client.
var stripe = Stripe(pubKey);

// Create an instance of Elements.
var elements = stripe.elements();

// Custom styling can be passed to options when creating an Element.
// (Note that this demo uses a wider set of styles than the guide below.)
var style = {
  base: {
    color: '#32325d',
    fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
    fontSmoothing: 'antialiased',
    fontSize: '16px',
    '::placeholder': {
      color: '#aab7c4'
    }
  },
  invalid: {
    color: '#fa755a',
    iconColor: '#fa755a'
  }
};

// Create an instance of the card Element.
var card = elements.create('card', {style: style});

// Add an instance of the card Element into the `card-element` <div>.
card.mount('#card-element');

// Handle real-time validation errors from the card Element.
card.addEventListener('change', function(event) {
  var displayError = document.getElementById('card-errors');
  if (event.error) {
    displayError.textContent = event.error.message;
  } else {
    displayError.textContent = '';
  }
});

// Handle form submission.
// var form = document.getElementById('payment-form');
// form.addEventListener('submit', function(event) {
//   event.preventDefault();

//   var loadTime = 1000
//   var errorHtml = '<i class="fa fa-warning"></i>An error occured'
//   var errorClasses = "btn btn-danger disabled my-3"
//   var loadingHtml = '<i class="fa fa-spin fa-spinner"></i>Loading...'
//   var loadingClasses = "btn btn-success disabled my-3"

//   stripe.createToken(card).then(function(result) {
//     if (result.error) {
//       // Inform the user if there was an error.
//       var errorElement = document.getElementById('card-errors');
//       errorElement.textContent = result.error.message;
//     } else {
//       // Send the token to your server.
//       stripeTokenHandler(nextUrl, result.token);
//     }
//   });
// });

var form = $('#payment-form');
form.on('submit', function(event) {
  event.preventDefault();

  var thisForm = $(this)
  var btnLoad = thisForm.find('.btn-load')
  var loadTime = 1000
  var currentTimeout;
  var errorHtml = '<i class="fa fa-warning"></i>An error occured'
  var errorClasses = "btn btn-danger disabled my-3"
  var loadingHtml = '<i class="fa fa-spin fa-spinner"></i>Loading...'
  var loadingClasses = "btn btn-success disabled my-3"

  stripe.createToken(card).then(function(result) {
    if (result.error) {
      // Inform the user if there was an error.
      var errorElement = $('#card-errors');
      errorElement.textContent = result.error.message;
      currentTimeout = displayBtnStatus(btnLoad, errorHtml, errorClasses, 1000, currentTimeout)

    } else {
      // Send the token to your server.
      stripeTokenHandler(nextUrl, result.token);
      currentTimeout = displayBtnStatus(btnLoad, loadingHtml, loadingClasses, 2000, currentTimeout)
    }
  });
});

function displayBtnStatus(element, newHtml, newClasses, loadTime, timeout){
  if (timeout){
    clearTimeout(timeout)
  }
  if (!loadTime){
    loadTime = 1200
  }
  var defaultHtml = element.html()
  var defaultClasses = element.attr("class")
  element.html(newHtml)
  element.removeClass(defaultClasses)
  element.addClass(newClasses)
  return setTimeout(function(){
    element.html(defaultHtml)
    element.removeClass(newClasses)
    element.addClass(defaultClasses)  
  }, loadTime)
}

// Submit the form with the token ID.
function stripeTokenHandler(nextUrl, token) {
    console.log(token)
    var paymentMethodEndpoint = '/billing/payment-method/create/'
    var data = {
        'token': token.id
    }
    function redirectToNext(nextPath){
        if (nextPath){
            setTimeout(function(){
                window.location.href = nextPath
            }, 150)
        } 
    }

    $.ajax({
        data: data,
        url: paymentMethodEndpoint,
        method: "POST",
        success: function(data){
            var successMsg = "Success! your card was added"
            card.clear()
            // if (nextUrl){
            //     window.location.href = nextUrl
            //}else {
            //     window.location.reload()
            // }
            alert(successMsg)
            redirectToNext(nextUrl)
        },
        erorr: function(erorr){
            console.log(error)
        }
    })



  // Insert the token ID into the form so it gets submitted to the server
//   var form = document.getElementById('payment-form');
//   var hiddenInput = document.createElement('input');
//   hiddenInput.setAttribute('type', 'hidden');
//   hiddenInput.setAttribute('name', 'stripeToken');
//   hiddenInput.setAttribute('value', token.id);
//   form.appendChild(hiddenInput);

//   // Submit the form
//   form.submit();
}
}
    
})
