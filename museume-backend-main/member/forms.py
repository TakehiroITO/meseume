from django import forms

class CustomEmailForm(forms.Form):
    _selected_action = forms.CharField(widget=forms.MultipleHiddenInput)
    subject = forms.CharField(label="Subject", required=True)
    message = forms.CharField(
        label="Message",
        required=True,
        widget=forms.Textarea(attrs={"rows": 4, "cols": 60})
    )
