# Generated manually for Work default value changes (RFP requirements)

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('work', '0006_alter_work_title'),
    ]

    operations = [
        # Change is_public default from True to False (RFP requirement)
        migrations.AlterField(
            model_name='work',
            name='is_public',
            field=models.BooleanField(
                default=False,
                verbose_name='is public',
            ),
        ),
        # Change public_visibility default from 'public' to 'private' (RFP requirement)
        migrations.AlterField(
            model_name='work',
            name='public_visibility',
            field=models.CharField(
                choices=[('private', 'Private'), ('public', 'Public')],
                default='private',
                max_length=50,
                verbose_name='public visibility',
            ),
        ),
    ]
