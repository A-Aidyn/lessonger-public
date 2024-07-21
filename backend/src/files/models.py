from django.db import models

from private_storage.fields import PrivateFileField
from chat.models import Chat, Message

class FilesModel(models.Model):
    #title = models.CharField("Title", max_length=200)

    chat = models.ForeignKey(Chat, related_name='files', on_delete=models.CASCADE)
    file = PrivateFileField("File", upload_to='', max_file_size=10*1024 * 1024)  #TODO?: maybe store for each chat seperately?

    def __str__(self):
        return 'file in {}'.format(self.chat.name)
