const express = require("express");
const app = express();
const cors = require("cors");
const connectDb = require("./config/db");
const path = require("path");

const userRoutes = require("./routes/userRoutes");
const interactionRoutes = require("./routes/interactionRoutes");
const chatRoutes = require("./routes/chatRoutes");

require("dotenv").config();

connectDb();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/user", userRoutes);
app.use("/api/interactions", interactionRoutes);
app.use("/api", chatRoutes);


module.exports = app;
