const HomeSection = require("../models/HomeSection");
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
    const sections = await Promise.all(
      DEFAULTS.map((def) =>
        HomeSection.findOneAndUpdate(
          { key: def.key },
          { $setOnInsert: def },
          { upsert: true, returnDocument: 'after' },
        ),
      ),
    );
    res.json(sections);
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
