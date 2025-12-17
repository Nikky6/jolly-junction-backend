const mongoose = require("mongoose");
const mongoUrl =
  process.env.MONGO_URL ||
  "mongodb+srv://Nikky:Nikky%4066@jolly-junction.dxb1rpk.mongodb.net/Jolly_Junction?appName=jolly-junction";

const connectDb = async () => {
  try {
    await mongoose.connect(mongoUrl);
    console.log("Connected to MongoDb");
  } catch (error) {
    console.log("error in connecting DB", error);
  }
};

module.exports = connectDb;
