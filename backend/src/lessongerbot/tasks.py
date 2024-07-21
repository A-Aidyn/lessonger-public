from celery import shared_task
from django.contrib.auth import get_user_model

from celery.utils.log import get_task_logger
from .bot import state_manager, TelegramBot, bot
User = get_user_model()

logger = get_task_logger(__name__)


@shared_task()
def send_notification(user_id, text):
    user = User.objects.get(id=user_id)
    logger.debug(f'sending telegram push to {user.username}')
    try:
        chat_id = user.telegram_bot.telegram_id
        result = bot.sendMessage(chat_id=chat_id, text=text)
    except:
        pass