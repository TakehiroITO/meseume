#!/usr/bin/env python
import os
import sys
import django

# Djangoの設定をロード
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'museum_app.settings_local')
django.setup()

from member.helpers.emails import send_email

def test_inquiry_email():
    """お問い合わせメールのテスト"""
    print("🧪 お問い合わせメールのテストを開始...")
    
    context = {
        'full_name': 'テストユーザー',
        'email': 'test@example.com',
        'subject': 'テスト問い合わせ',
        'message': 'これはテストメッセージです。\nローカル環境からの送信テストです。',
    }
    
    try:
        send_email(
            template_name='emails/inquiry_email.html',
            subject=f"[問い合わせ] {context['subject']}",
            context=context,
            recipient_email=["contact@museume.art", "info@seso-j.com"],
            reply_to=context['email']
        )
        print("✅ メール送信成功！")
    except Exception as e:
        print(f"❌ メール送信失敗: {e}")

if __name__ == "__main__":
    test_inquiry_email()