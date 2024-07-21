from django.contrib.auth import get_user_model
from django.shortcuts import render, get_object_or_404
from .models import Chat

User = get_user_model()
BLOCK_SIZE = 10


# Return messages of the specific chat (not all the chat)
def get_messages(chatID, offset):
    chat = get_object_or_404(Chat, id=chatID)
    # Check django queries and find good one
    return chat.messages.order_by('-timestamp').all()[offset:offset + BLOCK_SIZE]


def get_current_chat(chatID):
    return get_object_or_404(Chat, id=chatID)
