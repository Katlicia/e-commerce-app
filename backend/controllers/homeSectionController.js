const HomeSection = require("../models/HomeSection");
const HomeLayout = require("../models/HomeLayout");
const cloudinary = require("cloudinary").v2;

const DEFAULTS = [
  {
    key: "deals",
    title: "Kaçırılmayacak Fırsatlar",
    badge: "indirimli",
    showTimer: true,
  },
  { key: "new", title: "Yeni Gelenler", badge: "yeni", showTimer: false },
  {
    key: "featured",
    title: "Önerilen Ürünler",
    badge: "en-cok-satan",
    showTimer: false,
  },
  { key: "recent", title: "Son Gezdiğin Ürünler", badge: "", showTimer: false },
  {
    key: "categoryRow-1",
    title: "Kategori Satırı",
    left: { title: "Sol Kategori", filterType: "category", filterValue: "", banner: { public_id: "", url: "" } },
    right: { title: "Sağ Kategori", filterType: "category", filterValue: "", banner: { public_id: "", url: "" } },
  },
];

exports.getHomeSections = async (req, res) => {
  try {
    await Promise.all(
      DEFAULTS.map((def) =>
        HomeSection.findOneAndUpdate(
          { key: def.key },
          { $setOnInsert: def },
          { upsert: true },
        ),
      ),
    );
    const sections = await HomeSection.find({}).sort({ createdAt: 1 });
    res.json(sections);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const slugifyKey = (str) =>
  str
    .toLowerCase()
    .replace(/ğ/g, "g").replace(/ü/g, "u").replace(/ş/g, "s")
    .replace(/ı/g, "i").replace(/ö/g, "o").replace(/ç/g, "c")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

exports.deleteHomeSection = async (req, res) => {
  try {
    const { key } = req.params;
    const section = await HomeSection.findOne({ key });
    if (!section) return res.status(404).json({ message: "Bölüm bulunamadı." });

    if (section.banner?.public_id) await cloudinary.uploader.destroy(section.banner.public_id);
    if (section.left?.banner?.public_id) await cloudinary.uploader.destroy(section.left.banner.public_id);
    if (section.right?.banner?.public_id) await cloudinary.uploader.destroy(section.right.banner.public_id);

    await HomeSection.deleteOne({ key });

    const layout = await HomeLayout.findOne();
    if (layout) {
      layout.sections = layout.sections.filter((s) => s.sectionKey !== key);
      await layout.save();
    }

    res.json({ key });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createHomeSection = async (req, res) => {
  try {
    const { title, type = "product-list" } = req.body;
    if (!title?.trim()) return res.status(400).json({ message: "Başlık gerekli." });

    const isCategoryRow = type === "category-row";
    const prefix = isCategoryRow ? "categoryRow-" : "custom-";
    const key = prefix + slugifyKey(title.trim());

    const existing = await HomeSection.findOne({ key });
    if (existing) return res.status(409).json({ message: "Bu isimde zaten bir liste var." });

    const sectionData = isCategoryRow
      ? {
          key,
          title: title.trim(),
          left: { title: "Sol", filterType: "category", filterValue: "", banner: { public_id: "", url: "" } },
          right: { title: "Sağ", filterType: "category", filterValue: "", banner: { public_id: "", url: "" } },
        }
      : { key, title: title.trim(), badge: "", showTimer: false };

    const section = await HomeSection.create(sectionData);
    res.json(section);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const uploadBanner = async (newBanner, keepBanner, currentBanner, folder) => {
  if (keepBanner) return currentBanner || { public_id: "", url: "" };

  if (currentBanner?.public_id) {
    await cloudinary.uploader.destroy(currentBanner.public_id);
  }

  if (newBanner) {
    const result = await cloudinary.uploader.upload(newBanner, { folder });
    return { public_id: result.public_id, url: result.secure_url };
  }

  return { public_id: "", url: "" };
};

exports.updateHomeSection = async (req, res) => {
  try {
    const { key } = req.params;
    const {
      title,
      badge,
      showTimer,
      timerStart,
      timerEnd,
      keepBanner,
      newBanner,
      left,
      right,
    } = req.body;

    const current = await HomeSection.findOne({ key });

    const isCategoryRow = key.startsWith("categoryRow");

    let updateData;

    if (isCategoryRow) {
      const leftBanner = await uploadBanner(
        left?.newBanner,
        left?.keepBanner,
        current?.left?.banner,
        "home-sections",
      );
      const rightBanner = await uploadBanner(
        right?.newBanner,
        right?.keepBanner,
        current?.right?.banner,
        "home-sections",
      );

      updateData = {
        title,
        left: {
          title: left?.title || "",
          filterType: left?.filterType || "category",
          filterValue: left?.filterValue || "",
          banner: leftBanner,
        },
        right: {
          title: right?.title || "",
          filterType: right?.filterType || "category",
          filterValue: right?.filterValue || "",
          banner: rightBanner,
        },
      };
    } else {
      const banner = await uploadBanner(newBanner, keepBanner, current?.banner, "home-sections");

      updateData = { title, badge, showTimer, banner };
      if (timerStart) updateData.timerStart = new Date(timerStart);
      else updateData.timerStart = null;
      if (timerEnd) updateData.timerEnd = new Date(timerEnd);
      else updateData.timerEnd = null;
    }

    const section = await HomeSection.findOneAndUpdate({ key }, updateData, {
      upsert: true,
      returnDocument: "after",
    });

    res.json(section);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
