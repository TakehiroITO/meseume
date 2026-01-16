from django import forms
from .models import Work, Image
from member.models import *

class WorkForm(forms.ModelForm):
    image_1 = forms.ImageField(required=True, label="Image 1")
    image_2 = forms.ImageField(required=False, label="Image 2")
    image_3 = forms.ImageField(required=False, label="Image 3")
    image_4 = forms.ImageField(required=False, label="Image 4")
    image_5 = forms.ImageField(required=False, label="Image 5")

    class Meta:
        model = Work
        fields = ['title', 'description', 'is_public', 'member', 'is_approved', 'price', 'tags', 'category', 'image_1', 'image_2', 'image_3', 'image_4', 'image_5']

    def __init__(self, *args, **kwargs):
        request = kwargs.pop('request', None)  # Get the request object
        super().__init__(*args, **kwargs)
        
        # Filter the member queryset based on the request or any logic
        if request and request.user.is_superuser:
            self.fields['member'].queryset = RegularMember.objects.filter(role='child')
        elif request:
            # Example: Filter by organization or any other condition
            self.fields['member'].queryset = request.user.organization.get_children()

    def save(self, commit=True):
    # Save the Work instance first
        work = super().save(commit=False)
        work.save()  # Save the Work instance to generate the primary key

        # Save the associated images
        images = [
            self.cleaned_data.get('image_1'),
            self.cleaned_data.get('image_2'),
            self.cleaned_data.get('image_3'),
            self.cleaned_data.get('image_4'),
            self.cleaned_data.get('image_5'),
        ]
        for img in images:
            if img:
                Image.objects.create(work=work, image=img)

        return work
