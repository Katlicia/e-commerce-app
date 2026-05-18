const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");
const db = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const productRoutes = require("./routes/productRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const cartRoutes = require("./routes/cartRoutes");
const favouriteRoutes = require("./routes/favouriteRoutes");
const orderRoutes = require("./routes/orderRoutes");
const cargoRoutes = require("./routes/cargoRoutes");
const taxSettingsRoutes = require("./routes/taxSettingsRoutes");
const bannerRoutes = require("./routes/bannerRoutes");
const homeSectionRoutes = require("./routes/homeSectionRoutes");
const homeLayoutRoutes = require("./routes/homeLayoutRoutes");
const couponRoutes = require("./routes/couponRoutes");
const featuredListRoutes = require("./routes/featuredListRoutes");
const campaignRoutes = require("./routes/campaignRoutes");
const cloudinary = require("cloudinary").v2;
const paymentRoutes = require("./routes/paymentRoutes");
const listRoutes = require("./routes/listRoutes");
const listedProductsRoutes = require("./routes/listedProductsRoutes");
const priceAlarmRoutes = require("./routes/priceAlarmRoutes");
const productQuestionRoutes = require("./routes/productQuestionRoutes");
const activityLogRoutes = require("./routes/activityLogRoutes");
const corporateOfferRoutes = require("./routes/corporateOfferRoutes");
const errorHandler = require("./middleware/errorHandler");

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_SECRET_KEY,
});

const app = express();

app.use(helmet({ crossOriginResourcePolicy: false }));
app.use((req, res, next) => {
  const sanitize = (obj) => {
    if (!obj || typeof obj !== "object" || Array.isArray(obj)) return;
    for (const key of Object.keys(obj)) {
      if (key.startsWith("$") || key.includes(".")) {
        delete obj[key];
      } else {
        sanitize(obj[key]);
      }
    }
  };
  if (req.body) sanitize(req.body);
  next();
});

app.use(
  cors({
    origin: (origin, callback) => {
      const allowed = [
        process.env.CLIENT_URL,
        process.env.CLIENT_URL2,
        "http://localhost:8081", // Expo web
      ];
      if (!origin || allowed.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("CORS: izin verilmeyen origin: " + origin));
      }
    },
    credentials: true,
  }),
);

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ limit: "1mb", extended: true }));
app.use(cookieParser());

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { message: "Çok fazla istek gönderildi. Lütfen 15 dakika sonra tekrar deneyin." },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/login", authLimiter);
app.use("/register", authLimiter);
app.use("/forgetPassword", authLimiter);
app.use("/check-phone", authLimiter);
app.use("/reset", authLimiter);
app.use("/api/payment", rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: { message: "Çok fazla ödeme isteği. Lütfen bir dakika bekleyin." },
  standardHeaders: true,
  legacyHeaders: false,
}));

db();

app.use("/", authRoutes);
app.use("/", userRoutes);
app.use("/", productRoutes);
app.use("/", categoryRoutes);
app.use("/", cartRoutes);
app.use("/", favouriteRoutes);
app.use("/", orderRoutes);
app.use("/", cargoRoutes);
app.use("/", taxSettingsRoutes);
app.use("/", bannerRoutes);
app.use("/", homeSectionRoutes);
app.use("/", homeLayoutRoutes);
app.use("/", couponRoutes);
app.use("/", featuredListRoutes);
app.use("/", campaignRoutes);
app.use("/", paymentRoutes);
app.use("/", listRoutes);
app.use("/", listedProductsRoutes);
app.use("/", priceAlarmRoutes);
app.use("/", productQuestionRoutes);
app.use("/", activityLogRoutes);
app.use("/", corporateOfferRoutes);

app.use(errorHandler);

app.get("/", (req, res) => {
  res.send("API working.");
});

app.get("/api/message", (req, res) => {
  res.json({
    message: "Sent from backend.",
  });
});

app.post("/api/message", (req, res) => {
  const { text } = req.body;

  res.json({
    message: `Backend got ${text}`,
  });
});

app.listen(5000, () => console.log("Server started."));
