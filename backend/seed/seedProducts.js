const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");
dotenv.config({ path: path.join(__dirname, "../.env") });

const Product = require("../models/Product");
const Category = require("../models/Category");
const User = require("../models/User");

const img = (id) => ({
  public_id: `seed_${id}`,
  url: `https://picsum.photos/seed/${id}/400/400`,
});

// Her ürün: { name, description, price, oldPrice?, stock, rating, badge? }
const productsBySlug = {
  "hazir-kahveler": [
    {
      name: "Nescafé Classic 200g",
      description: "Klasik çözünür kahve, yoğun aroma.",
      price: 89.9,
      stock: 150,
      rating: 4,
      badge: "en-cok-satan",
      features: ["Çözünür kahve", "200g", "Yoğun aroma"],
      brand: "Nescafé",
      reviews: [
        {
          name: "Ahmet Y.",
          comment: "Çok güzel bir kahve, her sabah içiyorum.",
          rating: 5,
        },
        {
          name: "Zeynep K.",
          comment: "Aroması harika, fiyatına göre kaliteli.",
          rating: 4,
        },
        {
          name: "Murat D.",
          comment: "Beklentimi karşıladı, tavsiye ederim.",
          rating: 4,
        },
      ],
    },
    {
      name: "Jacobs Monarch 200g",
      description: "Yumuşak ve dengeli tat.",
      price: 99.9,
      stock: 120,
      rating: 5,
      reviews: [
        {
          name: "Selin A.",
          comment: "Şimdiye kadar içtiğim en iyi hazır kahve.",
          rating: 5,
        },
        {
          name: "Emre T.",
          comment: "Yumuşak tadı çok hoş, ikinci paketi aldım.",
          rating: 5,
        },
      ],
    },
    {
      name: "Nescafé 3ü1 Arada 48'li",
      description: "Pratik hazır kahve poşetleri.",
      price: 74.9,
      stock: 200,
      rating: 4,
      badge: "indirimli",
      discountPercent: 15,
    },
    {
      name: "Douwe Egberts 200g",
      description: "Hollanda usulü zengin kahve.",
      price: 119.9,
      stock: 80,
      rating: 4,
    },
    {
      name: "Ülker İce Coffee 250ml",
      description: "Soğuk servis hazır kahve.",
      price: 29.9,
      stock: 300,
      rating: 3,
    },
  ],
  "kapsul-kahveler": [
    {
      name: "Nespresso Kazaar 10'lu",
      description: "Yoğun yoğunluk 12, çift espresso.",
      price: 139.9,
      stock: 90,
      rating: 5,
      badge: "yeni",
    },
    {
      name: "Dolce Gusto Americano 16'lı",
      description: "Uzun filtre tarzı kahve.",
      price: 119.9,
      stock: 100,
      rating: 4,
    },
    {
      name: "Starbucks by Nespresso Pike Place 10'lu",
      description: "Seattle usulü kavurma.",
      price: 159.9,
      stock: 60,
      rating: 5,
    },
    {
      name: "L'OR Espresso Splendente 10'lu",
      description: "Altın kavurma, velvet aromalı.",
      price: 129.9,
      stock: 75,
      rating: 4,
    },
  ],
  "turk-kahvesi": [
    {
      name: "Mehmet Efendi 500g",
      description: "Geleneksel Türk kahvesi, taze çekilmiş.",
      price: 119.9,
      stock: 200,
      rating: 5,
      badge: "en-cok-satan",
    },
    {
      name: "Kurukahveci Mehmet Efendi 250g",
      description: "İnce çekim, köpüklü Türk kahvesi.",
      price: 64.9,
      stock: 180,
      rating: 5,
    },
    {
      name: "Hacı Muharrem 500g",
      description: "Doğal yöntemlerle kavrulmuş.",
      price: 109.9,
      stock: 120,
      rating: 4,
    },
    {
      name: "Selamlique Damla Sakızlı 125g",
      description: "Sakız aromalı özel harmanlama.",
      price: 79.9,
      stock: 90,
      rating: 4,
      badge: "yeni",
    },
  ],
  "siyah-cay": [
    {
      name: "Çaykur Rize Turist 1kg",
      description: "Rize'nin en taze siyah çayı.",
      price: 149.9,
      stock: 250,
      rating: 5,
      badge: "en-cok-satan",
    },
    {
      name: "Doğuş Çay 1kg",
      description: "Kıvamında demlenen siyah çay.",
      price: 139.9,
      stock: 200,
      rating: 4,
    },
    {
      name: "Lipton Yellow Label 500g",
      description: "Dünya çapında sevilen siyah çay.",
      price: 99.9,
      stock: 160,
      rating: 4,
    },
    {
      name: "Çaykur Altın Yıldız 500g",
      description: "Premium seçim siyah çay.",
      price: 89.9,
      stock: 140,
      rating: 4,
    },
  ],
  "bitki-caylari": [
    {
      name: "Doğadan Ihlamur 20'li",
      description: "Doğal kurutulmuş ıhlamur çiçeği.",
      price: 34.9,
      stock: 300,
      rating: 4,
    },
    {
      name: "Clipper Organik Papatya 20'li",
      description: "Sakinleştirici organik papatya.",
      price: 44.9,
      stock: 200,
      rating: 5,
      badge: "yeni",
    },
    {
      name: "Lipton Nane Limon 20'li",
      description: "Ferahlatıcı nane-limon karışımı.",
      price: 29.9,
      stock: 350,
      rating: 4,
    },
    {
      name: "Doğadan Zencefil-Limon 20'li",
      description: "Bağışıklık destekleyici karışım.",
      price: 37.9,
      stock: 250,
      rating: 5,
    },
  ],
  cikolata: [
    {
      name: "Milka Oreo 300g",
      description: "Sütlü çikolata içinde oreo parçaları.",
      price: 84.9,
      stock: 200,
      rating: 5,
      badge: "en-cok-satan",
      reviews: [
        {
          name: "Büşra M.",
          comment: "Çikolata sevenler için vazgeçilmez!",
          rating: 5,
        },
        {
          name: "Can Ö.",
          comment: "Oreo parçaları çok güzel dağılmış.",
          rating: 5,
        },
        { name: "Fatma S.", comment: "Çocuklar çok seviyor.", rating: 4 },
        {
          name: "Hakan R.",
          comment: "Fiyatı biraz yüksek ama lezzeti iyi.",
          rating: 4,
        },
      ],
    },
    {
      name: "Toblerone 360g",
      description: "İsviçre bademli bal nuga çikolatası.",
      price: 129.9,
      stock: 150,
      rating: 5,
    },
    {
      name: "Lindt Excellence %85 100g",
      description: "Yoğun bitter çikolata.",
      price: 79.9,
      stock: 120,
      rating: 4,
    },
    {
      name: "Ülker Çikolatalı Gofret 36'lı",
      description: "Çıtır gofret, çikolatalı kaplama.",
      price: 94.9,
      stock: 180,
      rating: 4,
      badge: "indirimli",
      discountPercent: 20,
    },
    {
      name: "Nestle KitKat 24'lü",
      description: "Break zamanı ikonik wafer.",
      price: 119.9,
      stock: 160,
      rating: 4,
    },
  ],
  "biskuvi-kek": [
    {
      name: "Ülker Altınbaşak Petit Beurre 6'lı",
      description: "Tereyağlı klasik bisküvi.",
      price: 54.9,
      stock: 300,
      rating: 4,
      badge: "en-cok-satan",
    },
    {
      name: "Eti Browni 24'lü",
      description: "Çikolatalı ıslak kek.",
      price: 89.9,
      stock: 200,
      rating: 5,
    },
    {
      name: "Ülker Yupo 12'li",
      description: "Kremalı sandviç bisküvi.",
      price: 64.9,
      stock: 250,
      rating: 4,
    },
    {
      name: "Eti Cin Zencefilli 400g",
      description: "Baharatlı zencefil bisküvisi.",
      price: 44.9,
      stock: 180,
      rating: 3,
    },
  ],
  kuruyemis: [
    {
      name: "Çerçi Antep Fıstığı 500g",
      description: "İç fıstık, taze kavurma.",
      price: 189.9,
      stock: 100,
      rating: 5,
      badge: "yeni",
    },
    {
      name: "Tadım Karışık Kuruyemiş 200g",
      description: "Badem, fındık, ceviz karışımı.",
      price: 99.9,
      stock: 150,
      rating: 4,
    },
    {
      name: "Dimes Kuru Kayısı 500g",
      description: "Malatya kurutulmuş kayısı.",
      price: 79.9,
      stock: 120,
      rating: 4,
    },
    {
      name: "Çerçi Fındık İçi 500g",
      description: "Karadeniz fındığı, doğal.",
      price: 149.9,
      stock: 90,
      rating: 5,
    },
  ],
  "camasir-deterjani": [
    {
      name: "Ariel Dağ Esintisi 6kg",
      description: "Leke çıkarma gücüyle bio formül.",
      price: 249.9,
      stock: 120,
      rating: 5,
      badge: "en-cok-satan",
    },
    {
      name: "Persil Power Jel 3lt",
      description: "Sıvı deterjan, beyazlar için.",
      price: 179.9,
      stock: 100,
      rating: 4,
    },
    {
      name: "Omo Active Renkliler 4kg",
      description: "Renklilere özel koruyucu formül.",
      price: 199.9,
      stock: 130,
      rating: 4,
      badge: "indirimli",
      discountPercent: 10,
    },
    {
      name: "Fairy Non Bio 2.5kg",
      description: "Hassas ciltler için nazik formül.",
      price: 169.9,
      stock: 90,
      rating: 4,
    },
  ],
  "bulasik-deterjani": [
    {
      name: "Fairy Platinum 65'li Tablet",
      description: "Yağ kesici platinum formül.",
      price: 219.9,
      stock: 150,
      rating: 5,
      badge: "en-cok-satan",
    },
    {
      name: "Finish All-in-1 Max 60'lı",
      description: "Parlatıcılı tuz katkılı tablet.",
      price: 199.9,
      stock: 130,
      rating: 5,
    },
    {
      name: "Pril Gold 750ml",
      description: "Sıvı bulaşık deterjanı.",
      price: 49.9,
      stock: 300,
      rating: 4,
    },
    {
      name: "Fairy Sıvı Limon 1350ml",
      description: "Ferah limon kokulu, yağ kesici.",
      price: 59.9,
      stock: 250,
      rating: 4,
    },
  ],
  "tuvalet-kagidi": [
    {
      name: "Selpak Tuvalet Kağıdı 32'li",
      description: "3 katlı, ultra yumuşak.",
      price: 189.9,
      stock: 200,
      rating: 5,
      badge: "en-cok-satan",
    },
    {
      name: "Orkid Bambu 32'li",
      description: "%100 bambu elyaflı, ekolojik.",
      price: 219.9,
      stock: 150,
      rating: 4,
      badge: "yeni",
    },
    {
      name: "İpek Tuvalet Kağıdı 48'li",
      description: "Ekonomik boy, çift katlı.",
      price: 169.9,
      stock: 180,
      rating: 4,
    },
  ],
  "kagit-havlu": [
    {
      name: "Selpak Kağıt Havlu 12'li",
      description: "2 katlı dayanıklı mutfak havlusu.",
      price: 129.9,
      stock: 200,
      rating: 5,
    },
    {
      name: "Lotus Kağıt Havlu 8'li",
      description: "Emici ve dayanıklı.",
      price: 99.9,
      stock: 180,
      rating: 4,
    },
    {
      name: "Papia Bambu Havlu 6'lı",
      description: "Bambu içerikli, çevre dostu.",
      price: 119.9,
      stock: 140,
      rating: 4,
      badge: "yeni",
    },
  ],
  sampuan: [
    {
      name: "Pantene Pro-V 700ml",
      description: "Keratin güçlendirici formül.",
      price: 99.9,
      stock: 200,
      rating: 5,
      badge: "en-cok-satan",
      reviews: [
        {
          name: "Deniz A.",
          comment: "Saçlarım çok yumuşadı, kesinlikle tavsiye ederim.",
          rating: 5,
        },
        {
          name: "Gizem Y.",
          comment: "Kokusu harika, uzun süre devam ediyor.",
          rating: 5,
        },
        { name: "Serkan B.", comment: "Oldukça kaliteli bir ürün.", rating: 4 },
      ],
    },
    {
      name: "Head & Shoulders Mentol 550ml",
      description: "Kepek karşıtı, ferahlatıcı mentol.",
      price: 89.9,
      stock: 180,
      rating: 4,
    },
    {
      name: "Dove Besleyici 600ml",
      description: "Kuru saçlar için nem desteği.",
      price: 94.9,
      stock: 160,
      rating: 4,
    },
    {
      name: "Elvive Extraordinary Oil 600ml",
      description: "Olağanüstü parlak saçlar.",
      price: 104.9,
      stock: 140,
      rating: 4,
      badge: "indirimli",
      discountPercent: 25,
    },
  ],
  "dis-macunu": [
    {
      name: "Signal White Now 75ml",
      description: "Anında beyazlık etkisi.",
      price: 44.9,
      stock: 300,
      rating: 4,
    },
    {
      name: "Colgate Total 75ml",
      description: "12 saatlik ağız koruma.",
      price: 39.9,
      stock: 350,
      rating: 5,
      badge: "en-cok-satan",
      reviews: [
        {
          name: "Ayşe K.",
          comment: "Ağzım sabah akşam tertemiz hissettiriyor.",
          rating: 5,
        },
        {
          name: "Berk D.",
          comment: "Uzun süredir kullanıyorum, bırakamıyorum.",
          rating: 5,
        },
      ],
    },
    {
      name: "Sensodyne Repair & Protect 75ml",
      description: "Hassas dişler için özel formül.",
      price: 69.9,
      stock: 200,
      rating: 5,
    },
    {
      name: "Oral-B 3D White 75ml",
      description: "Diş minesini güçlendiren beyazlık.",
      price: 54.9,
      stock: 250,
      rating: 4,
    },
  ],
  nemlendirici: [
    {
      name: "Nivea Soft 200ml",
      description: "Hafif doku, anında emilim.",
      price: 89.9,
      stock: 200,
      rating: 5,
      badge: "en-cok-satan",
    },
    {
      name: "Cetaphil Nemlendirici 250ml",
      description: "Hassas ve kuru ciltler için.",
      price: 149.9,
      stock: 120,
      rating: 5,
    },
    {
      name: "Neutrogena Hydro Boost 50ml",
      description: "Hyalüronik asit bazlı jel krem.",
      price: 219.9,
      stock: 90,
      rating: 5,
      badge: "yeni",
    },
    {
      name: "Aveeno Daily Moisturizer 354ml",
      description: "Yulaf içerikli, besleyici formül.",
      price: 179.9,
      stock: 100,
      rating: 4,
    },
  ],
  kalem: [
    {
      name: "BIC Cristal 10'lu Tükenmez",
      description: "Klasik şeffaf gövde, mavi mürekkep.",
      price: 24.9,
      stock: 500,
      rating: 5,
      badge: "en-cok-satan",
    },
    {
      name: "Staedtler Triplus Fineliner 10'lu",
      description: "İnce uçlu, canlı renkler.",
      price: 89.9,
      stock: 200,
      rating: 5,
    },
    {
      name: "Pilot G2 Jel Kalem 12'li",
      description: "Akıcı jel mürekkep, ergonomik.",
      price: 74.9,
      stock: 250,
      rating: 5,
    },
    {
      name: "Faber-Castell Kurşun Kalem 12'li",
      description: "HB, kırılmaz uç teknolojisi.",
      price: 34.9,
      stock: 400,
      rating: 4,
    },
  ],
  "bebek-bezi": [
    {
      name: "Pampers Premium Care 4 Beden 60'lı",
      description: "Yumuşak iç yüzey, sızdırmaz.",
      price: 329.9,
      stock: 150,
      rating: 5,
      badge: "en-cok-satan",
      reviews: [
        {
          name: "Nilüfer A.",
          comment: "Bebeğim hiç kızarmadı, çok memnunuz.",
          rating: 5,
        },
        {
          name: "Tolga M.",
          comment: "Gece boyunca sızdırmıyor, harika.",
          rating: 5,
        },
        {
          name: "Esra B.",
          comment: "Biraz pahalı ama kalitesi iyi.",
          rating: 4,
        },
        { name: "Caner Y.", comment: "Her zaman Pampers alıyoruz.", rating: 5 },
      ],
    },
    {
      name: "Huggies Elite Soft 3 Beden 72'li",
      description: "Organik pamuk katmanlı.",
      price: 299.9,
      stock: 120,
      rating: 5,
    },
    {
      name: "Molfix Comfort 5 Beden 48'li",
      description: "Esnek bel bandı, gece konforu.",
      price: 249.9,
      stock: 130,
      rating: 4,
      badge: "indirimli",
      discountPercent: 18,
    },
    {
      name: "Bebedor Pants 4 Beden 44'lü",
      description: "Külot bez, aktif bebekler için.",
      price: 219.9,
      stock: 100,
      rating: 4,
    },
  ],
  "kedi-mamasi": [
    {
      name: "Royal Canin Indoor 2kg",
      description: "Ev kedileri için özel formül.",
      price: 279.9,
      stock: 100,
      rating: 5,
      badge: "en-cok-satan",
    },
    {
      name: "Whiskas Tavuklu 1.9kg",
      description: "Yetişkin kediler için dengeli beslenme.",
      price: 149.9,
      stock: 150,
      rating: 4,
    },
    {
      name: "Purina One Somonlu 1.5kg",
      description: "Omega-3 içerikli parlak tüy formülü.",
      price: 199.9,
      stock: 110,
      rating: 4,
      badge: "yeni",
    },
    {
      name: "Felix Pouch Çeşit Paketi 40'lı",
      description: "Poşet mama, karışık aromalı.",
      price: 229.9,
      stock: 90,
      rating: 4,
    },
  ],
  "okul-ve-kirtasiye": [
    {
      name: "Faber-Castell Sulu Boya 21 Renk Büyük Boy",
      description: "Profesyonel sulu boya seti, canlı renkler.",
      price: 89.9,
      stock: 200,
      rating: 5,
      badge: "en-cok-satan",
      reviews: [
        {
          name: "Elif S.",
          comment: "Renkler çok canlı, çocuğum çok sevdi.",
          rating: 5,
        },
        {
          name: "Onur K.",
          comment: "Fiyatına göre kalitesi oldukça iyi.",
          rating: 4,
        },
        {
          name: "Melis T.",
          comment: "Okulda kullanıyoruz, çok beğendik.",
          rating: 5,
        },
      ],
    },
    {
      name: "Staedtler Kurşun Kalem Seti 12'li",
      description: "HB, B ve 2B dereceli, kırılmaz uç.",
      price: 54.9,
      stock: 300,
      rating: 4,
    },
    {
      name: "Koh-i-Noor Pastel Boya 24 Renk",
      description: "Yumuşak pastel boya, kolay sürüm.",
      price: 119.9,
      stock: 150,
      rating: 5,
      badge: "yeni",
    },
    {
      name: "Maped Çift Taraflı Silgi",
      description: "Bir tarafı mürekkep, bir tarafı kurşun kalem için.",
      price: 14.9,
      stock: 500,
      rating: 4,
    },
    {
      name: "Pelikan A4 Resim Defteri 30 Yaprak",
      description: "120gr, spiralli resim defteri.",
      price: 44.9,
      stock: 250,
      rating: 4,
    },
    {
      name: "Crayola Keçeli Kalem 20'li",
      description: "Yıkanabilir canlı renkli keçeli kalemler.",
      price: 74.9,
      stock: 180,
      rating: 5,
      badge: "en-cok-satan",
    },
    {
      name: "Makas Yuvarlak Uçlu Çocuk 13cm",
      description: "Güvenli yuvarlak uç, ergonomik tutma yeri.",
      price: 24.9,
      stock: 400,
      rating: 4,
    },
    {
      name: "Artliner Cetvel Seti 6'lı",
      description: "Cetvel, gönye, iletki, pergel seti.",
      price: 34.9,
      stock: 350,
      rating: 4,
      badge: "indirimli",
      discountPercent: 12,
    },
    {
      name: "UHU Stick Yapıştırıcı 40g",
      description: "Kolay uygulama, iz bırakmaz.",
      price: 19.9,
      stock: 600,
      rating: 5,
    },
    {
      name: "Oxford Spiralli Defter A5 100 Yaprak",
      description: "Kareli, sert kapak, yırtılmaz halka.",
      price: 49.9,
      stock: 300,
      rating: 4,
    },
  ],
  temizlik: [
    {
      name: "Domestos Oksijen Etkili Sprey 750ml",
      description: "Banyo ve mutfak yüzeyleri için güçlü dezenfektan sprey.",
      price: 79.9,
      stock: 200,
      rating: 5,
      badge: "en-cok-satan",
    },
    {
      name: "Cif Krem Temizleyici Limon 500ml",
      description: "Yüzey çiziklerini önleyen krem formül, limon kokulu.",
      price: 54.9,
      stock: 250,
      rating: 4,
    },
    {
      name: "Febreze Kumaş Spreyi Bahar 500ml",
      description: "Kötü kokuları yok eden kumaş tazeleyici.",
      price: 89.9,
      stock: 180,
      rating: 4,
      badge: "yeni",
    },
    {
      name: "Mr. Muscle Mutfak Sprey 500ml",
      description: "Yağ ve kir için güçlü mutfak temizleyici.",
      price: 64.9,
      stock: 220,
      rating: 4,
    },
    {
      name: "Ariel Dağ Esintisi Sıvı Deterjan 1.5L",
      description: "Konsantre sıvı deterjan, renklilere ve beyazlara uygun.",
      price: 149.9,
      stock: 130,
      rating: 5,
      badge: "indirimli",
      discountPercent: 30,
    },
    {
      name: "Glorix Çamaşır Suyu Orijinal 1L",
      description: "Güçlü beyazlatma ve dezenfektan etkili.",
      price: 39.9,
      stock: 300,
      rating: 4,
    },
    {
      name: "Swiffer WetJet Yedek Bez 20'li",
      description: "Islak paspas için tek kullanımlık bez, toz ve kir toplar.",
      price: 119.9,
      stock: 150,
      rating: 5,
      badge: "en-cok-satan",
    },
    {
      name: "Pledge Ahşap Bakım Spreyi 250ml",
      description: "Ahşap yüzeyler için parlatıcı ve koruyucu sprey.",
      price: 74.9,
      stock: 160,
      rating: 4,
    },
    {
      name: "Scotch-Brite Bulaşık Süngeri 5'li",
      description: "Çift taraflı, yağ kesen yeşil ve sarı sünger.",
      price: 29.9,
      stock: 500,
      rating: 4,
    },
    {
      name: "Lysol Çok Amaçlı Temizleyici Lavanta 1L",
      description: "99.9% bakteri öldürücü, hoş lavanta koku.",
      price: 84.9,
      stock: 190,
      rating: 5,
      badge: "yeni",
    },
  ],
  "kopek-mamasi": [
    {
      name: "Royal Canin Medium Adult 4kg",
      description: "Orta irk köpekler için.",
      price: 379.9,
      stock: 80,
      rating: 5,
    },
    {
      name: "Pedigree Vitality+ 3kg",
      description: "Vitamin mineral destekli yetişkin maması.",
      price: 199.9,
      stock: 120,
      rating: 4,
      badge: "en-cok-satan",
    },
    {
      name: "Purina Pro Plan Medium 3kg",
      description: "Aktif köpekler için yüksek protein.",
      price: 329.9,
      stock: 90,
      rating: 5,
    },
    {
      name: "Cesar Pouch Mix 24'lü",
      description: "Poşet mama çeşit paketi.",
      price: 189.9,
      stock: 100,
      rating: 4,
    },
  ],
};

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("MongoDB bağlandı.");

  // Admin kullanıcıyı bul
  const adminUser = await User.findOne({ isAdmin: true });
  if (!adminUser) {
    console.error("Admin kullanıcı bulunamadı. Önce bir admin oluştur.");
    process.exit(1);
  }

  await Product.deleteMany({});
  console.log("Mevcut ürünler silindi.");

  let created = 0;
  let skipped = 0;

  for (const [slug, products] of Object.entries(productsBySlug)) {
    const category = await Category.findOne({ slug });
    if (!category) {
      console.warn(`Kategori bulunamadı: ${slug}`);
      skipped++;
      continue;
    }

    for (let i = 0; i < products.length; i++) {
      const p = products[i];
      await Product.create({
        name: p.name,
        description: p.description,
        price: p.price,
        stock: p.stock,
        rating: p.rating,
        badge: p.badge,
        discountPercent: p.discountPercent,
        brand: p.brand,
        features: p.features,
        descriptionImages: p.descriptionImages,
        category: category._id,
        user: adminUser._id,
        images: [img(`${slug}-${i}`)],
        reviews: (p.reviews || []).map((r) => ({ ...r, user: adminUser._id })),
      });
      created++;
    }
    console.log(`${category.name} → ${products.length} ürün`);
  }

  console.log(`\nToplam ${created} ürün eklendi. ${skipped} kategori atlandı.`);
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
