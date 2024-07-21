from django.contrib import admin
from .models import TelegramUser, TelegramChat, TelegramState

# Register your models here.

admin.site.register(TelegramUser)
admin.site.register(TelegramChat)
admin.site.register(TelegramState)
