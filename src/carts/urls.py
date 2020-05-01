from django.urls import path
from . import views

app_name = 'cart'

urlpatterns = [
    path('', views.cart_view, name='home'),
    path('update/', views.update_cart, name='update'),
    path('checkout/', views.checkout_home, name='checkout'),
]