const Category = require('../models/Category');

exports.getCategories = async (req, res) => {
    const categories = await Category.find();
    res.json(categories);
};

exports.createCategory = async (req, res) => {
    const { name, slug } = req.body;
    const category = await Category.create({ name, slug });
    res.json(category);
};

exports.getCategoryBySlug = async (req, res) => {
    const category = await Category.findOne({ slug: req.params.slug });

    if (!category) {
        return res.status(404).json({ message: 'Kategori bulunamadı.' });
    }

    res.json(category);
};

exports.deleteCategory = async (req, res) => {
    const category = await Category.findByIdAndDelete(req.params.id);

    if (!category) {
        return res.status(404).json({ message: 'Kategori bulunamadı.' });
    }

    res.json({ message: 'Kategori silindi.' });
};
