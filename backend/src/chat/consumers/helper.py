import logging
import base64
import io
import requests

from PIL import Image
from channels.db import database_sync_to_async
from chat.api.serializers import MessageSerializer
from files.models import FilesModel

logger = logging.getLogger(__name__)


def message_to_json(message, load_image=True):
    res = MessageSerializer(message).data
    logger.debug(f"[Message_to_json] res: {res}")
    # logger.debug('image: ', res['contact']['image'])
    if message.content_type == 'i':
        if not load_image:
            res['content'] = 'Attached image'
        else:
            try:
                id = int(res['file_url'].split('/')[-1])
                file_model = FilesModel.objects.get(id=id)
                logger.debug(f'file_model_file_url: {file_model.file.url}')
                data = requests.get(file_model.file.url, stream=True)
                data = data.raw
                logger.debug(f'data: {data}')
                with Image.open(data) as image_file:
                    byteIO = io.BytesIO()
                    width, height = image_file.size
                    logger.debug(f'width: {width} height: {height} format: {image_file.format}')
                    image_file.save(byteIO, format=image_file.format)
                    encoded_string = base64.b64encode(byteIO.getvalue())
                    tmp = {
                        'image': {
                            'data': 'data:image/{};base64,{}'.format(image_file.format.lower(),
                                                                     encoded_string.decode('utf-8')),
                            'width': width,
                            'height': height
                        }
                    }
                    res.update(tmp)
            except (OSError, FilesModel.DoesNotExist):
                logger.debug('Cannot open the image!')
    return res


def messages_to_json(messages):
    result = []
    for message in messages:
        result.append(message_to_json(message))
    return result
