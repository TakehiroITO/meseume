from django.shortcuts import render, get_object_or_404
from django.http import JsonResponse
from django.views import View
from .models import Advertisement
from django.utils.translation import gettext as _

class AdvertisementListView(View):
    def _get_secure_image_url(self, request, image_field):
        """Helper method to ensure HTTPS URLs in production"""
        if image_field:
            url = request.build_absolute_uri(image_field.url)
            # Force HTTPS in production
            if url.startswith('http://') and (
                'museume.art' in url or 
                request.get_host() in ['museume.art', 'www.museume.art']
            ):
                url = url.replace('http://', 'https://')
            return url
        return None
    
    def get(self, request):
        ads = Advertisement.objects.all()
        data = [
            {
                "id": ad.id,
                "name": ad.name,
                "banner_frame": ad.banner_frame,
                "add_type": ad.add_type,
                "banner_image": self._get_secure_image_url(request, ad.banner_image) if ad.banner_image else None,
                "start_date": ad.start_date,
                "end_date": ad.end_date,
                "is_active": True,
                                # "is_active": ad.is_active,

            }
            for ad in ads
        ]
        return JsonResponse(data, safe=False)

class AdvertisementDetailView(View):
    def get(self, request, pk):
        ad = get_object_or_404(Advertisement, pk=pk)
        data = {
            "id": ad.id,
            "name": ad.name,
            "banner_frame": ad.banner_frame,
            "add_type": ad.add_type,
            "start_date": ad.start_date,
            "end_date": ad.end_date,
            "is_active": ad.is_active,
        }
        return JsonResponse(data)

    def post(self, request, pk):
        ad = get_object_or_404(Advertisement, pk=pk)
        ad.is_active = request.POST.get("is_active", ad.is_active)
        ad.save()
        return JsonResponse({"message": _("Advertisement updated successfully.")})

class CreateAdvertisementView(View):
    def post(self, request):
        name = request.POST.get("name")
        banner_frame = request.POST.get("banner_frame")
        add_type = request.POST.get("add_type")
        start_date = request.POST.get("start_date")
        end_date = request.POST.get("end_date")

        ad = Advertisement.objects.create(
            name=name, banner_frame=banner_frame, add_type=add_type, start_date=start_date, end_date=end_date
        )
        return JsonResponse({"message": _("Advertisement created successfully."), "id": ad.id})
