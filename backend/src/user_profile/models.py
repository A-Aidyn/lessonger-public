from django.contrib.auth import get_user_model
from django.db import models
from PIL import Image
from django.utils import timezone


from django.db.models.signals import post_save
from django.dispatch import receiver
from datetime import datetime

User = get_user_model()


class Profile(models.Model):
    owner = models.OneToOneField(User, related_name='profile', on_delete=models.CASCADE)
    name = models.CharField(max_length=256, default="Unknown")
    surname = models.CharField(max_length=256, default="Unknown")
    position = models.CharField(max_length=256, default="unknown")
    image = models.ImageField(upload_to='item_images', default='item_images/default_profile_image.jpeg')

    anon_name = models.CharField(max_length=256, default="Anonymous")
    anon_surname = models.CharField(max_length=256, default="Anonymous")

    email = models.CharField(max_length=256, default="-")
    kakao_talk_id = models.CharField(max_length=256, default="-")
    linkedin = models.CharField(max_length=256, default="-")

    last_active_time = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f'{self.owner.username} Profile'

    # def save(self, *args, **kwargs):
    #     super().save(*args, **kwargs) TODO: Fix error in amazon!!!
        # img = Image.open(self.image.path)
        #
        # if img.height > 300 or img.width > 300:
        #     output_size = (300, 300)
        #     img.thumbnail(output_size)
        #     img.save(self.image.path)


@receiver(post_save, sender=User)
def create_profile(sender, instance, created, **kwargs):
    if created:
        Profile.objects.create(owner=instance)


@receiver(post_save, sender=User)
def save_profile(sender, instance, **kwargs):
    instance.profile.save()
