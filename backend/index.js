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
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_SECRET_KEY,
});

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  }),
);

app.use(express.json());
app.use(cookieParser());

db();

app.use("/", authRoutes);
app.use("/", userRoutes);
app.use("/", productRoutes);
app.use("/", categoryRoutes);
app.use("/", cartRoutes);
app.use("/", favouriteRoutes);

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
