# Generated manually for ULID field addition

from django.db import migrations, models
import ulid


def generate_ulid_for_existing_members(apps, schema_editor):
    """
    Generate ULID for all existing members that don't have one.
    """
    Member = apps.get_model('member', 'Member')
    for member in Member.objects.filter(ulid__isnull=True):
        member.ulid = str(ulid.ULID())
        member.save(update_fields=['ulid'])


def reverse_ulid_generation(apps, schema_editor):
    """
    Reverse migration: set all ULIDs to None.
    """
    Member = apps.get_model('member', 'Member')
    Member.objects.all().update(ulid=None)


class Migration(migrations.Migration):

    dependencies = [
        ('member', '0020_organization_custom_email_address_and_more'),
    ]

    operations = [
        # Step 1: Add ulid field as nullable first
        migrations.AddField(
            model_name='member',
            name='ulid',
            field=models.CharField(
                blank=True,
                editable=False,
                help_text='Immutable unique identifier for external reference',
                max_length=26,
                null=True,
                verbose_name='ULID',
            ),
        ),
        # Step 2: Populate ULID for existing records
        migrations.RunPython(
            generate_ulid_for_existing_members,
            reverse_ulid_generation,
        ),
        # Step 3: Make ulid field non-nullable and unique
        migrations.AlterField(
            model_name='member',
            name='ulid',
            field=models.CharField(
                editable=False,
                help_text='Immutable unique identifier for external reference',
                max_length=26,
                unique=True,
                verbose_name='ULID',
            ),
        ),
    ]
