from rest_framework import serializers

from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404

from ..models import FilesModel


User = get_user_model()


from rest_framework.utils.field_mapping import get_relation_kwargs
from rest_framework.relations import HyperlinkedRelatedField



class FilesSerializer(serializers.ModelSerializer):
    class Meta:
        model = FilesModel
        fields = '__all__'

    def build_relational_field(self, field_name, relation_info):
        """
        Create fields for forward and reverse relationships.
        """
        field_class = self.serializer_related_field
        field_kwargs = get_relation_kwargs(field_name, relation_info)

        to_field = field_kwargs.pop('to_field', None)
        if to_field and not relation_info.reverse and not relation_info.related_model._meta.get_field(to_field).primary_key:
            field_kwargs['slug_field'] = to_field
            field_class = self.serializer_related_to_field

        # `view_name` is only valid for hyperlinked relationships.
        if not issubclass(field_class, HyperlinkedRelatedField):
            field_kwargs.pop('view_name', None)

        if field_name == 'chat':
            field_kwargs['queryset'] = field_kwargs['queryset'].filter(participants=self.context.get('request', None).user)

        return field_class, field_kwargs
