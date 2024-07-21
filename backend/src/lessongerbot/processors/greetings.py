from django_tgbot.decorators import processor
from django_tgbot.state_manager import message_types, update_types, state_types
from django_tgbot.types.update import Update
from django_tgbot.types.replykeyboardmarkup import ReplyKeyboardMarkup
from django_tgbot.types.keyboardbutton import KeyboardButton
from django_tgbot.types.replykeyboardremove import ReplyKeyboardRemove
from ..bot import state_manager, TelegramBot
from ..models import TelegramState

state_manager.set_default_update_types(update_types.Message)

# @processor(state_manager, from_states=state_types.All)
# def hello_world(bot: TelegramBot, update: Update, state: TelegramState):
#     try:
#         pass
#         #print (update.get_message().get_text())
#     except:
#         pass
#     if update.get_message().get_text()=='/start':    
#         pass
#         #state.set_name('asked_for_signup')
#         #result = bot.sendMessage(chat_id=update.get_chat().get_id(),text='Wellcome to LessongerBot! Link your Lessonger account to receive notifications right here!',  )

@processor(state_manager, success='asked_for_signup')
def say_hello(bot: TelegramBot, update: Update, state: TelegramState):
    chat_id = update.get_chat().get_id()
    bot.sendMessage(chat_id, 'Hello! and welcome to LessongerBot :)')
    #bot.sendPhoto(chat_id, open('hello_world_bot/img/welcome.png', 'rb'), upload=True)
    bot.sendMessage(chat_id, 'Do you want to link your Lessonger account to receive notifications?', reply_markup=ReplyKeyboardMarkup.a(keyboard=[
        [KeyboardButton.a(text='Yes')]
    ]))

@processor(state_manager, from_states='athorized')
def text_only(bot, update, state):
    bot.sendMessage(update.get_chat().get_id(), 'You are already authorized. You will get notifications from Lessonger.')

@processor(state_manager, from_states='asked_for_signup', success=state_types.Keep, exclude_message_types=message_types.Text)
def text_only(bot, update, state):
    bot.sendMessage(update.get_chat().get_id(), 'I\'d appreciate it if you answer in text format')
#https://c567ef8b7d29.ngrok.io

@processor(state_manager, from_states='asked_for_signup', message_types=message_types.Text)
def start_signup(bot, update, state):
    chat_id = update.get_chat().get_id()
    text = update.get_message().get_text()
    if text == 'Yes':
        bot.sendMessage(chat_id, 'Input your lessonger username:', reply_markup=ReplyKeyboardRemove.a(remove_keyboard=True))
        state.set_name('asked_for_name')
    else:
        bot.sendMessage(chat_id, 'I didn\'t get that! Use the keyboard below')
