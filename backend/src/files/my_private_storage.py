from django.contrib.auth import get_user_model
from rest_framework.authtoken.models import Token
from .models import FilesModel

User = get_user_model()


def my_private_storage_function(private_file):
    print('hello?')

    parsed_token = private_file.request.headers.get('Authorization', '').split(' ')
    if len(parsed_token) == 2:
        parsed_token = parsed_token[1]
    else:
        parsed_token = ''

    try:
        token = Token.objects.get(key=parsed_token)
    except Token.DoesNotExist:
        return False

    print(private_file)
    print(private_file.relative_name)

    try:
        model = FilesModel.objects.get(file__name=private_file.relative_name)
    except FilesModel.DoesNotExist:
        print('cannot find the model :(')
        return False

    print(model)
    return True
