from django.utils.translation import gettext_lazy as _
import sendgrid
import os
import json
from dotenv import load_dotenv
load_dotenv()

sg = sendgrid.SendGridAPIClient(api_key=os.environ.get('EMAIL_HOST_PASSWORD'))

def create_new_sender_idenity(sender):
  data = {
    "address": sender["address"],
    "city": sender["city"],
    "country": sender["country"],
    "from": {
      "email": sender["username"]+"@museume.art",
      "name": sender["name"],
    },
    "nickname": sender["username"],
    "reply_to": {
      "email": sender["email"],
      "name": sender["name"],
    },
  }
  try:
    response = sg.client.senders.post(request_body=data)
    response = json.loads(response.body)
    print(response)
    if response['verified']['status'] == True:
      return response['from']['email']
  except Exception as e:
    print(e)

  return None
