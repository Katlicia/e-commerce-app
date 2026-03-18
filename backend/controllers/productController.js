const Product = require("../models/Product");
const ProductFilter = require("../utils/productFilter");
const cloaudinary = require("cloudinary").v2;

exports.getProducts = async (req, res) => {
  const resultPerPage = 10;
  const productFilter = new ProductFilter(Product.find(), req.query)
    .search()
    .filter()
    .pagination(resultPerPage);
  const products = await productFilter.query;

  res.json(products);
};

exports.adminProducts = async (req, res) => {
  const products = await Product.find();
  res.json(products);
};

exports.getProductById = async (req, res) => {
  const product = await Product.findById(req.params.id);

  res.json(product);
};

exports.createProduct = async (req, res) => {
  let images = [];

  if (typeof req.body.images === "string") {
    images.push(req.body.images);
  } else {
    images = req.body.images;
  }

  let allImage = [];
  for (let i = 0; i < images.length; i++) {
    const result = await cloaudinary.uploader.upload(images[i], {
      folder: "products",
    });

    allImage.push({
      public_id: result.public_id,
      url: result.secure_url,
    });
  }

  req.body.images = allImage;
  req.body.user = req.user.id;

  const product = await Product.create(req.body);

  res.json(product);
};

exports.deleteProduct = async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (product) {
    for (let i = 0; i < product.images.length; i++) {
      await cloudinary.uploader.destroy(product.images[i].public_id);
    }

    await product.remove();
    res.json({ message: "Product deleted" });
  } else {
    res.status(404).json({ message: "Product not found." });
  }
};

exports.updateProduct = async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  let images = [];

  if (typeof req.body.images === "string") {
    images.push(req.body.images);
  } else {
    images = req.body.images;
  }

  if (images !== undefined) {
    for (let i = 0; i < product.images.length; i++) {
      await cloudinary.uploader.destroy(product.images[i].public_id);
    }
  }

  let allImage = [];
  for (let i = 0; i < images.length; i++) {
    const result = await cloaudinary.uploader.upload(images[i], {
      folder: "products",
    });

    allImage.push({
      public_id: result.public_id,
      url: result.secure_url,
    });
  }

  req.body.images = allImage;

  res.json({ message: "Product edited." });
};

exports.createReview = async (req, res) => {
  const { productId, comment, rating } = req.body;

  const review = {
    user: req.user_id,
    name: req.user.name,
    comment,
    rating: Number(rating),
  };

  const product = await Product.findById(productId);

  product.reviews.puush(review);

  let avg = 0;
  product.reviews.foreach((rev) => {
    avg + rev.rating;
  });
  products.rating = avg / product.reviews.length;

  await product.save({ validateBeforeSave: false });

  res.json({
    message: "Yorum eklendi",
  });
};
