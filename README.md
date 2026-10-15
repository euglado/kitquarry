# KitQuarry

[Türkçe](#türkçe) · [English](#english) · [Security](SECURITY.md) · [Privacy](PRIVACY.md) · [MIT](LICENSE)

KitQuarry is a real Discord Gateway bot for community workshop supply planning. Run `/kitquarry`, fill in a short form, review privately, then choose whether to share a plain-text plan in the same channel. The source is provided here; GitHub does not host the running bot for you.

## Türkçe

### Amaç ve özellikler

El işi, kodlama kulübü, maker buluşması veya gönüllü atölyesi için kaç tam malzeme paketi gerektiğini hesaplayın. Örneğin 24 katılımcı kiti ve 2 yedek kit için kit başına 2 kalem gerekiyorsa toplam 52 kalem gerekir. Paketler 12'li ise 5 paket alınır ve 8 kalem artar. Her malzeme ayrı hesaplanır; farklı malzemeler aynı pakette varsayılmaz.

- Türkçe/İngilizce form ve özel önizleme; dil Discord dilinizden seçilir, `/kitquarry language:English` ile değiştirilebilir.
- 1–500 katılımcı kiti, ayrıca 0–100 yedek kit; yüzde yerine açık yedek sayısı.
- 2–8 malzeme; her biri için kit başına 1–1000 adet ve pakette 1–1000 adet.
- Gerekli adet, yukarı yuvarlanan tam paket sayısı ve artan adet.
- **Bu kanalda paylaş** yalnızca sizin taslağınızı aynı kanala gönderir; **Vazgeç** paylaşmadan siler.
- Mesaj okuma, ayrıcalıklı intent, yönetici yetkisi, veritabanı ve DM gerekmez.

Bot mevcut stokları düşmez, fiyat/tedarikçi önermez, alışveriş yapmaz, kayıt veya katılımcı listesi tutmaz. Parça boyutu, ağırlık, sıvı miktarı, kesim yerleşimi, fire veya paket içi kalite hesabı yapmaz. Yalnızca aynı türden sayılabilir birimler içindir; örneğin her satırdaki kalemin aynı ürün olduğunu sizin doğrulamanız gerekir. Sağlık veya güvenlik açısından kritik malzeme planlaması için kullanılmamalıdır. Sonucu paylaşmadan önce kontrol edin.

### Gereksinimler

Windows, macOS veya Linux; [Node.js 24](https://nodejs.org/en/download) (npm dahil); internet; Discord hesabı ve bot ekleyebileceğiniz bir sunucu. Bu sürüm yalnızca Node 24'ü destekler. Kod düzenlemek gerekmez. Bir Discord uygulaması, onun bot tokenı ve tek bir sürekli çalışan bot süreci gerekir. Bu depo ortak, hazır çevrimiçi bir bot hizmeti sağlamaz. Kurulumun ağ bağlantısı npm paketlerini indirir; çalışma sırasında Discord Gateway/REST kullanılır.

### Developer Portal ve kurulum

1. [Discord Developer Portal](https://discord.com/developers/applications)'ı açın. **New Application** ile bu bot için ayrı bir uygulama oluşturun. **General Information** sayfasından **Application ID** değerini kopyalayın; bu, token değildir.
2. **Bot** sayfasına gidin; gerekiyorsa bot kullanıcısı oluşturun. **Reset Token** ile token alın ve yalnızca kendi bilgisayarınızdaki kurulum sorusuna girin. Tokenı bu sohbet, GitHub issue, ekran görüntüsü veya başkasının sitesiyle paylaşmayın. Sızdıysa aynı sayfadan hemen sıfırlayın. **Privileged Gateway Intents** altındaki Presence, Server Members ve Message Content seçeneklerini kapalı bırakın.
3. **Installation** sayfasında **Guild Install** kullanın. Varsayılan scopes: `bot`, `applications.commands`; bot permissions: yalnızca **View Channels** ve **Send Messages**. User Install gerekmez. **Interactions Endpoint URL** alanını boş bırakın; bot Gateway üzerinden çalışır. Uygulama size özel olacaksa herkese açık bot davetlerini kapatabilirsiniz.
4. Discord'da **User Settings → Advanced → Developer Mode** açın. Sunucu simgesine sağ tıklayıp **Copy Server ID** seçin. Sunucu kimliğini, kanal veya uygulama kimliğiyle karıştırmayın.
5. Bu depoda **Code → Download ZIP** seçip arşivi çıkarın. Node.js 24'ü kurduktan sonra terminali yeniden açın. Klasörü OneDrive benzeri paylaşılan bir alanda tutuyorsanız token dosyasının buluta eşitlenebileceğini unutmayın; tercihen özel yerel bir klasör kullanın.
6. Windows: `setup.cmd` dosyasını açın. macOS/Linux: klasörde terminal açıp `bash setup.sh` çalıştırın. Yardımcı kilitli bağımlılıkları install script çalıştırmadan kurar, TypeScript'i derler ve Application ID, Server ID ile tokenı sorar. Token yazılırken karakter gösterilmez. Kaynak kod düzenlenmez.
7. Kurulumun yazdığı **Invite / Davet** bağlantısını tarayıcıda açın; doğru sunucuyu seçip onaylayın. Kanal izinlerinde bota kanalı görme ve mesaj gönderme izni verildiğini doğrulayın. **Administrator** eklemeyin.
8. Windows: `register.cmd`; macOS/Linux: `bash register.sh`. Bu, yalnızca `/kitquarry` sunucu komutunu oluşturur/günceller; başka komutları silmez. Uygulama/token ve sunucu aynı kuruluma ait olmalı.
9. Windows: `start.cmd`; macOS/Linux: `bash start.sh`. “KitQuarry ready / hazır” görünene kadar bekleyin. Discord'da normal bir metin kanalında `/kitquarry` yazın.

Kurulum `.env` dosyasına token ve iki kimliği yazar; dosya Git tarafından yok sayılır. Unix'te yalnızca dosya sahibine okuma/yazma modu istenir; Windows'ta erişim NTFS ve hesap izinlerinize bağlıdır. Var olan `.env` üzerine yazılmaz. Token değiştirmek için botu durdurun, eski dosyayı güvenli şekilde başka yere taşıyın, kurulum yardımcısını tekrar çalıştırın; eski token sızmışsa önce Portal'dan sıfırlayın. Paylaşılan bilgisayarda `.env` ve terminal erişimini kısıtlayın. Node sürümü veya paket hatası kurulum sırasında durur; hatayı çözmeden sonraki adıma geçmeyin.

### Kullanım ve önizleme

1. `/kitquarry` çalıştırın, gerekirse `language` seçin.
2. Atölye adı, katılımcı kit sayısı, yedek kit sayısını girin. Yedek istemiyorsanız `0` yazın. Her malzeme satırını `ad | kit başına adet | paket içi adet` biçiminde girin. Örnek:

```text
Kalem | 2 | 12
Kart | 3 | 50
```

3. Gönderdiğinizde yalnızca sizin görebildiğiniz sonuç açılır. Sayılar tam sayı olmalı; ondalık, negatif, yüzde, virgüllü binlik sayı ve bilimsel gösterim kabul edilmez. Adlarda harf, sayı, boşluk ve `()'’.,+-` kullanılabilir; bağlantı, mention, Markdown ve görünmez yön kontrolü kabul edilmez. Başlık en fazla 60, malzeme adı 40 karakter; satır adları farklı olmalı. Formda malzemeler toplam en fazla 500 karakterdir.
4. **Bu kanalda paylaş** veya **Vazgeç** seçin. Önizleme açıldıktan sonra değil, **form ilk açıldıktan beş dakika sonra** taslak sona erer. Düzeltmek için yeniden `/kitquarry` çalıştırın; bu eski taslağınızı geçersiz kılar. Geçersiz form gönderimi sonrasında da yeni form açmanız gerekebilir.

Paylaşılan metin kanalı görebilen herkese görünür. Mention ve otomatik bağlantı önizlemeleri kapalıdır. Bot isim, kullanıcı etiketi veya kaynak önizleme bağlantısı eklemez. Paylaşım öncesinde rol, kanal, üye ve bot izinleri tekrar kontrol edilir. Sizde View Channel, Send Messages, Use Application Commands olmalı ve zaman aşımı aktif olmamalıdır. Sunucu yöneticileri Discord'un komut erişimi ayarlarından `/kitquarry` kullanımını daha da kısıtlayabilir.

### İzinler ve sınırlar

Yalnızca `Guilds` intent kullanılır; Message Content, Members veya Presence gerekmez. Davet izin değeri `3072` = View Channel + Send Messages. Manage Messages, Manage Server, Read Message History, Embed Links, Attach Files, Mention Everyone veya ses yetkileri istenmez. Normal sunucu metin kanalları desteklenir; DM, forum, thread, duyuru ve ses kanalları desteklenmez.

Üye başına beş saniyede bir form, kanalda 60 saniyede bir paylaşım; yavaş modu 60 saniyeden uzun kanallarda paylaşım engellenir. Üye başına tek taslak, süreçte en fazla 100 taslak ve her cooldown haritasında 1000 kayıt bulunur. Dolunca bot yeni işlemi reddeder; eski süreler bitince alan açılır. Belirsiz gönderim hatasında bot otomatik tekrar denemez: önce kanala bakın, yinelenen plan göndermeyin. Taslak tüketilir ve paylaşım aralığı korunur. Discord'un kendi ağ/rate-limit kuyruğu isteği geciktirebilir.

### Güvenlik, gizlilik ve sürekli çalışma

Bot sunucu/kanal/üye kimliklerini taslağı size bağlamak için geçici RAM'de tutar; başlık ve malzemeler önizleme aşamasında RAM'e alınır. En fazla beş dakikalık taslaklar 30 saniyelik temizlik turunda silinir, dolayısıyla fiziksel temizlik yaklaşık beş dakika 30 saniyeyi bulabilir. Paylaş/Vazgeç ve yeni form açma eski taslağı daha erken siler. Cooldown için üye kimliği beş saniye, kanal kimliği 60 saniye tutulur (temizlik turuna kadar ek 30 saniye kalabilir). Uygulama veri tabanı, analitik, DM veya kullanıcı girdisi günlükleri oluşturmaz. Süreç sahibi RAM'i görebilir; işletim sistemi swap/crash dump alabilir.

Discord form girdilerini ve mesajları kendi sisteminde alır; “özel” Discord'a veya bilgisayarı yöneten kişiye karşı gizli anlamına gelmez. Formlara kişisel bilgi, token veya başka sırlar girmeyin. Özel yanıtların Discord'daki ömrü RAM süresiyle aynı değildir; istemciden kapatabilirsiniz. Paylaşılan planlar RAM süresi bitince veya bot yeniden başlayınca silinmez; mesajı kaldırmak için sunucu moderatöründen yardım isteyin. Botun Manage Messages yetkisi yoktur ve silme komutu sağlamaz. Ayrıntılar ve silme yolları [PRIVACY.md](PRIVACY.md)'dedir. Kendi botunuzu başkalarına sunarken gerçek barındırma koşullarınızı, gizlilik politikanızı ve ulaşılabilir destek/silme iletişim yolunuzu yayınlayın; bu metni kurulumunuza göre doğrulayın.

Terminal açık, bilgisayar uyanık ve internet bağlı kaldıkça bot çalışır. Terminal kapanırsa veya bilgisayar uyursa çevrimdışı olur; bekleyen taslaklar yeniden başlatmada kaybolur. Sürekli kullanım için güvendiğiniz bir sunucuda Node 24 ve **tek süreç** çalıştırın; aynı token/sunucu için birden fazla kopya paylaşım aralığını aşabilir. İşletim sisteminin hizmet yöneticisini kullanabilir, çalışma klasörünü depo kökü yapabilir ve `npm start` komutunu çalıştırabilirsiniz. `.env` dosyasını özel tutun; herkese açık loglara environment dökümü göndermeyin. GitHub Actions yalnızca test yapar ve bot barındırmaz.

### Sorun giderme

- **Node bulunamadı / sürüm hatası:** Node.js 24 kurun, terminali kapatıp açın. `node --version` `v24...` göstermeli.
- **Kurulum etkileşimli terminal istiyor:** normal Terminal/PowerShell penceresinde yardımcıyı çalıştırın; pipe, notebook veya CI'da token girmeyin.
- **Komut görünmüyor:** doğru uygulamayı doğru sunucuya `bot` ve `applications.commands` scopes ile davet edin, `register` yardımcısını çalıştırın, Discord'u yenileyin. Üyenin Use Application Commands iznini ve Integrations komut kısıtlamalarını kontrol edin.
- **Bot çevrimdışı:** `start` terminalini açık tutun. Tokenı Portal'dan özel olarak doğrulayın; sızdıysa yenileyin. Gateway bağlantısı için internet/firewall kontrol edin, Interactions Endpoint URL'yi boş bırakın.
- **Paylaşılmadı:** normal metin kanalı, üye/bot kanal izinleri, üye zaman aşımı ve en fazla 60 saniyelik yavaş mod gerekir. İzinler önizlemeden sonra değişmiş olabilir; düzeltip yeni taslak açın.
- **Taslak geçersiz / etkileşim başarısız:** beş dakikalık süre, yeniden başlatma, yeni form veya ağ gecikmesi neden olabilir. Önce kanalı kontrol edin ve yeni form açın.
- **Hatalı malzeme:** 2–8 satır ve iki `|` ayırıcı kullanın. Tüm miktarlar tam sayı; her satır aynı sayılabilir birimi temsil etmeli.
- **npm indirme hatası:** bağlantı ve npm erişimini kontrol edin; doğrulanmamış paket aynası veya install-script açma gibi geçici çözümler uygulamayın. Tokenı yardım isteyen mesajlara eklemeyin.

### Testler, katkı ve lisans

Geliştirici kontrollerini token girmeden temiz kaynak klasöründe çalıştırın:

```sh
npm ci --ignore-scripts
npm run check
npm audit --audit-level=low
node --check scripts/setup.mjs
node --check scripts/run.mjs
node --check scripts/supply.mjs
bash -n setup.sh start.sh register.sh
```

`npm run check` Biome önerilen kuralları/biçimlendirmeyi, bağımlılık türleri dahil strict TypeScript derlemesini, Node testlerini ve kaynak/bağımlılık taramasını çalıştırır. Testler hesaplama sınırları, paket yuvarlaması, form akışı, gizli yanıtlar, tek kullanımlık paylaşım, izin değişimi, süresi dolan taslak ve cooldown gibi durumları sahte Discord etkileşimleriyle sınar. Kaynak taraması `.env` gibi özel dosya görürse bilerek durur; kontrolleri ayrı temiz checkout'ta çalıştırın. Bağımlılık kaynakları npm registry, SHA-512 bütünlüğü, izin verilen lisanslar ve install-script yokluğu için kontrol edilir. Gizli bilgi desen taraması bütün sırları tespit edemez.

CI Ubuntu, Windows ve macOS 15 Intel'de aynı kontrolleri çalıştırır; yalnızca `contents: read` izni ve SHA'ya sabitlenmiş Actions kullanır. CI için Discord tokenı gerekmez ve kullanılmaz. Otomatik testler gerçek Discord kurulumunu, gizli token girişini, mobil istemciyi, ekran okuyucuları veya sürekli barındırmayı doğrulamaz. Canlı kullanım öncesi kendi özel sunucunuzda bu akışları doğrulayın. [CONTRIBUTING.md](CONTRIBUTING.md) katkı sürecini, [SECURITY.md](SECURITY.md) güvenlik bildirimini anlatır. Kod [MIT](LICENSE) lisanslıdır; Discord ve bağımlılıkların koşulları ayrıca geçerlidir.

## English

### Purpose and features

Plan whole supply packs for craft workshops, maker meetings, clubs and volunteer events. For example, 24 participant kits plus 2 spare kits, with 2 pencils per kit, need 52 pencils. Packs of 12 require 5 whole packs, leaving 8 pencils. Materials are calculated independently; the bot does not assume different items come bundled together.

- Turkish/English form and private preview; defaults to your Discord language, with a `language` command option.
- 1–500 participant kits plus 0–100 explicitly chosen spare kits.
- 2–8 materials, each with 1–1000 units per kit and 1–1000 units per pack.
- Required units, rounded-up whole packs and leftover units for every material.
- Owner-bound **Share in this channel** and **Discard** controls.
- No message reading, privileged intents, administrator permissions, database or DMs.

KitQuarry does not deduct existing stock, suggest prices or vendors, buy supplies, track attendance or maintain inventory. It does not calculate dimensions, weight, liquids, cutting layouts, wastage or quality. Use each line for identical countable units, and verify that a pack really contains the stated quantity. It is not intended for health or safety-critical supply planning. Review every result before sharing.

### Requirements

Windows, macOS or Linux; [Node.js 24](https://nodejs.org/en/download) including npm; internet; a Discord account and a server where you can install a bot. This release supports Node 24 only. No source editing is required. You need your own Discord application, its bot token and one continuously running process. This repository does not provide a shared hosted bot. Setup downloads npm dependencies; runtime connects to Discord Gateway and REST.

### Developer Portal and installation

1. Open the [Discord Developer Portal](https://discord.com/developers/applications), choose **New Application**, and create a separate application for this bot. Copy its **Application ID** from **General Information**; this is not the token.
2. Open **Bot**, create the bot user if needed, and use **Reset Token** to obtain a token. Enter it only into the local setup prompt. Never send it to chat, GitHub issues, screenshots or someone else's website. Reset it immediately if exposed. Leave Presence, Server Members and Message Content **Privileged Gateway Intents** disabled.
3. Under **Installation**, use **Guild Install**, scopes `bot` and `applications.commands`, and only **View Channels** and **Send Messages** permissions. User Install is unnecessary. Leave **Interactions Endpoint URL** empty: this is a Gateway bot. You may disable public bot invitations if the application is only for your own use.
4. In Discord, enable **User Settings → Advanced → Developer Mode**. Right-click the server icon and choose **Copy Server ID**. Do not substitute a channel ID or Application ID.
5. Choose **Code → Download ZIP** here and extract it. Install Node.js 24 and reopen your terminal. Prefer a private local folder: cloud-synced/shared folders may upload your token file.
6. Windows: open `setup.cmd`. macOS/Linux: open a terminal in the folder and run `bash setup.sh`. The helper installs locked dependencies without install scripts, compiles TypeScript, and asks for Application ID, Server ID and a hidden token. Token characters are not displayed; no source changes are needed.
7. Open the printed **Invite** link in your browser, select the correct server, and authorize. Verify the bot can view and send in the chosen channel. Do not add **Administrator**.
8. Run `register.cmd` on Windows or `bash register.sh` on macOS/Linux. It creates/updates only the `/kitquarry` guild command and does not delete other commands. Use the application, token and server from the same installation.
9. Run `start.cmd` or `bash start.sh`. Wait for “KitQuarry ready / hazır”, then use `/kitquarry` in a regular server text channel.

Setup writes the token and IDs to gitignored `.env`. On Unix it requests owner-only file permissions; on Windows, NTFS and account access determine protection. It refuses to overwrite an existing `.env`. To change credentials, stop the bot, move the old file somewhere private and rerun setup. If a token leaked, reset it in the Portal first. Restrict file/terminal access on shared computers. Helpers stop on installation/build failure; fix the preceding error before proceeding.

### Configuration and usage

The wizard configures `DISCORD_TOKEN`, `APPLICATION_ID` and `GUILD_ID`; advanced hosts may provide those environment variables instead. One process serves one configured server. `/kitquarry` accepts an optional `language` of Turkish or English, otherwise it uses your Discord locale.

Enter a workshop name, participant kit count, explicit spare count (`0` for none), and 2–8 lines in this format:

```text
Pencil | 2 | 12
Card | 3 | 50
```

The columns are `name | units per kit | units per pack`. All quantities must be whole numbers: no negatives, decimals, thousands separators, percentages or scientific notation. Names accept letters, digits, spaces and `()'’.,+-`; mentions, links, Markdown and invisible direction controls are rejected. Titles are at most 60 characters, material names 40, and all material lines together at most 500 characters in the form. Material names must be distinct.

Submitting opens an ephemeral preview visible to you. **Share in this channel** posts the text where you invoked the command; **Discard** removes the draft without posting. The draft expires **five minutes after opening the form**, including time spent filling it in. Start a new command to correct a draft or invalid submission; doing so invalidates your earlier draft. The public message is visible to everyone who can view that channel. Mentions and automatic link previews are suppressed, and the bot adds no username or preview link.

### Permissions and limits

Only the `Guilds` intent is enabled. The invite bitfield `3072` grants View Channel and Send Messages. No Message Content, Members, Presence, Manage Messages, Manage Server, Read Message History, Embed Links, Attach Files, Mention Everyone or voice permissions are required. Users need View Channel, Send Messages and Use Application Commands, and must not be timed out. Administrators can further restrict the command through Discord integration settings.

Only regular server text channels are supported; no DMs, threads, forums, announcements or voice channels. Before sharing, role definitions, channel overwrites and both user/bot membership are fetched again. Channels with slowmode over 60 seconds are refused. A member can open a form every five seconds; a channel can receive a plan every 60 seconds, across members. There is one draft per member, a maximum of 100 drafts, and at most 1000 entries per cooldown map. Full maps refuse new work until entries expire. An ambiguous send failure consumes the draft and retains the cooldown without an application-level retry. Check the channel first before trying again. Discord's network/rate-limit queue can delay a request.

### Security, privacy and keeping the bot online

The bot keeps user/server/channel IDs temporarily in RAM to bind a draft, and stores the title/material plan while previewing. Five-minute drafts are swept every 30 seconds, so physical cleanup can take approximately five minutes 30 seconds. Sharing, discarding or replacing a draft removes it sooner. Member cooldown IDs last five seconds; channel cooldown IDs last 60 seconds, plus up to one cleanup interval. No application database, analytics, DMs or input logs are created. The host operator can inspect RAM; operating-system swap and crash dumps may retain it.

Discord receives form inputs and messages. “Private” does not mean hidden from Discord or the person operating the host. Do not enter personal details, credentials or other secrets. Discord's ephemeral message lifetime differs from RAM expiry; dismiss it in the client. Public plans remain after restart/expiry. Ask a server moderator to remove a public message; there is no deletion command and the bot has no Manage Messages permission. [PRIVACY.md](PRIVACY.md) describes the data and deletion paths. Operators offering the bot to others must publish an accurate privacy policy and reachable support/deletion contact for their actual hosting conditions.

The terminal must remain open, the computer awake and the network connected. Closing it or putting the computer to sleep takes the bot offline. Restarts lose pending drafts. For continuous use, run **one process** on a trusted Node 24 host with the repository as working directory and `npm start` as the command. An operating-system service manager can restart the process. Keep `.env` private and do not dump environment variables into public logs. Multiple copies for the same token/server can bypass in-memory cooldowns and are unsupported. GitHub Actions tests the source; it does not host the bot.

### Troubleshooting

- **Node missing/wrong version:** install Node.js 24, reopen your terminal and check that `node --version` starts with `v24`.
- **Interactive terminal required:** run setup in a normal Terminal/PowerShell window, not through a pipe, notebook or CI.
- **Command missing:** invite the correct application to the correct server with both scopes, run the registration helper and refresh Discord. Check Use Application Commands and integration restrictions.
- **Bot offline:** keep the start terminal open; check network/firewall access and credentials privately. Reset exposed tokens. Leave Interactions Endpoint URL empty.
- **Not shared:** check current user/bot view/send permissions, timeout and slowmode of at most 60 seconds; permissions may have changed after previewing. Correct them and open a new draft.
- **Invalid/expired draft:** expiry, restarting, replacing a form or network delay can cause this. Check the channel first, then start again.
- **Invalid materials:** use 2–8 lines with exactly two `|` separators per line and whole-number quantities for identical countable units.
- **npm download failed:** check network/npm access; avoid unverified mirrors or enabling install scripts as a workaround. Never include your token in support requests.

### Tests, contributions and license

Before entering credentials, in a clean source folder run:

```sh
npm ci --ignore-scripts
npm run check
npm audit --audit-level=low
node --check scripts/setup.mjs
node --check scripts/run.mjs
node --check scripts/supply.mjs
bash -n setup.sh start.sh register.sh
```

`npm run check` runs Biome's recommended lint/format rules, strict TypeScript including dependency types, Node tests, and supply/source scans. Tests use mocked Discord interactions for arithmetic boundaries, integer ceiling, modal flow, ephemeral responses, one-use sharing, changed permissions, expiry and cooldowns. The source scan intentionally refuses private files such as `.env`: use a separate clean checkout for development checks. Dependency checks cover npm registry sources, SHA-512 integrity, an approved license list and no install scripts. Pattern scans cannot detect every secret.

CI runs these checks on Ubuntu, Windows and macOS 15 Intel with read-only contents permission, SHA-pinned Actions and no Discord credentials. Automated checks do not validate a real Discord installation, hidden-token input, mobile clients, screen readers or continuous hosting. Validate those workflows in your own private server before live use. See [CONTRIBUTING.md](CONTRIBUTING.md) and [SECURITY.md](SECURITY.md). The code is [MIT licensed](LICENSE); Discord and dependency terms also apply.

### Official references / Resmî kaynaklar

- [Discord modal components and Labels](https://docs.discord.com/developers/components/using-modal-components)
- [Discord interactions](https://docs.discord.com/developers/interactions/receiving-and-responding)
- [Discord permissions](https://docs.discord.com/developers/topics/permissions)
- [Discord Developer Policy](https://support-dev.discord.com/hc/en-us/articles/8563934450327-Discord-Developer-Policy)
- [Discord Developer Terms](https://support-dev.discord.com/hc/en-us/articles/8562894815383-Discord-Developer-Terms-of-Service)
