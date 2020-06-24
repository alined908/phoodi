from meetup.models import User, Timestamps
from .utils import BaseActivity
from django.db import models
from enum import Enum

class NotificationQuerySet(models.query.QuerySet):

    def unread(self, include_deleted=False):
        return self.filter(is_unread=True, is_deleted=False)

    def read(self, include_deleted=False):
        return self.filter(is_unread=False, is_deleted=False)

    def mark_all_as_read(self, recipient=None):
        qset = self.unread(True)
        if recipient:
            qset = qset.filter(recipient=recipient)

        return qset.update(is_unread=False)

    def mark_all_as_unread(self, recipient=None):
        qset = self.read(True)

        if recipient:
            qset = qset.filter(recipient=recipient)

        return qset.update(is_unread=True)

    def deleted(self):
        return self.filter(is_deleted=True)

    def active(self):
        return self.filter(is_deleted=False)

    def mark_all_as_deleted(self, recipient=None):
        qset = self.active()
        if recipient:
            qset = qset.filter(recipient=recipient)

        return qset.update(is_deleted=True)

    def mark_all_as_active(self, recipient=None):
        qset = self.deleted()
        if recipient:
            qset = qset.filter(recipient=recipient)

        return qset.update(is_deleted=False)

class Notification(BaseActivity):
    """
    Notification Spec
    1. <description: friendship> - You made a friend!
    2. <description: chat> - You got a chat message!
    3. <description: invite> - You got an invite!
    4. <description: meetup> - A meetup you are in changed!
    5. <description: comment> - Someone commented on your review/activity!
    6. <description: follow> - Someone followed you!
    """
    recipient = models.ForeignKey(User, related_name="notifications", on_delete=models.CASCADE)
    is_unread = models.BooleanField(default = True, db_index = True)
    is_global = models.BooleanField(default = False, db_index = True)
    is_deleted = models.BooleanField(default = False, db_index = True)

    objects = NotificationQuerySet.as_manager()

    def __str__(self):
        ctx = {
            'actor': self.actor,
            'verb': self.verb,
            'action_object': self.action_object,
            'target': self.target,
            'timesince': self.timesince()
        }
        if self.target:
            if self.action_object:
                return u'%(actor)s %(verb)s %(action_object)s on %(target)s %(timesince)s ago' % ctx
            return u'%(actor)s %(verb)s %(target)s %(timesince)s ago' % ctx
        if self.action_object:
            return u'%(actor)s %(verb)s %(action_object)s %(timesince)s ago' % ctx
        return u'%(actor)s %(verb)s %(timesince)s ago' % ctx

    def mark_as_read(self):
        if self.is_unread:
            self.is_unread = False
            self.save()

    def mark_as_unread(self):
        if not self.is_unread:
            self.is_unread = True
            self.save()