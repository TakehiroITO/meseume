"""
ULID and Child Email Helper Functions

Provides utilities for:
- ULID generation (used as immutable internal identifiers)
- Child email suffix handling (parent_email#child_ULID format)
"""
from ulid import ULID


def generate_ulid() -> str:
    """
    Generate a new ULID string.

    ULIDs are used as immutable internal identifiers for members.
    They are:
    - Sortable by creation time
    - URL-safe
    - Case-insensitive

    Returns:
        str: A new ULID string (26 characters)
    """
    return str(ULID())


def generate_child_email(parent_email: str, child_ulid: str) -> str:
    """
    Generate a child's email address using parent's email with suffix.

    Format: parent_email#child_ULID
    Example: parent@example.com#child_01ARZ3NDEKTSV4RRFFQ69G5XYZ

    This allows:
    - All members to have unique email addresses (UNIQUE constraint satisfied)
    - Parents don't need to create separate emails for children
    - Children can later update to their own email when independent

    Args:
        parent_email: Parent's email address
        child_ulid: Child's ULID (used as unique suffix)

    Returns:
        str: Generated child email in format parent_email#child_ULID
    """
    return f"{parent_email}#child_{child_ulid}"


def extract_parent_email(child_email: str) -> str:
    """
    Extract the parent's email from a child's email address.

    Used when sending emails to child accounts - the email is sent
    to the parent's address (stripping the #child_xxx suffix).

    Args:
        child_email: The child's email (may or may not have suffix)

    Returns:
        str: Parent's email if suffix exists, otherwise original email
    """
    if '#child_' in child_email:
        return child_email.split('#child_')[0]
    return child_email


def is_child_email(email: str) -> bool:
    """
    Check if an email is a child's generated email (has #child_ suffix).

    Args:
        email: Email address to check

    Returns:
        bool: True if email has child suffix, False otherwise
    """
    return '#child_' in email
