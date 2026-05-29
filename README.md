# PAN URLA — Site Yenileme Projesi

`www.panurla.com` için hazırlanmış modern, hızlı ve responsive yenileme projesi.

## Çalıştırma

Statik dosyalardır — sadece `index.html`'i tarayıcıda aç.

Yerel sunucu istersen:
```bash
cd panurla-yeni
python -m http.server 8080
# http://localhost:8080
```

## Dosya Yapısı

```
panurla-yeni/
├── index.html              # Ana sayfa
├── pages/
│   ├── hakkimizda.html
│   ├── evler.html
│   ├── kirmizi-ev.html
│   ├── mavi-ev.html
│   ├── orman-evi.html
│   ├── galeri.html
│   └── iletisim.html
└── assets/
    ├── css/style.css       # Tek dosya, design system + komponentler
    └── js/main.js          # Header scroll, mobil menü, reveal anim.
```

## Yenilemede Öne Çıkanlar

- Tek statik full-bleed hero (eski 6'lı slider yerine)
- Ana sayfada müsaitlik widget'ı (tarih + kişi + ev seçimi)
- Kart bazlı ev gösterimi (kapasite/özellik rozetleri)
- Doğa paleti: orman yeşili + ahşap + krem
- Sticky WhatsApp baloncuğu
- Mobil hamburger menü
- Scroll'da reveal animasyonları
- Erişilebilirlik: 4.5:1 kontrast, 48px+ buton, focus-visible
- Tüm CTA'lar HotelRunner / WhatsApp / tel'e yönlenir

## Yayına Alma (Vercel)

Site statiktir, build gerekmez. `vercel.json` hazır (statik servis + asset cache + güvenlik başlıkları).

### A) Tek komut — CLI (en hızlı)
Bu klasörde bir terminal açıp:

```bash
npx vercel --prod
```

İlk çalıştırmada tarayıcıdan tek seferlik giriş ister, ardından canlı URL verir.

### B) GitHub + Vercel (otomatik deploy)
1. Bu klasörü bir GitHub reposuna gönderin.
2. vercel.com → Add New → Project → repoyu seçin → Deploy.
3. Sonraki her `git push` otomatik yeni deploy üretir.

> Not: `canonical`, OG ve `sitemap.xml` `https://www.panurla.com` adresine göre ayarlandı
> (yeni sitenin bu domaine taşınacağı varsayımıyla). Geçici Vercel URL'inde test için
> sorun olmaz; arama motorları canonical sayesinde içeriği panurla.com'a atfeder.
