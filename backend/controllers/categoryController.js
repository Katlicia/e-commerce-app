const Category = require("../models/Category");

exports.getCategories = async (req, res) => {
  const all = await Category.find().lean();

  const map = {};
  all.forEach((c) => {
    map[c._id] = { ...c, children: [] };
  });

  const tree = [];
  all.forEach((c) => {
    if (c.parent) {
      map[c.parent]?.children.push(map[c._id]);
    } else {
      tree.push(map[c._id]);
    }
  });

  res.json(tree);
};

exports.getRootCategories = async (req, res) => {
  const categories = await Category.find({ parent: null });
  res.json(categories);
};

exports.getChildren = async (req, res) => {
  const parent = await Category.findOne({ slug: req.params.slug });
  if (!parent) return res.status(404).json({ message: "Kategori bulunamadı." });

  const children = await Category.find({ parent: parent._id });
  res.json(children);
};

exports.getCategoryBySlug = async (req, res) => {
  const category = await Category.findOne({ slug: req.params.slug }).populate(
    "parent",
  );
  if (!category)
    return res.status(404).json({ message: "Kategori bulunamadı." });
  res.json(category);
};

exports.createCategory = async (req, res) => {
  const { name, slug, parent } = req.body;

  let parentId = null;
  if (parent) {
    const parentDoc = await Category.findOne({ slug: parent });
    if (!parentDoc)
      return res.status(404).json({ message: "Parent kategori bulunamadı." });
    parentId = parentDoc._id;
  }

  const category = await Category.create({ name, slug, parent: parentId });
  res.json(category);
};

exports.deleteCategory = async (req, res) => {
  const category = await Category.findByIdAndDelete(req.params.id);
  if (!category)
    return res.status(404).json({ message: "Kategori bulunamadı." });

  await Category.deleteMany({ parent: req.params.id });

  res.json({ message: "Kategori ve alt kategorileri silindi." });
};
