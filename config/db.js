const mongoose = require("mongoose");
const mongoUrl =
  process.env.MONGO_URL || "mongodb://localhost:27017/Jolly_Junction";

const connectDb = async () => {
  try {
    await mongoose.connect(mongoUrl);
    console.log("Connected to MongoDb");
  } catch (error) {
    console.log("error in connecting DB", error);
  }
};

module.exports = connectDb;
