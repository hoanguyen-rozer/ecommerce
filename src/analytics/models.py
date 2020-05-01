from django.db import models
from django.conf import settings
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType
from django.contrib.sessions.models import Session
from django.db.models.signals import post_save, pre_save
# Create your models here.

from .signals import object_viewed_signal
from .utils import get_client_ip
from accounts.signals import user_logged_in

User = settings.AUTH_USER_MODEL

FORCE_SESSION_TO_ONE = getattr(settings, 'FORCE_SESSION_TO_ONE', False)
FORCE_INACTIVE_USER_ENDSESSION = getattr(settings, 'FORCE_INACTIVE_USER_ENDSESSION', False)

class ObjectViewed(models.Model):
    user = models.ForeignKey(User, null=True, blank=True, on_delete=models.DO_NOTHING)
    ip_address = models.CharField(max_length=220, null=True, blank=True)
    content_type = models.ForeignKey(ContentType, on_delete=models.DO_NOTHING) # User. Product, Order, Cart,...
    object_id = models.PositiveIntegerField() # user_id, product_id,...
    content_objects = GenericForeignKey('content_type', 'object_id') # Product Instance
    timestamp = models.DateTimeField(auto_now_add=True)
    #product = models.ForeignKey(Product) # id = 1, product_id.objectviewed_set.all()
    # order = models.ForeignKey(Order)
    #url 

    def __str__(self):
        return '%s viewed on %s' %(self.content_objects, self.timestamp) # most recent save show up first

    class Meta:
        ordering = ['-timestamp']
        verbose_name = 'Object viewed'
        verbose_name_plural = 'Objects viewed'

def object_viewed_receiver(sender, instance, request, *args, **kwargs):
    c_type = ContentType.objects.get_for_model(sender) #instance.__class__
    new_view_object = ObjectViewed.objects.create(
        user=request.user,
        content_type=c_type,
        object_id=instance.id, 
        ip_address=get_client_ip(request)
    )
    

object_viewed_signal.connect(object_viewed_receiver)

# UserSession Class
class UserSession(models.Model):
    user = models.ForeignKey(User, blank=True, null=True, on_delete=models.DO_NOTHING)
    ip_address = models.CharField(max_length=220, null=True, blank=True)
    session_key = models.CharField(max_length=120, null=True, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    active = models.BooleanField(default=True)
    ended = models.BooleanField(default=False)

    def end_session(self):
        session_key = self.session_key
        ended = self.ended
        try:
            Session.objects.get(pk=session_key).delete()
            self.active = False
            self.ended = True
            self.save()
        except:
            pass
        return self.ended

def post_save_session_receiver(sender, instance, created, *args, **kwargs):
    if created:
        qs = UserSession.objects.filter(user=instance.user, ended=False, active=False).exclude(id=instance.id)
        for i in qs:
            i.end_session()
    if not instance.active and not instance.ended:
        instance.end_session() 
if FORCE_SESSION_TO_ONE:
    post_save.connect(post_save_session_receiver, sender=UserSession)


def post_save_user_change_receiver(sender, instance, created, *args, **kwargs):
    if not created:
        if instance.is_active == False:
            qs = UserSession.objects.filter(user=instance.user, active=False, ended=False)
            for i in qs:
                i.end_session()
if FORCE_INACTIVE_USER_ENDSESSION:
    post_save.connect(post_save_user_change_receiver, sender=User)



def user_logged_in_receiver(sender, instance, request, *args, **kwargs):
    user = instance
    session_key = request.session.session_key
    ip_address = get_client_ip(request)
    UserSession.objects.create(
        user=user,
        ip_address=ip_address,
        session_key=session_key
    )

user_logged_in.connect(user_logged_in_receiver)


