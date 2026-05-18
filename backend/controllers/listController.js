const List = require("../models/List");

exports.getLists = async (req, res, next) => {
  try {
    const lists = await List.find({ user: req.user._id })
      .populate("products")
      .sort({ createdAt: 1 });
    res.status(200).json(lists);
  } catch (err) {
    next(err);
  }
};

exports.createList = async (req, res, next) => {
  try {
    const { name } = req.body;
    const list = await List.create({ user: req.user._id, name });
    res.status(201).json(list);
  } catch (err) {
    next(err);
  }
};

exports.deleteList = async (req, res, next) => {
  try {
    const list = await List.findOne({
      _id: req.params.listId,
      user: req.user._id,
    });
    if (!list) return res.status(404).json({ message: "Liste bulunamadı" });
    await list.deleteOne();
    res.status(200).json({ message: "Liste silindi" });
  } catch (err) {
    next(err);
  }
};

exports.addProductToList = async (req, res, next) => {
  try {
    const { productId } = req.body;
    const list = await List.findOne({
      _id: req.params.listId,
      user: req.user._id,
    });
    if (!list) return res.status(404).json({ message: "Liste bulunamadı" });

    if (!list.products.map(String).includes(String(productId))) {
      list.products.push(productId);
      await list.save();
    }

    const updated = await List.findById(list._id).populate("products");
    res.status(200).json(updated);
  } catch (err) {
    next(err);
  }
};

exports.removeProductFromList = async (req, res, next) => {
  try {
    const { listId, productId } = req.params;
    const list = await List.findOne({ _id: listId, user: req.user._id });
    if (!list) return res.status(404).json({ message: "Liste bulunamadı" });

    list.products = list.products.filter((p) => String(p) !== String(productId));
    await list.save();

    const updated = await List.findById(list._id).populate("products");
    res.status(200).json(updated);
  } catch (err) {
    next(err);
  }
};