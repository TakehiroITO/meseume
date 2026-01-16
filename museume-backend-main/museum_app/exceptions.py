import logging
import traceback
from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status
from django.utils.translation import gettext as _

# Set up logging
logger = logging.getLogger(__name__)

def custom_exception_handler(exc, context):
    response = exception_handler(exc, context)

    if response is not None:
        logger.error("Exception occurred", exc_info=exc)

        # Convert errors to a string format
        error_messages = format_errors(response.data)

        # Custom error response format
        return Response(
            {
                "errors": error_messages,
                "status_code": response.status_code,
            },
            status=response.status_code
        )
    
    # Handle unexpected exceptions
    logger.error("Unexpected error occurred", exc_info=True)
    
    return Response(
        {
            "errors": _("予期せぬエラーが発生しました。しばらく時間をおいて再度お試しください。"),
            "status_code": status.HTTP_500_INTERNAL_SERVER_ERROR,
        },
        status=status.HTTP_500_INTERNAL_SERVER_ERROR
    )

def format_errors(errors):
    """
    Recursively formats error details into a human-readable string.
    """
    if isinstance(errors, list):
        return " ".join([str(error) for error in errors])
    elif isinstance(errors, dict):
        return " ".join([f"{format_errors(value)}" for key, value in errors.items()])
    return str(errors)
