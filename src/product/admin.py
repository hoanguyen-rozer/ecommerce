from django.contrib import admin
from .models import Product
# Register your models here.

class ProductAdmin(admin.ModelAdmin):
    class Meta:
        model = Product
    list_display = ('__str__', 'slug')

admin.site.register(Product, ProductAdmin)