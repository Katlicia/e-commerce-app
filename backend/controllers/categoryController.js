const Category = require("../models/Category");

exports.getCategories = async (req, res) => {
  const all = await Category.find().lean();

  const map = {};
  all.forEach((c) => {
    map[c._id.toString()] = { ...c, children: [] };
  });

  const tree = [];
  all.forEach((c) => {
    if (c.parent) {
      const parentEntry = map[c.parent.toString()];
      if (parentEntry) {
        parentEntry.children.push(map[c._id.toString()]);
      } else {
        // parent not found (deleted or in a cycle) treat as root
        tree.push(map[c._id.toString()]);
      }
    } else {
      tree.push(map[c._id.toString()]);
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
  const category = await Category.create({
    name,
    slug,
    parent: parent || null,
  });
  res.json(category);
};

exports.updateCategory = async (req, res) => {
  const { name, slug, parent, subcategories } = req.body;

  let parentId = undefined;
  if (parent !== undefined) {
    parentId = parent || null;
  }

  const updateData = {};
  if (name !== undefined) updateData.name = name;
  if (slug !== undefined) updateData.slug = slug;
  if (parentId !== undefined) updateData.parent = parentId;

  const category = await Category.findByIdAndUpdate(req.params.id, updateData, {
    returnDocument: "after",
    runValidators: true,
  });
  if (!category)
    return res.status(404).json({ message: "Kategori bulunamadı." });

  // Subcategories
  if (Array.isArray(subcategories)) {
    const existingSubs = await Category.find({ parent: category._id });
    const incomingIds = subcategories.filter((s) => s._id).map((s) => s._id);

    //////
    for (const sub of existingSubs) {
      if (!incomingIds.includes(sub._id.toString())) {
        await Category.findByIdAndDelete(sub._id);
      }
    }

    // Update or create subcategories
    for (const sub of subcategories) {
      if (sub._id) {
        await Category.findByIdAndUpdate(
          sub._id,
          { name: sub.name, slug: sub.slug },
          { runValidators: true },
        );
      } else {
        await Category.create({
          name: sub.name,
          slug: sub.slug,
          parent: category._id,
        });
      }
    }
  }

  res.json({ message: "Kategori güncellendi" });
};

exports.deleteCategory = async (req, res) => {
  const category = await Category.findByIdAndDelete(req.params.id);
  if (!category)
    return res.status(404).json({ message: "Kategori bulunamadı." });

  await Category.deleteMany({ parent: req.params.id });

  res.json({ message: "Kategori ve alt kategorileri silindi." });
};
