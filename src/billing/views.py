from django.shortcuts import redirect, render
from django.utils.http import is_safe_url
from django.conf import settings
# Create your views here.

import stripe
from django.http import HttpResponse, JsonResponse
from .models import BillingProfile, Card

STRIPE_SECRET_KEY = getattr(settings, 'STRIPE_SECRET_KEY', 'sk_test_u7cis2zbqN2oQmy7SflQuu1X00iCYdUUXf')
STRIPE_PUB_KEY = getattr(settings, 'STRIPE_PUB_KEY', 'pk_test_W1bM1qmnrcOQ780IojSHaUcY00AOjvrMTI')
stripe.api_key = STRIPE_SECRET_KEY

def payment_method_view(request):

    # if request.user.is_authenticated():
    #     billing_profile = request.user.billingprofile
    #     customer_id = billing_profile.customer_id

    billing_profile, billing_profile_created = BillingProfile.objects.new_or_get(request)
    if not billing_profile:
        return redirect('/cart/')

    next_url = None
    next_ = request.GET.get('next')
    if is_safe_url(next_, request.get_host()):
        next_url = next_
    context = {
        'publish_key': STRIPE_PUB_KEY,
        'next_url': next_url,
    }
    return render(request, 'billing/payment_method.html', context)

def payment_method_createview(request):
    if request.method == "POST" and request.is_ajax():
        billing_profile, billing_profile_created = BillingProfile.objects.new_or_get(request)
        if not billing_profile:
            return HttpResponse({'message': 'Cannot find this user'}, status_code=401)
        token = request.POST.get('token')
        if token is not None:
            # card_response = stripe.Customer.create_source(billing_profile.customer_id, source=token, )
            # new_card_obj = Card.objects.add_new(billing_profile, card_response)
            new_card_obj = Card.objects.add_new(billing_profile, token)
            print(new_card_obj)
        return JsonResponse({'message': 'Done'})
    return HttpResponse({'message': 'error'}, status_code=401)
