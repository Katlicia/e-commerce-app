const ListedProducts = require("../models/ListedProducts");

function computeTotals(doc) {
  const obj = doc.toObject ? doc.toObject() : { ...doc };

  let total = 0;
  for (const item of obj.products) {
    const p = item.product;
    if (!p || typeof p !== "object") continue;
    const basePrice = p.price || 0;
    total += basePrice * (item.quantity || 1);
  }

  const discount = obj.discountPercent || 0;
  const discountedTotal =
    discount > 0 ? +(total * (1 - discount / 100)).toFixed(2) : null;

  return { ...obj, total: +total.toFixed(2), discountedTotal };
}

exports.getAllListedProducts = async (req, res, next) => {
  try {
    const lists = await ListedProducts.find()
      .populate("products.product")
      .sort({ createdAt: -1 });
    res.json(lists.map(computeTotals));
  } catch (err) {
    next(err);
  }
};

exports.getListedProductsById = async (req, res, next) => {
  try {
    const list = await ListedProducts.findById(req.params.id).populate(
      "products.product",
    );
    if (!list) return res.status(404).json({ message: "Liste bulunamadı" });
    res.json(computeTotals(list));
  } catch (err) {
    next(err);
  }
};

exports.createListedProducts = async (req, res, next) => {
  try {
    const { name, products, discountPercent } = req.body;
    const list = await ListedProducts.create({
      name,
      products,
      discountPercent,
    });
    const populated = await ListedProducts.findById(list._id).populate(
      "products.product",
    );
    res.status(201).json(computeTotals(populated));
  } catch (err) {
    next(err);
  }
};

exports.updateListedProducts = async (req, res, next) => {
  try {
    const { name, products, discountPercent } = req.body;
    const list = await ListedProducts.findByIdAndUpdate(
      req.params.id,
      { name, products, discountPercent },
      { returnDocument: "after", runValidators: true },
    ).populate("products.product");
    if (!list) return res.status(404).json({ message: "Liste bulunamadı" });
    res.json(computeTotals(list));
  } catch (err) {
    next(err);
  }
};

exports.deleteListedProducts = async (req, res, next) => {
  try {
    const list = await ListedProducts.findByIdAndDelete(req.params.id);
    if (!list) return res.status(404).json({ message: "Liste bulunamadı" });
    res.json({ message: "Silindi" });
  } catch (err) {
    next(err);
  }
};
