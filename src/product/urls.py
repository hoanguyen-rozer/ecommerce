
from django.urls import path

from product import views

app_name = 'products'

urlpatterns = [
    # path('featured/', product_view.ProductFeaturedListView.as_view(), name='feature'),
    # path('featured/<int:pk>/', product_view.ProductFeaturedDetailView.as_view(), name='featured_detail'),
    path('<slug:slug>/', views.ProductSlugDetailView.as_view(), name='detail'),
    path('', views.ProductListView.as_view(), name='products'),
    # path('products/<int:pk>/', product_view.ProductDetailView.as_view(), name='detail'),
]