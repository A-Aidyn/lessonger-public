from django_tgbot.decorators import processor
from django_tgbot.state_manager import message_types, update_types, state_types
from django_tgbot.types.update import Update
from django_tgbot.exceptions import ProcessFailure
from ..bot import state_manager, TelegramBot, bot
from ..models import TelegramState

from django.contrib.auth import get_user_model
from django.contrib.auth import authenticate

User = get_user_model()

state_manager.set_default_update_types(update_types.Message)


# @processor(state_manager, from_states='asked_for_name', success='asked_for_password', fail=state_types.Keep,
# message_types=message_types.Text)
def send_notification(user, text):
    # bot = bot
    try:
        chat_id = user.telegram_bot.telegram_id
        result = bot.sendMessage(chat_id=chat_id, text=text)
    except:
        pass


@processor(state_manager, from_states='asked_for_name', success='asked_for_password', fail=state_types.Keep,
           message_types=message_types.Text)
def get_username(bot: TelegramBot, update: Update, state: TelegramState):
    chat_id = update.get_chat().get_id()
    name = update.get_message().get_text()
    # if len(name) < 3:
    #     bot.sendMessage(chat_id, 'Name is too short! Try again:')
    #     raise ProcessFailure

    state.set_memory({
        'name': name
    })

    bot.sendMessage(chat_id, 'Input your password')


@processor(state_manager, from_states='asked_for_password', fail=state_types.Keep, message_types=message_types.Text)
def get_password(bot, update, state):
    chat_id = update.get_chat().get_id()
    password = update.get_message().get_text()
    name = state.get_memory()['name']

    user = authenticate(username=name, password=password)
    if user is not None:
        chat = bot.get_db_chat(telegram_id=chat_id)
        chat.lessonger_account = user
        chat.save()

        state.set_name('athorized')
        bot.sendMessage(chat_id, 'You\'ve been authenticated. You will recieve notifications here from now on.')

    else:
        bot.sendMessage(chat_id, 'Incorrect username or password. Try again by entering your username')
        state.set_name('asked_for_name')

    state.set_memory({})
