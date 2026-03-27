const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config({ path: require("path").join(__dirname, "../.env") });

const Category = require("../models/Category");

const categoryTree = [
  {
    name: "Gıda ve Mutfak",
    slug: "gida-ve-mutfak",
    children: [
      {
        name: "Kahveler",
        slug: "kahveler",
        children: [
          { name: "Hazır Kahveler", slug: "hazir-kahveler" },
          { name: "Kapsül Kahveler", slug: "kapsul-kahveler" },
          { name: "Filtre Kahveler", slug: "filtre-kahveler" },
          { name: "Türk Kahvesi", slug: "turk-kahvesi" },
          { name: "Soğuk Kahve", slug: "soguk-kahve" },
        ],
      },
      {
        name: "Çaylar",
        slug: "caylar",
        children: [
          { name: "Siyah Çay", slug: "siyah-cay" },
          { name: "Bitki Çayları", slug: "bitki-caylari" },
          { name: "Yeşil Çay", slug: "yesil-cay" },
          { name: "Meyve Çayı", slug: "meyve-cayi" },
          { name: "Çay Bardağı & Aksesuar", slug: "cay-bardagi-aksesuar" },
        ],
      },
      {
        name: "Atıştırmalıklar",
        slug: "atistirmaliklar",
        children: [
          { name: "Çikolata", slug: "cikolata" },
          { name: "Bisküvi & Kek", slug: "biskuvi-kek" },
          { name: "Kuruyemiş", slug: "kuruyemis" },
          { name: "Cips & Kraker", slug: "cips-kraker" },
          { name: "Şekerleme & Gofret", slug: "sekerleme-gofret" },
        ],
      },
      {
        name: "Kahvaltılık",
        slug: "kahvaltilik",
        children: [
          { name: "Bal & Reçel", slug: "bal-recel" },
          { name: "Peynir", slug: "peynir" },
          { name: "Zeytin", slug: "zeytin" },
          { name: "Tahıl & Müsli", slug: "tahil-musli" },
        ],
      },
      {
        name: "Makarna & Pirinç",
        slug: "makarna-pirinc",
        children: [
          { name: "Makarna", slug: "makarna" },
          { name: "Pirinç & Bulgur", slug: "pirinc-bulgur" },
          { name: "Bakliyat", slug: "bakliyat" },
        ],
      },
      {
        name: "Sos & Baharat",
        slug: "sos-baharat",
        children: [
          { name: "Ketçap & Mayonez", slug: "ketchap-mayonez" },
          { name: "Zeytinyağı & Sıvıyağ", slug: "zeytinyagi-siviyag" },
          { name: "Baharat", slug: "baharat" },
          { name: "Sirke", slug: "sirke" },
        ],
      },
      {
        name: "İçecekler",
        slug: "icecekler",
        children: [
          { name: "Su & Soda", slug: "su-soda" },
          { name: "Meyve Suyu", slug: "meyve-suyu" },
          { name: "Enerji İçeceği", slug: "enerji-icecegi" },
          { name: "Gazlı İçecek", slug: "gazli-icecek" },
        ],
      },
    ],
  },
  {
    name: "Temizlik Ürünleri",
    slug: "temizlik-urunleri",
    children: [
      {
        name: "Çamaşır",
        slug: "camasir",
        children: [
          { name: "Çamaşır Deterjanı", slug: "camasir-deterjani" },
          { name: "Yumuşatıcı", slug: "yumusatici" },
          { name: "Çamaşır Suyu", slug: "camasir-suyu" },
          { name: "Leke Çıkarıcı", slug: "leke-cikarici" },
        ],
      },
      {
        name: "Bulaşık",
        slug: "bulasik",
        children: [
          { name: "Bulaşık Deterjanı", slug: "bulasik-deterjani" },
          {
            name: "Bulaşık Makinesi Tableti",
            slug: "bulasik-makinesi-tableti",
          },
          { name: "Parlatıcı & Tuz", slug: "parlatici-tuz" },
        ],
      },
      {
        name: "Ev Temizliği",
        slug: "ev-temizligi",
        children: [
          { name: "Yüzey Temizleyici", slug: "yuzey-temizleyici" },
          { name: "Cam Temizleyici", slug: "cam-temizleyici" },
          { name: "Kireç & Pas Çözücü", slug: "kirec-pas-cozucu" },
          { name: "Tuvalet Temizleyici", slug: "tuvalet-temizleyici" },
        ],
      },
      {
        name: "Kağıt Ürünleri",
        slug: "kagit-urunleri",
        children: [
          { name: "Tuvalet Kağıdı", slug: "tuvalet-kagidi" },
          { name: "Kağıt Havlu", slug: "kagit-havlu" },
          { name: "Islak Mendil", slug: "islak-mendil" },
          { name: "Peçete", slug: "pecete" },
        ],
      },
    ],
  },
  {
    name: "Kişisel Bakım",
    slug: "kisisel-bakim",
    children: [
      {
        name: "Cilt Bakımı",
        slug: "cilt-bakimi",
        children: [
          { name: "Yüz Temizleyici", slug: "yuz-temizleyici" },
          { name: "Nemlendirici", slug: "nemlendirici" },
          { name: "Güneş Kremi", slug: "gunes-kremi" },
          { name: "Serum & Ampul", slug: "serum-ampul" },
          { name: "Göz Kremi", slug: "goz-kremi" },
        ],
      },
      {
        name: "Saç Bakımı",
        slug: "sac-bakimi",
        children: [
          { name: "Şampuan", slug: "sampuan" },
          { name: "Saç Kremi", slug: "sac-kremi" },
          { name: "Saç Maskesi", slug: "sac-maskesi" },
          { name: "Saç Şekillendirici", slug: "sac-sekillendirici" },
        ],
      },
      {
        name: "Ağız Bakımı",
        slug: "agiz-bakimi",
        children: [
          { name: "Diş Macunu", slug: "dis-macunu" },
          { name: "Diş Fırçası", slug: "dis-fircasi" },
          { name: "Ağız Gargarası", slug: "agiz-gargarasi" },
        ],
      },
      {
        name: "Deodorant & Parfüm",
        slug: "deodorant-parfum",
        children: [
          { name: "Erkek Deodorant", slug: "erkek-deodorant" },
          { name: "Kadın Deodorant", slug: "kadin-deodorant" },
          { name: "Roll-On", slug: "roll-on" },
        ],
      },
      {
        name: "Traş Ürünleri",
        slug: "tras-urunleri",
        children: [
          { name: "Traş Jeli & Köpüğü", slug: "tras-jeli-kopugu" },
          { name: "Traş Bıçağı & Makinesi", slug: "tras-bicagi-makinesi" },
          { name: "Tıraş Sonrası Bakım", slug: "tras-sonrasi-bakim" },
        ],
      },
    ],
  },
  {
    name: "Ev ve Yaşam",
    slug: "ev-ve-yasam",
    children: [
      {
        name: "Mutfak Gereçleri",
        slug: "mutfak-gerecleri",
        children: [
          { name: "Pişirme Kapları", slug: "pisirme-kaplari" },
          { name: "Bıçak & Kesme Tahtası", slug: "bicak-kesme-tahtasi" },
          { name: "Depolama Kapları", slug: "depolama-kaplari" },
          { name: "Kahve Makinesi Aksesuar", slug: "kahve-makinesi-aksesuar" },
        ],
      },
      {
        name: "Banyo & Tuvalet",
        slug: "banyo-tuvalet",
        children: [
          { name: "Havlu & Bornoz", slug: "havlu-bornoz" },
          { name: "Duş Başlığı", slug: "dus-basligi" },
          { name: "Banyo Aksesuarları", slug: "banyo-aksesuarlari" },
        ],
      },
      {
        name: "Aydınlatma",
        slug: "aydinlatma",
        children: [
          { name: "LED Ampul", slug: "led-ampul" },
          { name: "Masa Lambası", slug: "masa-lambasi" },
          { name: "Gece Lambası", slug: "gece-lambasi" },
        ],
      },
      {
        name: "Dekorasyon",
        slug: "dekorasyon",
        children: [
          { name: "Çerçeve & Tablo", slug: "cerceve-tablo" },
          { name: "Mum & Difüzör", slug: "mum-difuzor" },
          { name: "Vazo & Saksı", slug: "vazo-saksi" },
        ],
      },
    ],
  },
  {
    name: "Ofis ve Kırtasiye",
    slug: "ofis-ve-kirtasiye",
    children: [
      {
        name: "Yazı Araçları",
        slug: "yazi-araclari",
        children: [
          { name: "Kalem", slug: "kalem" },
          { name: "Defter & Bloknot", slug: "defter-bloknot" },
          { name: "Ajanda & Planlayıcı", slug: "ajanda-planayici" },
        ],
      },
      {
        name: "Baskı & Fotokopi",
        slug: "baski-fotokopi",
        children: [
          { name: "Yazıcı Kartuşu", slug: "yazici-kartusu" },
          { name: "Fotokopi Kağıdı", slug: "fotokopi-kagidi" },
          { name: "Etiket", slug: "etiket" },
        ],
      },
      {
        name: "Ambalaj & Depolama",
        slug: "ambalaj-depolama",
        children: [
          { name: "Karton Kutu", slug: "karton-kutu" },
          { name: "Bant & Yapıştırıcı", slug: "bant-yapistirici" },
          { name: "Dosya & Klasör", slug: "dosya-klasor" },
        ],
      },
    ],
  },
  {
    name: "Bebek ve Çocuk",
    slug: "bebek-ve-cocuk",
    children: [
      {
        name: "Bebek Bezi & Mendil",
        slug: "bebek-bezi-mendil",
        children: [
          { name: "Bebek Bezi", slug: "bebek-bezi" },
          { name: "Islak Mendil", slug: "bebek-islak-mendil" },
          { name: "Emzirme Ürünleri", slug: "emzirme-urunleri" },
        ],
      },
      {
        name: "Bebek Gıdası",
        slug: "bebek-gidasi",
        children: [
          { name: "Mama", slug: "mama" },
          { name: "Bebek Bisküvisi", slug: "bebek-biskuvisi" },
          { name: "Bebek Suyu", slug: "bebek-suyu" },
        ],
      },
      {
        name: "Bebek Bakım",
        slug: "bebek-bakim",
        children: [
          { name: "Şampuan & Banyo", slug: "bebek-sampuan-banyo" },
          { name: "Pişik Kremi", slug: "pisik-kremi" },
          { name: "Bebek Losyonu", slug: "bebek-losyonu" },
        ],
      },
      {
        name: "Oyuncak",
        slug: "oyuncak",
        children: [
          { name: "Eğitici Oyuncak", slug: "egitici-oyuncak" },
          { name: "Peluş Oyuncak", slug: "pelus-oyuncak" },
          { name: "Yapboz & Puzzle", slug: "yapboz-puzzle" },
        ],
      },
    ],
  },
  {
    name: "Spor ve Outdoor",
    slug: "spor-ve-outdoor",
    children: [
      {
        name: "Fitness",
        slug: "fitness",
        children: [
          { name: "Protein & Supplement", slug: "protein-supplement" },
          { name: "Spor Ekipmanı", slug: "spor-ekipman" },
          { name: "Spor Çantası", slug: "spor-cantasi" },
        ],
      },
      {
        name: "Outdoor",
        slug: "outdoor",
        children: [
          { name: "Kamp Malzemeleri", slug: "kamp-malzemeleri" },
          { name: "Bisiklet Aksesuar", slug: "bisiklet-aksesuar" },
          { name: "Yürüyüş & Tırmanış", slug: "yuruyus-tirmanis" },
        ],
      },
    ],
  },
  {
    name: "Pet Shop",
    slug: "pet-shop",
    children: [
      {
        name: "Kedi",
        slug: "kedi",
        children: [
          { name: "Kedi Maması", slug: "kedi-mamasi" },
          { name: "Kedi Kumu", slug: "kedi-kumu" },
          { name: "Kedi Oyuncağı", slug: "kedi-oyuncagi" },
          { name: "Kedi Bakım", slug: "kedi-bakim" },
        ],
      },
      {
        name: "Köpek",
        slug: "kopek",
        children: [
          { name: "Köpek Maması", slug: "kopek-mamasi" },
          { name: "Köpek Tasması & Gezdirme", slug: "kopek-tasmasi-gezdirme" },
          { name: "Köpek Oyuncağı", slug: "kopek-oyuncagi" },
        ],
      },
      {
        name: "Kuş & Balık",
        slug: "kus-balik",
        children: [
          { name: "Kuş Yemi", slug: "kus-yemi" },
          { name: "Balık Yemi", slug: "balik-yemi" },
          { name: "Akvaryum Aksesuar", slug: "akvaryum-aksesuar" },
        ],
      },
    ],
  },
];

async function insertTree(nodes, parentId = null) {
  for (const node of nodes) {
    const { children, ...data } = node;
    const doc = await Category.create({ ...data, parent: parentId });
    if (children && children.length > 0) {
      await insertTree(children, doc._id);
    }
  }
}

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("MongoDB bağlandı.");

  await insertTree(categoryTree);

  const count = await Category.countDocuments();
  console.log(`${count} kategori eklendi.`);

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err);
  console.log(process.env.MONGO_URI);
  process.exit(1);
});
