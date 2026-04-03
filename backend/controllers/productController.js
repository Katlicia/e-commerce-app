const Product = require("../models/Product");
const Category = require("../models/Category");
const ProductFilter = require("../utils/productFilter");
const cloudinary = require("cloudinary").v2;

async function getAllDescendantIds(categoryId) {
  const ids = [categoryId];
  const queue = [categoryId];
  while (queue.length) {
    const current = queue.shift();
    const children = await Category.find({ parent: current }).select("_id").lean();
    for (const child of children) {
      ids.push(child._id.toString());
      queue.push(child._id.toString());
    }
  }
  return ids;
}

exports.getProducts = async (req, res) => {
  try {
    const resultPerPage = req.query.limit ? parseInt(req.query.limit) : 12;
    const queryCopy = { ...req.query };

    const priceFilter = {};
    if (queryCopy.minPrice) { priceFilter.$gte = Number(queryCopy.minPrice); delete queryCopy.minPrice; }
    if (queryCopy.maxPrice) { priceFilter.$lte = Number(queryCopy.maxPrice); delete queryCopy.maxPrice; }

    let baseQuery = Product.find(Object.keys(priceFilter).length ? { price: priceFilter } : {});

    if (queryCopy.category) {
      const catIds = queryCopy.category.split(",").map((id) => id.trim()).filter(Boolean);
      const allCatIds = [];
      for (const catId of catIds) {
        allCatIds.push(...(await getAllDescendantIds(catId)));
      }
      baseQuery = baseQuery.find({ category: { $in: [...new Set(allCatIds)] } });
      delete queryCopy.category;
    }

    if (queryCopy.brand) {
      const brandList = queryCopy.brand.split(",").map((b) => b.trim()).filter(Boolean);
      baseQuery = baseQuery.find({ brand: { $in: brandList } });
      delete queryCopy.brand;
    }

    const productFilter = new ProductFilter(baseQuery, queryCopy)
      .search()
      .filter()
      .sort();

    const total = await productFilter.query.clone().countDocuments();
    productFilter.pagination(resultPerPage);
    const products = await productFilter.query;

    res.json({ products, total });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.adminProducts = async (req, res) => {
  const products = await Product.find();
  res.json(products);
};

exports.getBrands = async (req, res) => {
  try {
    const filter = {};
    if (req.query.category) {
      const catIds = req.query.category.split(",").map((id) => id.trim()).filter(Boolean);
      const allCatIds = [];
      for (const catId of catIds) {
        allCatIds.push(...(await getAllDescendantIds(catId)));
      }
      filter.category = { $in: [...new Set(allCatIds)] };
    }
    const brands = await Product.distinct("brand", filter);
    res.json(brands.filter(Boolean).sort());
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getProductById = async (req, res) => {
  const product = await Product.findById(req.params.id).populate({
    path: "category",
    select: "name slug parent",
    populate: { path: "parent", select: "name slug" },
  });

  res.json(product);
};

exports.getProductByBadge = async (req, res) => {
  const { badge } = req.params;
  const products = await Product.find({ badge });
  res.json(products);
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
    const result = await cloudinary.uploader.upload(images[i], {
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

    await Product.deleteOne({ _id: product._id });
    res.json({ message: "Ürün silindi" });
  } else {
    res.status(404).json({ message: "Ürün bulunamadı" });
  }
};

exports.updateProduct = async (req, res) => {
  const rawImages = req.body.images;
  delete req.body.images;

  if (rawImages) {
    const images = Array.isArray(rawImages) ? rawImages : [rawImages];
    const current = await Product.findById(req.params.id);
    if (current) {
      for (const img of current.images) {
        await cloudinary.uploader.destroy(img.public_id);
      }
    }
    const allImage = [];
    for (const img of images) {
      const result = await cloudinary.uploader.upload(img, {
        folder: "products",
      });
      allImage.push({ public_id: result.public_id, url: result.secure_url });
    }
    req.body.images = allImage;
  }

  await Product.findByIdAndUpdate(req.params.id, req.body, {
    returnDocument: "after",
    runValidators: true,
  });

  res.json({ message: "Ürün güncellendi" });
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

  product.reviews.push(review);

  let avg = 0;
  product.reviews.forEach((rev) => {
    avg += rev.rating;
  });
  product.rating = avg / product.reviews.length;

  await product.save({ validateBeforeSave: false });

  res.json({
    message: "Yorum eklendi",
  });
};
