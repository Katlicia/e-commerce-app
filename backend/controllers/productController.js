const Product = require("../models/Product");
const Category = require("../models/Category");
const ProductFilter = require("../utils/productFilter");
const cloudinary = require("cloudinary").v2;
const mongoose = require("mongoose");

async function getAllDescendantIds(categoryId) {
  const objectId = new mongoose.Types.ObjectId(categoryId);
  const result = await Category.aggregate([
    { $match: { _id: objectId } },
    {
      $graphLookup: {
        from: "categories",
        startWith: "$_id",
        connectFromField: "_id",
        connectToField: "parent",
        as: "descendants",
      },
    },
    { $project: { "descendants._id": 1 } },
  ]);

  if (!result.length) return [categoryId.toString()];

  const descendantIds = result[0].descendants.map((d) => d._id.toString());
  return [categoryId.toString(), ...descendantIds];
}

exports.getProducts = async (req, res) => {
  try {
    const resultPerPage = req.query.limit ? parseInt(req.query.limit) : 12;
    const queryCopy = { ...req.query };

    const priceFilter = {};
    if (queryCopy.minPrice) {
      priceFilter.$gte = Number(queryCopy.minPrice);
      delete queryCopy.minPrice;
    }
    if (queryCopy.maxPrice) {
      priceFilter.$lte = Number(queryCopy.maxPrice);
      delete queryCopy.maxPrice;
    }

    const stockFilter = {};
    if (queryCopy.stockLte) {
      stockFilter.$lte = Number(queryCopy.stockLte);
      delete queryCopy.stockLte;
    }
    if (queryCopy.stockGte) {
      stockFilter.$gte = Number(queryCopy.stockGte);
      delete queryCopy.stockGte;
    }

    const baseFilter = {};
    if (Object.keys(priceFilter).length) baseFilter.price = priceFilter;
    if (Object.keys(stockFilter).length) {
      baseFilter.$or = [
        { hasVariants: { $ne: true }, stock: stockFilter },
        { hasVariants: true, "skus.stock": stockFilter },
      ];
    }
    let baseQuery = Product.find(baseFilter);

    if (queryCopy.category) {
      const catIds = queryCopy.category
        .split(",")
        .map((id) => id.trim())
        .filter(Boolean);
      const allCatIds = [];
      for (const catId of catIds) {
        allCatIds.push(...(await getAllDescendantIds(catId)));
      }
      baseQuery = baseQuery.find({
        category: { $in: [...new Set(allCatIds)] },
      });
      delete queryCopy.category;
    }

    if (queryCopy.brand) {
      const brandList = queryCopy.brand
        .split(",")
        .map((b) => b.trim())
        .filter(Boolean);
      baseQuery = baseQuery.find({ brand: { $in: brandList } });
      delete queryCopy.brand;
    }

    if (queryCopy.keyword) {
      const kw = queryCopy.keyword;
      const orConditions = [{ name: { $regex: kw, $options: "i" } }];

      // Check for category names
      const matchedCats = await Category.find({
        name: { $regex: kw, $options: "i" },
      }).select("_id");
      if (matchedCats.length > 0) {
        const catDescIds = [];
        for (const cat of matchedCats) {
          catDescIds.push(...(await getAllDescendantIds(cat._id.toString())));
        }
        orConditions.push({ category: { $in: [...new Set(catDescIds)] } });
      }

      // Check for brand names
      orConditions.push({ brand: { $regex: kw, $options: "i" } });

      baseQuery = baseQuery.find({ $or: orConditions });
      delete queryCopy.keyword;
    }

    const productFilter = new ProductFilter(baseQuery, queryCopy)
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
  const products = await Product.find()
    .populate("category", "name")
    .sort({ createdAt: -1 });

  res.json(products);
};

exports.getBrands = async (req, res) => {
  try {
    const filter = {};
    if (req.query.category) {
      const catIds = req.query.category
        .split(",")
        .map((id) => id.trim())
        .filter(Boolean);
      const allCatIds = [];
      for (const catId of catIds) {
        allCatIds.push(...(await getAllDescendantIds(catId)));
      }
      filter.category = { $in: [...new Set(allCatIds)] };
    }
    const brands = await Product.aggregate([
      { $match: { ...filter, brand: { $nin: [null, ""] } } },
      { $group: { _id: "$brand", count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);
    res.json(brands.map((b) => ({ name: b._id, count: b.count })));
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
  const query =
    badge === "yeni"
      ? { badge: "yeni", newUntil: { $gt: new Date() } }
      : { badge };
  const products = await Product.find(query).sort({ createdAt: -1 });
  res.json(products);
};

exports.getBestSellers = async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit) : 12;
    const products = await Product.find().sort({ soldCount: -1 }).limit(limit);
    res.json({ products });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getNewProducts = async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit) : 12;
    const products = await Product.find({
      badge: "yeni",
      newUntil: { $gt: new Date() },
    })
      .sort({ createdAt: -1 })
      .limit(limit);
    res.json({ products, total: products.length });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
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

  const rawDescImages = req.body.descriptionImages || [];
  const descImagesArr =
    typeof rawDescImages === "string" ? [rawDescImages] : rawDescImages;
  const allDescImages = [];
  for (const img of descImagesArr) {
    const result = await cloudinary.uploader.upload(img, {
      folder: "products",
    });
    allDescImages.push({ public_id: result.public_id, url: result.secure_url });
  }
  req.body.descriptionImages = allDescImages;

  req.body.user = req.user.id;

  if (!req.body.badge) delete req.body.badge;
  if (!req.body.discountPercent) delete req.body.discountPercent;
  if (!req.body.newUntil) delete req.body.newUntil;

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
  try {
    const keepImages = req.body.keepImages || [];
    const rawNewImages = req.body.newImages || [];
    const keepDescriptionImages = req.body.keepDescriptionImages || [];
    const rawNewDescImages = req.body.newDescriptionImages || [];
    delete req.body.keepImages;
    delete req.body.newImages;
    delete req.body.keepDescriptionImages;
    delete req.body.newDescriptionImages;

    // Remove deleted images from cloudinary
    const current = await Product.findById(req.params.id);
    if (current) {
      const keepIds = new Set(keepImages.map((img) => img.public_id));
      for (const img of current.images) {
        if (!keepIds.has(img.public_id)) {
          await cloudinary.uploader.destroy(img.public_id);
        }
      }
      const keepDescIds = new Set(
        keepDescriptionImages.map((img) => img.public_id),
      );
      for (const img of current.descriptionImages || []) {
        if (!keepDescIds.has(img.public_id)) {
          await cloudinary.uploader.destroy(img.public_id);
        }
      }
    }

    // Upload new images
    const uploadedNew = [];
    for (const img of rawNewImages) {
      const result = await cloudinary.uploader.upload(img, {
        folder: "products",
      });
      uploadedNew.push({ public_id: result.public_id, url: result.secure_url });
    }
    req.body.images = [...keepImages, ...uploadedNew];

    // Upload new description images
    const uploadedNewDesc = [];
    for (const img of rawNewDescImages) {
      const result = await cloudinary.uploader.upload(img, {
        folder: "products",
      });
      uploadedNewDesc.push({
        public_id: result.public_id,
        url: result.secure_url,
      });
    }
    req.body.descriptionImages = [...keepDescriptionImages, ...uploadedNewDesc];

    const updateFields = { ...req.body };
    let unsetFields = {};

    if ("badge" in updateFields && !updateFields.badge) {
      delete updateFields.badge;
      unsetFields.badge = 1;
    }

    if ("hasVariants" in updateFields && !updateFields.hasVariants) {
      delete updateFields.variantOptions;
      delete updateFields.skus;
      unsetFields.variantOptions = 1;
      unsetFields.skus = 1;
    }

    const price = Number(updateFields.price);
    const discountPercent = Number(updateFields.discountPercent);

    if (price && discountPercent) {
      updateFields.discountedPrice = +(
        price *
        (1 - discountPercent / 100)
      ).toFixed(2);
    } else {
      delete updateFields.discountedPrice;
      unsetFields.discountedPrice = 1;
    }

    if (!discountPercent) {
      delete updateFields.discountPercent;
      unsetFields.discountPercent = 1;
    }

    const updateQuery = Object.keys(unsetFields).length
      ? { $set: updateFields, $unset: unsetFields }
      : updateFields;

    await Product.findByIdAndUpdate(req.params.id, updateQuery, {
      returnDocument: "after",
      runValidators: true,
    });

    res.json({ message: "Ürün güncellendi" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createReview = async (req, res) => {
  const { productId, comment, rating } = req.body;

  const product = await Product.findById(productId);

  const alreadyReviewed = product.reviews.find(
    (r) => r.user?.toString() === req.user._id.toString(),
  );

  if (alreadyReviewed) {
    return res.status(400).json({ message: "Bu ürüne zaten yorum yaptınız." });
  }

  const review = {
    user: req.user._id,
    name: req.user.name,
    surname: req.user.surname,
    comment,
    rating: Number(rating),
  };

  product.reviews.push(review);

  let avg = 0;
  product.reviews.forEach((rev) => {
    avg += rev.rating;
  });
  product.rating = avg / product.reviews.length;

  await product.save({ validateBeforeSave: false });

  res.json({ message: "Yorum eklendi" });
};

exports.updateReview = async (req, res) => {
  const { productId, comment, rating } = req.body;

  const product = await Product.findById(productId);

  const review = product.reviews.find(
    (r) => r.user?.toString() === req.user._id.toString(),
  );

  if (!review) {
    return res.status(404).json({ message: "Yorum bulunamadı." });
  }

  review.comment = comment;
  review.rating = Number(rating);

  let avg = 0;
  product.reviews.forEach((rev) => {
    avg += rev.rating;
  });
  product.rating = avg / product.reviews.length;

  await product.save({ validateBeforeSave: false });

  res.json({ message: "Yorum güncellendi" });
};

exports.deleteReview = async (req, res) => {
  const { productId } = req.body;

  const product = await Product.findById(productId);

  product.reviews = product.reviews.filter(
    (r) => r.user?.toString() !== req.user._id.toString(),
  );

  let avg = 0;
  product.reviews.forEach((rev) => {
    avg += rev.rating;
  });
  product.rating =
    product.reviews.length > 0 ? avg / product.reviews.length : 0;

  await product.save({ validateBeforeSave: false });

  res.json({ message: "Yorum silindi" });
};
