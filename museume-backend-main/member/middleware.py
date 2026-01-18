from django.conf import settings
from django.utils import translation


def get_language_from_request(request):
    """
    Get language from request, checking multiple sources in order of priority:
    1. Query parameter 'lang' (for GET requests)
    2. POST body 'lang' (for POST requests)
    3. Session stored language
    4. Accept-Language header
    5. Default to settings.LANGUAGE_CODE
    """
    valid_languages = dict(settings.LANGUAGES)

    # Check query parameter (GET)
    lang = request.GET.get('lang')
    if lang and lang in valid_languages:
        return lang

    # Check POST body
    if request.method == 'POST':
        lang = request.POST.get('lang')
        if lang and lang in valid_languages:
            return lang

    # Check session
    if hasattr(request, 'session'):
        lang = request.session.get(settings.LANGUAGE_COOKIE_NAME)
        if lang and lang in valid_languages:
            return lang

    # Check Accept-Language header
    accept_lang = request.headers.get('Accept-Language', '')
    # Parse Accept-Language header (e.g., "ja,en;q=0.9")
    for lang_part in accept_lang.split(','):
        lang_code = lang_part.split(';')[0].strip()
        # Handle language variants (e.g., "ja-JP" -> "ja")
        if '-' in lang_code:
            lang_code = lang_code.split('-')[0]
        if lang_code in valid_languages:
            return lang_code

    # Default
    return settings.LANGUAGE_CODE


class AdminLanguageMiddleware:
    """
    Middleware for handling language switching in Django admin.
    Supports both GET and POST requests for language changes.
    """
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        if request.path.startswith('/admin/'):
            lang = get_language_from_request(request)
            translation.activate(lang)

            # Persist language in session
            if hasattr(request, 'session'):
                request.session[settings.LANGUAGE_COOKIE_NAME] = lang

        response = self.get_response(request)
        return response


class APILanguageMiddleware:
    """
    Middleware for handling language in API requests.
    Supports query parameters, headers, and session-based language preference.
    """
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        if not request.path.startswith('/admin/'):
            lang = get_language_from_request(request)
            translation.activate(lang)

            # Persist language in session if available
            if hasattr(request, 'session') and request.session.session_key:
                request.session[settings.LANGUAGE_COOKIE_NAME] = lang

        response = self.get_response(request)

        # Set language cookie in response
        if not request.path.startswith('/admin/'):
            lang = translation.get_language()
            if lang:
                response.set_cookie(
                    settings.LANGUAGE_COOKIE_NAME,
                    lang,
                    max_age=365 * 24 * 60 * 60,  # 1 year
                    samesite='Lax'
                )

        return response
