$(document).ready(function(){
    // COntact form handler
    var contactForm = $('.contact-form')
    var contactFormMethod = contactForm.attr('method')
    var contactFormEndpoint = contactForm.attr('action')
    

    function displaySubmitting(submitBtn, defaultText, doSubmit){
      if (doSubmit){
        submitBtn.addClass('disabled')
        submitBtn.html('<i class="fa fa-spin fa-spinner" aria-hidden="true"></i>Sending...')
      } else {
        submitBtn.removeClass('disabled')
        submitBtn.html(defaultText)
      }
    }

    contactForm.submit(function(event){
      event.preventDefault()

      var contactFormSubmitBtn = contactForm.find("[type='submit']")
      var contactFormSubmitBtnTxt = contactFormSubmitBtn.text()

      var contactFormData = contactForm.serialize()
      thisForm = $(this)
      displaySubmitting(contactFormSubmitBtn, "", true)
      $.ajax({
        method: contactFormMethod,
        url: contactFormEndpoint,
        data: contactFormData,
        success: function(data){
          thisForm[0].reset()
          alert(data.message)
          setTimeout(function(){
            displaySubmitting(contactFormSubmitBtn, contactFormSubmitBtnTxt, false)
          }, 500)
        },
        error: function(error){
          console.log(error)
          var jsonData = error.responseJSON
          var msg = ''

          $.each(jsonData, function(key, value){
            msg += key + ': ' + value[0].message + '<br/>'
          })
          alert(msg)
          setTimeout(function(){
            displaySubmitting(contactFormSubmitBtn, contactFormSubmitBtnTxt, false)
          }, 500)
        }
      })
    })



    // Seach form
    var searchForm = $('.search-form')
    var searchInput = searchForm.find("[name='q']")
    var typingTimer;
    var typingInterval = 500
    var searchBtn = searchForm.find("[type='submit']")

    searchInput.keyup(function(event){
      //key release 
      searchBtn.addClass('disabled')
      searchBtn.html('<i class="fa fa-spin fa-spinner" aria-hidden="true"></i>Searching...')
      clearTimeout(typingTimer)
      typingTimer = setTimeout(performSearch, typingInterval)
    })

    searchInput.keydown(function(event){
      //key pressed
      clearTimeout(typingTimer)
    })

    function performSearch(){
      var query = searchInput.val()
      window.location.href = '/search/?q=' + query
    }



    // Cart + Add products
    var productForm = $(".form-product-ajax")

    productForm.submit(function(event){
      event.preventDefault();
      console.log("form is not sending")
      var thisForm = $(this)
      // var actionEndpoint = thisForm.attr("action");
      var actionEndpoint = thisForm.attr("data-endpoint");
      var httpMethod = thisForm.attr("method");
      var formData = thisForm.serialize();

      $.ajax({
        url: actionEndpoint,
        method: httpMethod,
        data: formData,
        success: function(data){
          // console.log("success")
          // console.log(data)
          // console.log(data.removed)
          var submitSpan = thisForm.find(".submit-span")
          if (data.added){
            submitSpan.html('In cart <button type="submit" class="btn btn-link mt-3">Remove?</button>')
          } else {
            submitSpan.html('<button type="submit" class="btn btn-primary mt-3">Add to cart</button>')
          }
          var navbarCount = $(".navbar-cart-count")
          navbarCount.text(data.cartItemCount)
          var currentPath = window.location.href

          if (currentPath.indexOf("cart") != 1){
            updateCart()
          }
        },

        error: function(errorData){
          alert("An error occured")
          console.log("error")
          console.log(errorData)
        }
      })

    })

    function updateCart(){
      console.log("in current cart")
      var cartTable = $(".cart-table")
      var cartBody = cartTable.find(".cart-body")
      var productRows = cartBody.find(".cart-product")
      var currentUrl = window.location.href

      var refreshCartUrl = '/api/cart'
      var refreshCartMethond = 'GET'
      var data = {}

      $.ajax({
        url: refreshCartUrl,
        method: refreshCartMethond,
        data: data,
        success: function(data){
          var hiddenCartItemRemoveForm = $(".cart-item-remove-form")
          console.log("success")
          console.log(data)
          if (productRows.length > 0){
            productRows.html(" ")

            i = data.products.length
            $.each(data.products, function(index, value) {

              console.log(value)
              var newCartItemRemove = hiddenCartItemRemoveForm.clone()
              newCartItemRemove.css("display", "block")
              newCartItemRemove.find(".cart-item-product-id").val(value.id)
              cartBody.prepend("<tr><th scope=\"row\">" + i + "</th><td><a href='" + value.url + "'>" + value.name + "</a>" + newCartItemRemove.html() + "</td><td>" + value.price + "</td></tr>")
              i--
            } )
            
            cartBody.find(".cart-subtotal").text(data.subtotal)
            cartBody.find(".cart-total").text(data.total)
          } else {
            window.location.href = currentUrl
          }
          
        },
        error: function(errorData){
          console.log("error")
          console.log(errorData)
        }
      })          
    }
  })