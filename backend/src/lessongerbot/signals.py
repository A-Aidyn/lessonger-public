from django.db.models.signals import post_save
from django.dispatch import receiver
from chat.models import Message
from .bot import state_manager, TelegramBot
from django.contrib.auth import get_user_model
from .processors.signup import send_notification
# User = get_user_model()
#
# @receiver(post_save, sender=Message)
# def create_profile(sender, instance, created, **kwargs):
#
#     if created:
#         text = f'From { instance.contact } in {instance.chat.name}: {instance.content}'
#         if instance.chat.is_private:
#             text = f'From { instance.contact }: {instance.content}'
#         users = instance.chat.participants.all()
#         for user in users:
#             if user != instance.contact:
#                 send_notification (user = user, text = text)
