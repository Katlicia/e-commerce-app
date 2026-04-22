const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const db = require("./config/db");
const dotenv = require("dotenv");
dotenv.config();
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

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_SECRET_KEY,
});

const app = express();

app.use(
  cors({
    origin: (origin, callback) => {
      const allowed = [
        process.env.CLIENT_URL,
        process.env.CLIENT_URL2,
        "http://localhost:8081", // Expo web
      ];
      // React Native isteklerinde origin yoktur (undefined/null)
      if (!origin || allowed.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("CORS: izin verilmeyen origin: " + origin));
      }
    },
    credentials: true,
  }),
);

app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ limit: "20mb", extended: true }));
app.use(cookieParser());

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
