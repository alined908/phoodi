# Generated by Django 3.0 on 2020-01-28 23:19

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion
import meetup.models


class Migration(migrations.Migration):

    dependencies = [
        ('meetup', '0010_chatroom_name'),
    ]

    operations = [
        migrations.CreateModel(
            name='Meetup',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('uri', models.URLField(default=meetup.models.generate_unique_uri)),
                ('datetime', models.DateTimeField()),
                ('options', models.TextField()),
                ('chosen', models.TextField()),
            ],
        ),
        migrations.AddField(
            model_name='profile',
            name='name',
            field=models.CharField(default='profile', max_length=255),
        ),
        migrations.AlterField(
            model_name='profile',
            name='user',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL),
        ),
        migrations.CreateModel(
            name='Preference',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('label', models.TextField()),
                ('profile', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='preferences', to='meetup.Profile')),
            ],
        ),
        migrations.CreateModel(
            name='MeetupMember',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('meetup', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='members', to='meetup.Meetup')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='meetups', to=settings.AUTH_USER_MODEL)),
            ],
        ),
    ]
