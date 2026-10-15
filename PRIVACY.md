# Privacy / Gizlilik

## English

KitQuarry processes only explicit slash-command/modal/button interactions in its configured server. The application does not subscribe to message content, presence, member lists or voice events, and does not fetch attachments or external URLs. Discord may supply interaction metadata; minimal SDK message/user/member caches are disabled. Server, role and channel metadata is maintained by the SDK for permission handling.

Draft RAM contains random draft IDs, owner/server/channel IDs, language, expiry and (after form submission) the supply plan and private response ID. The bot does not retain the raw material text separately. Drafts expire five minutes after form opening; the periodic sweep runs every 30 seconds. Sharing/discarding/replacing removes a draft sooner. Cooldowns retain owner IDs for five seconds and channel IDs for 60 seconds, with up to 30 seconds before sweeping. Expiry is enforced on access even before the sweep. All application RAM is lost on process restart; the host may retain swap/dumps. Operators can inspect their process memory. Capacity limits are documented in the README.

No application database, analytics, interaction content logs, DMs or third-party service integrations are used. The local `.env` stores the operator's bot token, application ID and server ID until the operator removes it. Never upload it. Package installation contacts npm; bot operation contacts Discord. The host's own backup/logging policies are outside this source code's control.

Discord receives submitted form data and messages under its own policies. Private interaction responses can outlive RAM drafts and can be dismissed in Discord. Public plans persist until deleted by Discord/server moderation. For draft removal choose Discard, open a replacement form, wait for expiry or ask the host operator to restart the process. For public message removal, contact server moderators. The bot does not request Manage Messages or provide a delete command. No bulk-export API or stored history is provided.

Before inviting users, the deploying operator must identify themselves and provide a reachable contact and privacy-policy link through their application profile/server information. Explain any additional hosting retention accurately. Do not submit credentials, personal rosters or sensitive information to the form. Security disclosures are described in SECURITY.md.

## Türkçe

KitQuarry yalnızca yapılandırılan sunucudaki açık komut, form ve düğme etkileşimlerini işler. Mesaj içeriği, durum, üye listesi veya ses olaylarına abone olmaz; ek veya dış bağlantı indirmez. Discord etkileşim metaverisi gönderebilir. SDK mesaj/kullanıcı/üye önbellekleri kapalıdır; sunucu, rol ve kanal bilgileri izin hesabı için SDK tarafından tutulur.

Taslak RAM'i rastgele taslak kimliği, sahibi/sunucu/kanal kimlikleri, dil, son süre ve form gönderildikten sonra malzeme planı ile özel yanıt kimliğini içerir. Ham malzeme metni ayrıca saklanmaz. Form açıldıktan beş dakika sonra süre dolar; temizlik 30 saniyede bir yapılır. Paylaşma, vazgeçme veya yeni form daha erken siler. Cooldown üye kimliğini beş saniye, kanal kimliğini 60 saniye ve temizlik için en fazla ek 30 saniye tutar. Süre dolması erişim anında da uygulanır. Yeniden başlatma uygulama RAM'ini siler; sistem swap/dump veya yedek tutabilir ve süreç sahibi RAM'i görebilir.

Veritabanı, analitik, kullanıcı girdisi günlüğü, DM veya dış servis entegrasyonu yoktur. Yerel `.env`, işletmecinin tokenını ve uygulama/sunucu kimliğini işletmeci silene kadar saklar; yüklemeyin. Kurulum npm'e, bot çalışması Discord'a bağlanır. Barındırma sisteminin yedek/günlük politikaları bu kaynak koddan bağımsızdır.

Discord form ve mesaj verisini kendi politikasıyla alır. Özel yanıtlar RAM taslağından uzun yaşayabilir; istemciden kapatılabilir. Kamuya açık planlar Discord veya sunucu moderatörü silene kadar kalır. Taslak silmek için Vazgeç seçin, yeni form açın, süre dolmasını bekleyin veya süreç sahibinden yeniden başlatma isteyin. Kamuya açık mesajı silmek için moderatöre ulaşın. Bot Manage Messages istemez ve silme komutu sunmaz. Saklanan geçmiş veya toplu dışa aktarma API'si bulunmaz.

İşletmeci kullanıcı davet etmeden uygulama profili/sunucu bilgisinde kimliğini, ulaşılabilir iletişim yolunu ve gizlilik bağlantısını yayınlamalı; ek barındırma saklama koşullarını dürüstçe açıklamalıdır. Forma sır, kişisel katılımcı listesi veya hassas bilgi girmeyin. Güvenlik bildirimi için SECURITY.md'ye bakın.
