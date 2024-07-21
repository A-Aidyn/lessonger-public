import json

from celery import shared_task
from celery.utils.log import get_task_logger
from django.contrib.auth import get_user_model
from pywebpush import webpush, WebPushException
User = get_user_model()

logger = get_task_logger(__name__)


@shared_task()
def send_browser_notification(user_id, text):
    user = User.objects.get(id=user_id)
    for subscription in user.push_subscriptions.all():
        logger.debug(f'sending browser push to {subscription} payload: {subscription.payload} {type(subscription.payload)}')
        payload = json.loads(subscription.payload)
        try:
            webpush(
                subscription_info=payload,
                data=text,
                vapid_private_key="sZz5ozBukIt1iNhZFsswxDE0WzzQXQnFJVM1GURcCmM",
                vapid_claims={
                    "sub": "mailto:info@lessonger.com",
                }
            )
        except WebPushException as ex:
            logger.debug("I'm sorry, Dave, but I can't do that: {}", repr(ex))
            # Mozilla returns additional information in the body of the response.
            if ex.response and ex.response.json():
                extra = ex.response.json()
                logger.debug("Remote service replied with a {}:{}, {}",
                      extra.code,
                      extra.errno,
                      extra.message
                      )
            subscription.delete()
