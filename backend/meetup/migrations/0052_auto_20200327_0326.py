# Generated by Django 3.0 on 2020-03-27 10:26

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('meetup', '0051_auto_20200327_0232'),
    ]

    operations = [
        migrations.AlterField(
            model_name='meetup',
            name='latitude',
            field=models.DecimalField(decimal_places=7, max_digits=11),
        ),
        migrations.AlterField(
            model_name='meetup',
            name='longitude',
            field=models.DecimalField(decimal_places=7, max_digits=11),
        ),
    ]
