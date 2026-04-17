const HomeLayout = require("../models/HomeLayout");
const HomeSection = require("../models/HomeSection");

const DEFAULT_SECTIONS = [
  { type: "featured-shortcuts", visible: true },
  { type: "product-list", sectionKey: "deals", visible: true },
  { type: "product-list", sectionKey: "new", visible: true },
  { type: "ad-banners", bannerType: "adbanner-1", visible: true },
  { type: "product-list", sectionKey: "featured", visible: true },
  { type: "category-row", sectionKey: "categoryRow-1", visible: true },
  { type: "ad-bar", visible: true },
  { type: "product-list", sectionKey: "recent", visible: true },
  { type: "ad-banners", bannerType: "adbanner-2", visible: true },
  { type: "deal-of-day", visible: true },
];

const ensureHomeSection = async (type, sectionKey) => {
  if (type !== "product-list" && type !== "category-row") return;
  if (!sectionKey) return;

  const exists = await HomeSection.findOne({ key: sectionKey });
  if (exists) return;

  const isCategoryRow = type === "category-row";

  await HomeSection.create(
    isCategoryRow
      ? {
          key: sectionKey,
          title: "Yeni Kategori Vitrini",
          left: {
            title: "Sol",
            filterType: "category",
            filterValue: "",
            banner: { public_id: "", url: "" },
          },
          right: {
            title: "Sağ",
            filterType: "category",
            filterValue: "",
            banner: { public_id: "", url: "" },
          },
        }
      : {
          key: sectionKey,
          title: "Yeni Ürün Listesi",
          badge: "",
          showTimer: false,
        },
  );
};

exports.getHomeLayout = async (req, res) => {
  try {
    let layout = await HomeLayout.findOne();

    if (!layout) {
      layout = await HomeLayout.create({ sections: DEFAULT_SECTIONS });
    }

    res.json(layout);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateHomeLayout = async (req, res) => {
  try {
    const { sections } = req.body;

    if (!Array.isArray(sections)) {
      return res.status(400).json({ message: "sections dizisi gerekli." });
    }

    await Promise.all(
      sections.map((s) => ensureHomeSection(s.type, s.sectionKey)),
    );

    let layout = await HomeLayout.findOne();

    if (!layout) {
      layout = await HomeLayout.create({ sections });
    } else {
      layout.sections = sections;
      await layout.save();
    }

    res.json(layout);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
