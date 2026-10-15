# Security / Güvenlik

Only the current main branch is maintained. Do not publish credentials or exploitable private details in public issues. If enabled, use GitHub's **Security → Report a vulnerability** private reporting. If unavailable, open an issue asking for a private reporting channel without technical exploit details. Operators should supply a reachable private security contact before deploying to others. There is no response-time guarantee.

If a bot token leaks, reset it in the Discord Developer Portal immediately, stop the process, replace private configuration and restart. Removing a Git commit does not revoke credentials. Review host/cloud backups and Discord app access. Keep Node 24 and dependencies updated; audit and run all checks before deploying changes. Run a single process without administrator permissions. Do not print environment variables or raw Discord errors in logs.

Yalnızca güncel main dalı bakımlıdır. Sırları veya istismar edilebilir özel ayrıntıları açık issue'ya koymayın. Varsa GitHub **Security → Report a vulnerability** özel bildirimini kullanın; yoksa teknik ayrıntı paylaşmadan özel iletişim kanalı isteyin. Başkalarına hizmet veren işletmeci ulaşılabilir özel güvenlik iletişimi sağlamalıdır. Yanıt süresi garantisi yoktur.

Token sızdıysa Portal'dan hemen sıfırlayın, süreci durdurun, özel yapılandırmayı değiştirip yeniden başlatın. Commit silmek tokenı iptal etmez. Barındırma/bulut yedeklerini ve uygulama erişimini kontrol edin. Node 24 ve bağımlılıkları güncel tutun, güncellemeden önce tüm kontrolleri çalıştırın. Tek süreci yönetici yetkisi olmadan kullanın; environment veya ham Discord hatalarını günlüğe yazmayın.
