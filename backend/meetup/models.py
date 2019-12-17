from django.db import models
from django.core.mail import send_mail
from django.contrib.auth.models import (AbstractBaseUser, BaseUserManager)
from django.conf import settings

class UserManager(BaseUserManager):
    def create_user(self, email, first_name, is_staff=False, is_admin=False, password=None, **kwargs):
        if not email:
            raise ValueError("Users must have an email address")
        if not password:
            raise ValueError("User must have a password")
        user = self.model(email = self.normalize_email(email))
        user.set_password(password)
        user.first_name = first_name
        user.staff = is_staff
        user.admin = is_admin
        user.save(using=self._db)
        return user
    
    def create_staffuser(self, email, password, first_name):
        user = self.create_user(
            email, password=password, first_name=first_name
        )
        user.staff = True
        user.save(using=self._db)
        return user
    
    def create_superuser(self, email, password, first_name):
        user = self.create_user(
            email, password=password, first_name=first_name
        )
        user.staff = True
        user.admin = True
        user.save(using=self._db)
        return user

# Create your models here.
class User(AbstractBaseUser):
    email = models.EmailField(unique=True, max_length=255)
    first_name = models.CharField(max_length=255)
    last_name = models.CharField(max_length=255, blank=True, null=True)
    active = models.BooleanField(default=True)
    admin = models.BooleanField(default=False)
    staff = models.BooleanField(default=False)
    confirmed = models.BooleanField(default =False)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['first_name']

    objects = UserManager()

    def __str__(self):
        return self.email

    def get_full_name(self):
        full_name = '%s %s' % (self.first_name, self.last_name)
        return full_name.strip()

    def get_short_name(self):
        return self.first_name

    def has_perm(self, perm, obj=None):
        return self.admin

    def has_module_perms(self,app_label):
        return self.admin

    @property
    def is_admin(self):
        return self.admin

    @property
    def is_staff(self):
        return self.staff

    def email_user(self, subject, message, from_email=None, **kwargs):
        send_mail(subject, message, from_email, [self.email], **kwargs)

class Profile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    location = models.CharField(max_length=30,blank=True)
    