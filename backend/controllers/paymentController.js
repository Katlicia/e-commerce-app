const Iyzipay = require("iyzipay");
const Order = require("../models/Order");
const User = require("../models/User");
const Product = require("../models/Product");
const Coupon = require("../models/Coupon");

const formatIp = (req) => {
  const rawIp = req.headers["x-forwarded-for"] || req.ip || "85.34.78.112";
  return rawIp === "::1" || rawIp.startsWith("::ffff:")
    ? "85.34.78.112"
    : rawIp.split(",")[0].trim();
};

const iyzipay = new Iyzipay({
  apiKey: process.env.IYZICO_API_KEY,
  secretKey: process.env.IYZICO_SECRET_KEY,
  uri: process.env.IYZICO_BASE_URL,
});

const INSTALLMENT_MULTIPLIERS = { 1: 1, 2: 1.077, 3: 1.1 };

exports.createPayment = async (req, res, next) => {
  try {
    const {
      items,
      totalAmount,
      address,
      billingAddress,
      guestEmail,
      cargoCompany,
      cargoPrice,
      coupon,
      paymentMethod,
      cardNumber,
      cardHolder,
      expirationDate, // "MM/YY"
      cvv,
      installment = 1,
    } = req.body;

    if (!items?.length) {
      return res.status(400).json({ message: "Sipariş öğeleri boş olamaz." });
    }
    if (
      !address?.fullName ||
      !address?.phone ||
      !address?.city ||
      !address?.district ||
      !address?.address
    ) {
      return res
        .status(400)
        .json({ message: "Teslimat adresi eksik veya hatalı." });
    }
    if (!req.user && !guestEmail) {
      return res
        .status(400)
        .json({ message: "Misafir siparişi için mail adresi zorunludur." });
    }
    if (!req.user && guestEmail) {
      const existing = await User.findOne({ email: guestEmail });
      if (existing) {
        return res.status(400).json({
          message:
            "Bu mail adresiyle kayıtlı bir hesabınız var. Lütfen giriş yaparak devam edin.",
        });
      }
    }

    const productIds = items.map((i) => i.product);
    const dbProducts = await Product.find({ _id: { $in: productIds } }).select(
      "price discountedPrice skus"
    );
    const productMap = Object.fromEntries(dbProducts.map((p) => [p._id.toString(), p]));

    let calculatedTotal = 0;
    for (const item of items) {
      const dbProduct = productMap[item.product?.toString()];
      if (!dbProduct) {
        return res.status(400).json({ message: `Ürün bulunamadı: ${item.product}` });
      }
      let unitPrice;
      if (item.skuId) {
        const sku = dbProduct.skus?.find((s) => s._id.toString() === item.skuId.toString());
        unitPrice = sku?.discountedPrice ?? sku?.price ?? dbProduct.discountedPrice ?? dbProduct.price;
      } else {
        unitPrice = dbProduct.discountedPrice ?? dbProduct.price;
      }
      calculatedTotal += unitPrice * item.quantity;
    }
    calculatedTotal = +calculatedTotal.toFixed(2);

    if (Math.abs(calculatedTotal - totalAmount) > 0.02) {
      return res.status(400).json({ message: "Sipariş tutarı doğrulanamadı." });
    }

    const effectiveCargoPrice = cargoPrice ?? 0;
    const price = +(calculatedTotal + effectiveCargoPrice).toFixed(2);
    const multiplier = INSTALLMENT_MULTIPLIERS[installment] ?? 1;
    const paidPrice = +(price * multiplier).toFixed(2);

    const basketItems = [
      {
        id: "order",
        name: "Sipariş",
        category1: "Genel",
        itemType: Iyzipay.BASKET_ITEM_TYPE.PHYSICAL,
        price: price.toFixed(2),
      },
    ];

    const [expMonth, expYear] = expirationDate.split("/");
    const conversationId = Date.now().toString();

    const ip = formatIp(req);

    const formatPhone = (phone) => {
      if (phone.startsWith("+")) return phone;
      return `+90${phone.replace(/^0/, "")}`;
    };

    const buyer = req.user
      ? {
          id: req.user._id.toString(),
          name: req.user.name,
          surname: req.user.surname,
          gsmNumber: formatPhone(address.phone),
          email: req.user.email,
          identityNumber: "11111111111",
          lastLoginDate: new Date()
            .toISOString()
            .replace("T", " ")
            .substring(0, 19),
          registrationDate: new Date(req.user.createdAt)
            .toISOString()
            .replace("T", " ")
            .substring(0, 19),
          registrationAddress: address.address,
          ip,
          city: address.city,
          country: "Turkey",
          zipCode: "34000",
        }
      : {
          id: "guest",
          name: address.fullName.split(" ")[0] || "Misafir",
          surname:
            address.fullName.split(" ").slice(1).join(" ") || "Kullanici",
          gsmNumber: formatPhone(address.phone),
          email: guestEmail,
          identityNumber: "11111111111",
          lastLoginDate: new Date()
            .toISOString()
            .replace("T", " ")
            .substring(0, 19),
          registrationDate: new Date()
            .toISOString()
            .replace("T", " ")
            .substring(0, 19),
          registrationAddress: address.address,
          ip,
          city: address.city,
          country: "Turkey",
          zipCode: "34000",
        };

    const shippingAddress = {
      contactName: address.fullName,
      city: address.city,
      country: "Turkey",
      address: `${address.district}, ${address.address}`,
      zipCode: "34000",
    };

    const billingAddr = billingAddress || address;
    const billingAddressObj = {
      contactName: billingAddr.fullName,
      city: billingAddr.city,
      country: "Turkey",
      address: `${billingAddr.district}, ${billingAddr.address}`,
      zipCode: "34000",
    };

    const paymentRequest = {
      locale: Iyzipay.LOCALE.TR,
      conversationId,
      price: price.toFixed(2),
      paidPrice: paidPrice.toFixed(2),
      currency: Iyzipay.CURRENCY.TRY,
      installment,
      basketId: conversationId,
      paymentChannel: Iyzipay.PAYMENT_CHANNEL.WEB,
      paymentGroup: Iyzipay.PAYMENT_GROUP.PRODUCT,
      paymentCard: {
        cardHolderName: cardHolder,
        cardNumber,
        expireMonth: expMonth,
        expireYear: `20${expYear}`,
        cvc: cvv,
        registerCard: "0",
      },
      buyer,
      shippingAddress,
      billingAddress: billingAddressObj,
      basketItems,
    };

    iyzipay.payment.create(paymentRequest, async (err, result) => {
      if (err) {
        return res
          .status(500)
          .json({ message: "Ödeme servisine ulaşılamadı." });
      }
      if (result.status !== "success") {
        return res
          .status(400)
          .json({ message: result.errorMessage || "Ödeme reddedildi." });
      }

      try {
        let orderNo;
        let exists = true;
        while (exists) {
          orderNo = "#" + Math.floor(100000 + Math.random() * 900000);
          exists = await Order.exists({ orderNo });
        }

        const paymentTransactionId =
          result.itemTransactions?.[0]?.paymentTransactionId;

        const order = await Order.create({
          ...(req.user ? { user: req.user._id } : { guestEmail }),
          orderNo,
          items,
          totalAmount,
          address,
          cargoCompany,
          cargoPrice: effectiveCargoPrice,
          ...(billingAddress && { billingAddress }),
          ...(coupon?.couponId && { coupon }),
          ...(paymentMethod && { paymentMethod }),
          paymentId: result.paymentId,
          conversationId,
          ...(paymentTransactionId && { paymentTransactionId }),
        });

        if (coupon?.couponId) {
          await Coupon.findByIdAndUpdate(coupon.couponId, {
            $inc: { usedCount: 1 },
          });
        }
        if (req.user) {
          await User.findByIdAndUpdate(req.user._id, {
            cart: [],
            $inc: { orderCount: 1 },
          });
        }
        for (const item of items) {
          if (item.skuId) {
            await Product.findOneAndUpdate(
              { _id: item.product, "skus._id": item.skuId },
              { $inc: { "skus.$.stock": -item.quantity, soldCount: item.quantity } },
            );
          } else {
            await Product.findByIdAndUpdate(item.product, {
              $inc: { stock: -item.quantity, soldCount: item.quantity },
            });
          }
        }

        res.status(201).json({ success: true, order });
      } catch (orderErr) {
        res.status(500).json({
          message:
            "Ödeme alındı fakat sipariş oluşturulamadı. Lütfen destek ile iletişime geçin.",
        });
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.adminCancelPayment = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Sipariş bulunamadı." });
    if (!["Hazırlanıyor", "Kargoya Verildi"].includes(order.status)) {
      return res.status(400).json({ message: "Bu sipariş iptal edilemez." });
    }
    if (!order.paymentId) {
      return res.status(400).json({ message: "Bu sipariş için ödeme iptali mevcut değil." });
    }

    const cancelRequest = {
      locale: Iyzipay.LOCALE.TR,
      conversationId: order.conversationId || Date.now().toString(),
      paymentId: order.paymentId,
      ip: formatIp(req),
    };

    iyzipay.cancel.create(cancelRequest, async (err, result) => {
      if (err) return res.status(500).json({ message: "Ödeme servisine ulaşılamadı." });
      if (result.status !== "success") {
        return res.status(400).json({ message: result.errorMessage || "İptal işlemi başarısız." });
      }
      try {
        order.status = "İptal Edildi";
        await order.save();
        if (order.user) {
          await User.findByIdAndUpdate(order.user, { $inc: { cancelCount: 1 } });
        }
        for (const item of order.items) {
          if (item.skuId) {
            await Product.findOneAndUpdate(
              { _id: item.product, "skus._id": item.skuId },
              { $inc: { "skus.$.stock": item.quantity, soldCount: -item.quantity } },
            );
          } else {
            await Product.findByIdAndUpdate(item.product, {
              $inc: { stock: item.quantity, soldCount: -item.quantity },
            });
          }
        }
        await order.populate("items.product", "name images price discountedPrice stock");
        res.status(200).json({ success: true, order });
      } catch (updateErr) {
        res.status(500).json({ message: "İptal işlemi gerçekleşti fakat sipariş güncellenemedi." });
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.adminRefundPayment = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Sipariş bulunamadı." });
    if (!["Teslim Edildi", "İade Talebi"].includes(order.status)) {
      return res.status(400).json({ message: "Bu sipariş iade edilemez." });
    }
    if (!order.paymentTransactionId) {
      return res.status(400).json({ message: "Bu sipariş için ödeme iadesi mevcut değil." });
    }

    const refundAmount = +(order.totalAmount + order.cargoPrice).toFixed(2);

    const refundRequest = {
      locale: Iyzipay.LOCALE.TR,
      conversationId: order.conversationId || Date.now().toString(),
      paymentTransactionId: order.paymentTransactionId,
      price: refundAmount.toFixed(2),
      currency: Iyzipay.CURRENCY.TRY,
      ip: formatIp(req),
    };

    iyzipay.refund.create(refundRequest, async (err, result) => {
      if (err) return res.status(500).json({ message: "Ödeme servisine ulaşılamadı." });
      if (result.status !== "success") {
        return res.status(400).json({
          message: result.errorMessage || "İade işlemi başarısız.",
        });
      }
      try {
        order.status = "İade Edildi";
        await order.save();
        if (order.user) {
          await User.findByIdAndUpdate(order.user, { $inc: { returnCount: 1 } });
        }
        for (const item of order.items) {
          await Product.findByIdAndUpdate(item.product, {
            $inc: { returnCount: item.quantity },
          });
        }
        await order.populate("items.product", "name images price discountedPrice stock");
        res.status(200).json({ success: true, order });
      } catch (updateErr) {
        res.status(500).json({ message: "İade işlemi gerçekleşti fakat sipariş güncellenemedi." });
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.cancelPayment = async (req, res, next) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!order) return res.status(404).json({ message: "Sipariş bulunamadı." });
    if (order.status !== "Hazırlanıyor") {
      return res
        .status(400)
        .json({ message: "Yalnızca hazırlanmakta olan siparişler iptal edilebilir." });
    }
    if (!order.paymentId) {
      return res
        .status(400)
        .json({ message: "Bu sipariş için ödeme iptali mevcut değil." });
    }

    const cancelRequest = {
      locale: Iyzipay.LOCALE.TR,
      conversationId: order.conversationId || Date.now().toString(),
      paymentId: order.paymentId,
      ip: formatIp(req),
    };

    iyzipay.cancel.create(cancelRequest, async (err, result) => {
      if (err) {
        return res.status(500).json({ message: "Ödeme servisine ulaşılamadı." });
      }
      if (result.status !== "success") {
        return res
          .status(400)
          .json({ message: result.errorMessage || "İptal işlemi başarısız." });
      }

      try {
        order.status = "İptal Edildi";
        await order.save();
        await User.findByIdAndUpdate(req.user._id, { $inc: { cancelCount: 1 } });
        for (const item of order.items) {
          if (item.skuId) {
            await Product.findOneAndUpdate(
              { _id: item.product, "skus._id": item.skuId },
              { $inc: { "skus.$.stock": item.quantity, soldCount: -item.quantity } },
            );
          } else {
            await Product.findByIdAndUpdate(item.product, {
              $inc: { stock: item.quantity, soldCount: -item.quantity },
            });
          }
        }
        await order.populate("items.product", "name images price discountedPrice stock");
        res.status(200).json({ success: true, order });
      } catch (updateErr) {
        res.status(500).json({
          message:
            "İptal işlemi gerçekleşti fakat sipariş güncellenemedi. Lütfen destek ile iletişime geçin.",
        });
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.refundPayment = async (req, res, next) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!order) return res.status(404).json({ message: "Sipariş bulunamadı." });
    if (order.status !== "Teslim Edildi") {
      return res
        .status(400)
        .json({ message: "Yalnızca teslim edilen siparişler iade edilebilir." });
    }
    if (!order.paymentTransactionId) {
      return res
        .status(400)
        .json({ message: "Bu sipariş için ödeme iadesi mevcut değil." });
    }

    const refundAmount = +(order.totalAmount + order.cargoPrice).toFixed(2);

    const refundRequest = {
      locale: Iyzipay.LOCALE.TR,
      conversationId: order.conversationId || Date.now().toString(),
      paymentTransactionId: order.paymentTransactionId,
      price: refundAmount.toFixed(2),
      currency: Iyzipay.CURRENCY.TRY,
      ip: formatIp(req),
    };

    iyzipay.refund.create(refundRequest, async (err, result) => {
      if (err) {
        return res.status(500).json({ message: "Ödeme servisine ulaşılamadı." });
      }
      if (result.status !== "success") {
        return res
          .status(400)
          .json({ message: result.errorMessage || "İade işlemi başarısız." });
      }

      try {
        order.status = "İade Edildi";
        await order.save();
        await User.findByIdAndUpdate(req.user._id, { $inc: { returnCount: 1 } });
        for (const item of order.items) {
          await Product.findByIdAndUpdate(item.product, {
            $inc: { returnCount: item.quantity },
          });
        }
        await order.populate("items.product", "name images price discountedPrice stock");
        res.status(200).json({ success: true, order });
      } catch (updateErr) {
        res.status(500).json({
          message:
            "İade işlemi gerçekleşti fakat sipariş güncellenemedi. Lütfen destek ile iletişime geçin.",
        });
      }
    });
  } catch (err) {
    next(err);
  }
};
