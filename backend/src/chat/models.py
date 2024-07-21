import uuid
from django.contrib.auth import get_user_model
from django.db import models
from django.db.models.signals import post_save
from django.dispatch import receiver
from PIL import Image

User = get_user_model()


class Channel(models.Model):
    participants = models.ManyToManyField(User, related_name='channels')
    name = models.CharField(max_length=256, default='Private')
    code = models.CharField(max_length=256, blank=True, null=True)
    is_course = models.BooleanField(default=False)  # 1: LMS course. 0: Private channel
    image = models.ImageField(upload_to='item_images', default='item_images/default_channel_image.png')

    def __str__(self):
        return f'Channel: {self.name} ({self.code})'

    # def save(self, *args, **kwargs):
    #     super().save(*args, **kwargs) TODO: Fix error in amazon!!!
        # img = Image.open(self.image.path)
        #
        # if img.height > 300 or img.width > 300:
        #     output_size = (300, 300)
        #     img.thumbnail(output_size)
        #     img.save(self.image.path)


class Chat(models.Model):
    uuid = models.UUIDField(default=uuid.uuid4, editable=False)
    channel = models.ForeignKey(Channel, related_name='chats', on_delete=models.CASCADE, blank=True, null=True)
    participants = models.ManyToManyField(User, related_name='chats', through='Membership')
    name = models.CharField(max_length=256, default='Chat name')
    is_private = models.BooleanField(default=False)  # 1: if this is a dialog/monolog. 0: if it is a group chat
    image = models.ImageField(upload_to='item_images', default='item_images/default_chat_image.png')
    CHAT_TYPES = [
        ('c', 'Just Chat'),
        ('q', 'Q&A'),
    ]

    CHAT_SEMESTER = [
        ('1', 'spring'),
        ('2', 'summer'),
        ('3', 'fall'),
        ('4', 'winter'),
    ]
    semester = models.CharField(max_length=1, choices=CHAT_SEMESTER, blank=True, null=True)
    year = models.IntegerField(blank=True, null=True)
    section = models.CharField(max_length=10, blank=True, null=True) # eg. A, B, 0 (if general)
    course_code = models.CharField(max_length=256, blank=True, null=True) # eg. CS101
    
    type = models.CharField(max_length=1, choices=CHAT_TYPES, default='c')
    pinned_message = models.IntegerField(default=0)
    creation_time = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return "name: {} uuid: {} uuid type: {}".format(self.name, self.uuid, type(self.uuid))

    # def save(self, *args, **kwargs):
    #     super().save(*args, **kwargs) TODO: Fix error in amazon!!!
        # img = Image.open(self.image.path)

        # if img.height > 300 or img.width > 300:
        #     output_size = (300, 300)
        #     img.thumbnail(output_size)
        #     img.save(self.image.path)


class Message(models.Model):
    contact = models.ForeignKey(User, related_name='messages', on_delete=models.CASCADE)
    chat = models.ForeignKey(Chat, related_name='messages', on_delete=models.CASCADE)
    content = models.TextField(blank=True, null=True)
    file_url = models.URLField(blank=True, null=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    MESSAGE_TYPES = [
        ('t', 'Text'),
        ('i', 'Image'),
        ('f', 'File')
    ]
    content_type = models.CharField(max_length=1, choices=MESSAGE_TYPES, default='t')
    reply_to = models.IntegerField(default=0)

    def __str__(self):
        if self.content:
            return self.content
        else:
            return 'file: {}'.format(self.file_url)


class Membership(models.Model):
    chat = models.ForeignKey(Chat, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    last_read_message = models.IntegerField(default=0)
    is_admin = models.BooleanField(default=False)

    def __str__(self):
        return "{}, {}, {}".format(self.user.username, self.chat.name, self.last_read_message)


@receiver(post_save, sender=User)
def create_private_channel(sender, instance, created, **kwargs):
    if created:
        channel = Channel.objects.create()
        channel.participants.add(instance)
        chat = Chat.objects.create(channel=channel, name="My Notes", is_private=True, image='item_images/default_mychat_image.png')
        m = Membership(chat=chat, user=instance, is_admin=True)
        m.save()


class Kaistlogin(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    state = models.CharField(max_length=256)
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return "Kaist login user: {}, state: {}, created: {}".format(self.user.username, self.state, self.timestamp)

# @receiver(post_save, sender=User)
# def save_private_channel(sender, instance, **kwargs):
#     instance.channels.all()[0].save()
#     instance.chats.all()[0].save()
