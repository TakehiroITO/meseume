from django.conf import settings
from django.utils import translation

class AdminLanguageMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        if request.path.startswith('/admin/'):
            # Get the language from the query parameters
            lang = request.GET.get('lang', None)
            if lang in dict(settings.LANGUAGES):
                translation.activate(lang)
                # Use settings for LANGUAGE_SESSION_KEY
                request.session[settings.LANGUAGE_COOKIE_NAME] = lang
        response = self.get_response(request)
        return response

class APILanguageMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        if not request.path.startswith('/admin/'):
            # Determine language from query parameters or Accept-Language header
            lang = request.GET.get('lang') or request.headers.get('Accept-Language', 'en')
            if lang in dict(settings.LANGUAGES):
                translation.activate(lang)
            else:
                translation.activate(settings.LANGUAGE_CODE)  # Default to LANGUAGE_CODE

        response = self.get_response(request)

        if request.path.startswith('/admin/'):
            translation.deactivate()

        return response
