from celery import shared_task
from datetime import datetime, timezone, timedelta

from celery.utils.log import get_task_logger

from chat.models import Chat, Message
from lessongerbot.tasks import send_notification
from push_notifications.tasks import send_browser_notification

logger = get_task_logger(__name__)


@shared_task()
def trigger_notifications_in_chat(chat_id, message_id):
    chat = Chat.objects.get(id=chat_id)
    message = Message.objects.get(id=message_id)

    logger.debug(f'chat_id: {chat_id} chat: {chat} || message: {message} message_id: {message_id}')

    text = f'From {message.contact.username} in {chat.name}: {message.content}'
    if chat.is_private:
        text = f'From {message.contact.username}: {message.content}'

    for participant in chat.participants.all():
        if participant.username != message.contact.username:
            if (datetime.now(timezone.utc) - participant.profile.last_active_time).seconds > 5 * 60:
                send_notification.delay(user_id=participant.id, text=text)
                send_browser_notification.delay(user_id=participant.id, text=text)
