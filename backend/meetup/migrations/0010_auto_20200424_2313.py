# Generated by Django 3.0 on 2020-04-25 06:13

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('meetup', '0009_delete_restaurantvote'),
    ]

    operations = [
        migrations.AddField(
            model_name='commentvote',
            name='user',
            field=models.ForeignKey(default=1, on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='commentvote',
            name='vote',
            field=models.IntegerField(choices=[(-1, 'Down'), (0, 'Unvote'), (1, 'Up')], default=0),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='reviewvote',
            name='user',
            field=models.ForeignKey(default=1, on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='reviewvote',
            name='vote',
            field=models.IntegerField(choices=[(-1, 'Down'), (0, 'Unvote'), (1, 'Up')], default=0),
            preserve_default=False,
        ),
    ]
