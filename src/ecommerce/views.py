from django.shortcuts import render, redirect
from django.contrib.auth import login, authenticate, get_user_model
from django.http import HttpResponse, JsonResponse

from .forms import ContactForm

def contact_page(request):
    contact_form = ContactForm(request.POST or None)
    if contact_form.is_valid():
        print(contact_form.cleaned_data)
        if request.is_ajax():
            return JsonResponse({'message':" Thank you"})

    if contact_form.errors:
        errors = contact_form.errors.as_json()
        if request.is_ajax():
            return HttpResponse(errors, status_code=400, content_type='application/json')
    context  = {
        "title": "Contact Us",
        "content": "Welcome to contact page",
        "form": contact_form,
    }
    return render(request, 'contact/view.html', context)

