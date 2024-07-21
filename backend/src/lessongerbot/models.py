from django.db import models
from django.db.models import CASCADE

from django_tgbot.models import AbstractTelegramUser, AbstractTelegramChat, AbstractTelegramState

from django.contrib.auth import get_user_model
User = get_user_model()


class TelegramUser(AbstractTelegramUser):
    pass


class TelegramChat(AbstractTelegramChat):
    lessonger_account = models.OneToOneField(User, related_name='telegram_bot', on_delete=models.CASCADE, null=True)
    pass


class TelegramState(AbstractTelegramState):
    telegram_user = models.ForeignKey(TelegramUser, related_name='telegram_states', on_delete=CASCADE, blank=True, null=True)
    telegram_chat = models.ForeignKey(TelegramChat, related_name='telegram_states', on_delete=CASCADE, blank=True, null=True)
    first_sent = models.BooleanField(default=False)
    class Meta:
        unique_together = ('telegram_user', 'telegram_chat', 'first_sent')

