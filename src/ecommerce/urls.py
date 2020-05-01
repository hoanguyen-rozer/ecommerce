"""ecommerce URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/3.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.contrib.auth.views import LogoutView

from . import views
from carts import views as cart_view
from accounts import views as acc_view
from addresses.views import checkout_address_create_view, checkout_address_reuse_view
from billing.views import payment_method_view, payment_method_createview
from marketing import views as marketing_view

urlpatterns = [
    path('contact/', views.contact_page, name='contact'),
    path('login/', acc_view.LoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('api/cart/', cart_view.cart_detail_api_view, name='api-cart'),
    path('checkout/address/create/', checkout_address_create_view, name='checkout_address_create'),
    path('checkout/address/reuse/', checkout_address_reuse_view, name='checkout_address_reuse'),
    path('billing/payment-method', payment_method_view, name='billing_payment_method'),
    path('billing/payment-method/create/', payment_method_createview, name='billing_payment_method_endpoint'),
    path('register/', acc_view.RegisterView.as_view(), name='register'),
    path('register/guest/', acc_view.guest_register_view, name='guest_register'),
    path('admin/', admin.site.urls),
    path('products/', include('product.urls')),
    path('search/', include('search.urls')),
    path('cart/', include('carts.urls')),
    # path('settings/email/', marketing_view.MarketingPreferenceUpdateView.as_view(), name='marketing_pref'),
    # path('webhooks/mailchimp/', marketing_view.MailchimpWebhookView.as_view(), name='webhooks_mailchimp'),

]

if settings.DEBUG:
    urlpatterns = urlpatterns + static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    urlpatterns = urlpatterns + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)