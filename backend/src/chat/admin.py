from django.contrib import admin
from .models import Channel, Message, Chat, Membership, Kaistlogin

# Register your models here.

admin.site.register(Channel)
admin.site.register(Message)
admin.site.register(Chat)
admin.site.register(Membership)
admin.site.register(Kaistlogin)
