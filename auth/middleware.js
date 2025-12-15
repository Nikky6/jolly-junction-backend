const jwt = require("jsonwebtoken");

const authenticate = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader) {
    console.log("Unauthorized User");
    return res.status(401).json({ message: "Unauthorized User" });
  }
  const token = authHeader.replace("Bearer", "").trim();
  try {
    const decode = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decode;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid Token" });
  }
};


module.exports = authenticate