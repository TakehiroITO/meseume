from django.core.management.base import BaseCommand
from member.helpers.emails import send_email

class Command(BaseCommand):
    help = 'お問い合わせメールの送信テスト'

    def handle(self, *args, **options):
        self.stdout.write("🧪 お問い合わせメールのテストを開始...")
        
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
            self.stdout.write(self.style.SUCCESS("✅ メール送信成功！"))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"❌ メール送信失敗: {e}"))