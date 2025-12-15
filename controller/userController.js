const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { User } = require("../model/userModel");
const sendOtpToEmail = require("../utils/sendOtp");
const Otp = require("../model/otpModel");
const { set } = require("mongoose");
const sendWelcomeMail = require("../utils/sendWelcomeMail");
const checkMatchBetweenUsers = require("../utils/checkMatch");

const register = async (req, res) => {
  let { name, email, password, gender, age, location } = req.body;

  try {
    if (!name || !email || !password || !gender) {
      return res.status(400).json({
        message: "Name, Email and Password and gender are required",
      });
    }
    const findUser = await User.findOne({ email: email });
    if (findUser) {
      console.log("user is already Registered");
      return res.status(403).json({ message: "user alredy registered" });
    }
    const hashPassword = await bcrypt.hash(password, 12);

    const newUser = new User({
      name: name,
      email: email,
      password: hashPassword,
      gender: gender,
      age: age,
      isVerified: false,
      location: {
        type: "Point",
        coordinates: location?.coordinates || [0, 0],
      },
      profilePic: req.file ? req.file.path : null,
    });
    await newUser.save();

    const otp = Math.floor(1000 + Math.random() * 9000);
    await Otp.create({
      email,
      otp,
      expiresAt: Date.now() + 5 * 60 * 1000,
    });
    await sendOtpToEmail(email, otp);

    console.log("User Registration Succussfull", newUser);
    return res.status(200).json({
      message: "User registered, OTP sent to email, Please Verify the User",
      userId: newUser._id,
    });
  } catch (error) {
    console.log("error while registering User", error.message);
    return res.status(500).send("Internal Server Error", error);
  }
};

const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const otpRecord = await Otp.findOne({ email }).sort({ createdAt: -1 });

    if (!otpRecord) {
      console.log("OTP not found");
      return res
        .status(400)
        .json({ message: "OTP not found. Please request again." });
    }

    if (otpRecord.otp != otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (otpRecord.expiresAt < Date.now()) {
      return res.status(400).json({ message: "OTP expired" });
    }
    const user = await User.findOne({ email });

    await User.findByIdAndUpdate(user._id, { isVerified: true });

    await sendWelcomeMail(email, user.name);

    await Otp.deleteMany({ email });

    console.log("OTP verification succussful");

    return res
      .status(200)
      .json({ message: "OTP verified successfully. Now you can login." });
  } catch (error) {
    console.log("Error verifying OTP", error.message);
    return res.status(500).send("Internal Server Error");
  }
};

const login = async (req, res) => {
  let { email, password } = req.body;
  try {
    const userCheck = await User.findOne({ email: email });
    if (!userCheck) {
      console.log("user does not exists");
      return res.status(400).send("User Not Found");
    }
    if (!userCheck.isVerified) {
      console.log("please verify the OTP");
      return res
        .status(401)
        .json({ message: "Please verify OTP before login" });
    }
    const passwordCheck = await bcrypt.compare(password, userCheck.password);
    if (!passwordCheck) {
      console.log("Invalid Email & Password");
      return res.status(400).send("Invalid Credentials");
    }
    const token = jwt.sign(
      { id: userCheck._id, email: userCheck.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    console.log("Login Succussfully", token);
    return res.status(200).json({
      message: "Login succussful",
      token: token,
      user: {
        id: userCheck._id,
        name: userCheck.name,
        email: userCheck.email,
      },
    });
  } catch (error) {
    console.log("error while logging In ", error);
    return res.status(500).send("Internal Server Error");
  }
};

const forgetPassword = async (req, res) => {
  const { email } = req?.body;
  try {
    const userCheck = await User.findOne({ email: email });
    if (!userCheck) {
      console.log("User not Found");
      return res.status(404).json({ message: " User Not Foound" });
    }
    const otp = Math.floor(1000 + Math.random() * 9000);
    const otpData = new Otp({
      email,
      otp,
      expiresAt: Date.now() + 5 * 60 * 1000,
    });
    await otpData.save();
    await sendOtpToEmail(email, otp);
    console.log("OTP sent to email");
    return res.status(200).json({ message: "OTP sent to email" });
  } catch (error) {
    console.log("Error in forgot password:", error);
    return res.status(500).json({ message: "Internal Server Error", error });
  }
};

const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req?.body;
  try {
    const otpRecord = await Otp.findOne({ email: email }).sort({
      createdAt: -1,
    });
    if (!otpRecord) {
      console.log("OTP not found");
      return res.status(400).json({ message: "OTP not found" });
    }
    if (otpRecord.otp != otp) {
      console.log("Invalid OTP");
      return res.status(400).json({ message: "Invalid OTP" });
    }
    if (otpRecord.expiresAt < Date.now()) {
      console.log("OTP Expired");
      return res.status(400).json({ message: "OTP expired" });
    }
    const hashPassword = await bcrypt.hash(newPassword, 12);
    await User.updateOne({ email }, { $set: { password: hashPassword } });
    await Otp.deleteMany({ email });
    console.log("password reset succussful");
    return res.status(200).json({ message: "Password reset successful" });
  } catch (error) {
    console.log("Error in reset password:", error);
    return res.status(500).json({ message: "Internal Server Error", error });
  }
};

const resendOtp = async (req, res) => {
  const { email } = req?.body;
  try {
    await Otp.deleteMany({ email });
    const otp = Math.floor(1000 + Math.random() * 9000);
    const otpData = new Otp({
      email,
      otp,
      expiresAt: Date.now() + 5 * 60 * 1000,
    });
    await otpData.save();
    await sendOtpToEmail(email, otp);
    console.log("OTP sent again");
    return res.status(200).json({ message: "New OTP sent" });
  } catch (error) {
    console.log("Resend OTP error:", error);
    return res.status(500).send("Internal Server Error");
  }
};

const getNearbyUsers = async (req, res) => {
  try {
    const { latitude, longitude, distance = 5000, intention } = req.query;

    const filter = {
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [parseFloat(longitude), parseFloat(latitude)],
          },
          $maxDistance: parseInt(distance),
        },
      },
    };

    if (intention) {
      filter.intentions = intention;
    }

    const users = await User.find(filter).select("-password");

    res.status(200).json({ users });
  } catch (err) {
    console.log("Error fetching nearby users:", err);
    res.status(500).json({ message: "Server error" });
  }
};

const updateLocation = async (req, res) => {
  const { latitude, longitude } = req.body;
  try {
    const location = await User.findByIdAndUpdate(req.user._id, {
      location: {
        type: "Point",
        coordinates: [latitude, longitude],
      },
    });
    console.log("Location updated successfully", location);
    return res.status(200).json({ message: "Location updated successfully" });
  } catch (error) {
    console.log("Error updating location:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    console.log("profile :", user);
    return res.status(200).json({ user });
  } catch (error) {
    console.log("Error fetching profile", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const updateProfile = async (req, res) => {
  const { name, age, gender, bio, interests } = req.body;
  try {
    const updateUser = await User.findByIdAndUpdate(
      req.user.id,
      { name, age, gender, bio, interests },
      { new: true }
    ).select("-password");
    console.log("updated user :", updateUser);
    return res
      .status(200)
      .json({ message: "Profile updated successfully", user: updateUser });
  } catch (error) {
    console.log("Error updating profile", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const updateProfilePic = async (req, res) => {
  try {
    if (!req.file) {
      console.log("no file uploaded");
      return res.status(400).json({ message: "No file uploaded" });
    }
    const updateUser = await User.findByIdAndUpdate(
      req.user.id,
      { profilePic: req.file.path },
      { new: true }
    ).select("-password");
    console.log("profilePic updated", updateUser);
    return res
      .status(200)
      .json({ message: "Profile picture updated", user: updateUser });
  } catch (error) {
    console.log("Error updating profile picture", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const updateIntentions = async (req, res) => {
  try {
    const userId = req.user.id;
    const { intentions } = req.body;
    if (!interests || !Array.isArray(intentions)) {
      return res
        .status(400)
        .json({ message: "intentions (array of strings) are required" });
    }
    const allowedIntentions = [
      "One Night Stand",
      "Friends with Benefits",
      "Casual Dating",
      "Party Partner",
      "Travel Partner",
      "Hangout",
      "Long Drive",
      "Coffee Date",
    ];
    const invalidIntentions = intentions.filter(
      (i) => !allowedIntentions.includes(i)
    );
    if (invalidIntentions.length > 0) {
      return res.status(400).json({
        message: `Invalid intentions: ${invalidIntentions.join(", ")}`,
      });
    }
    const user = await User.findByIdAndUpdate(
      userId,
      { intentions },
      { new: true }
    ).select("-password");
    console.log("Intentions updated succussful", user);
    return res
      .status(200)
      .json({ message: "Intentions updated successfully", user });
  } catch (error) {
    console.log("updateIntentions error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const filterUsersByIntention = async (req, res) => {
  try {
    const { intention } = req.query;
    if (!intention) {
      return res.status(400).json({ message: "intention is required" });
    }
    const users = await User.find({ intentions: intention }).select(
      "name age gender bio profilePic intentions location"
    );
    return res.status(200).json({ count: users.length, users });
  } catch (error) {
    console.log("filterUsersByIntention error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const allUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password -__v");
    return res.status(200).json({ users, count: users.length });
  } catch (error) {
    console.log("Error fetching all users:", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const getUserById = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ user });
  } catch (error) {
    console.log("Error fetching user:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const getUserProfile = async (req, res) => {
  const viewerId = req.user.id;
  const targetId = req.params.id;

  if (viewerId === targetId) {
    const me = await User.findById(viewerId).select("-password");
    return res.json({ user: me, matched: true });
  }

  const match = await checkMatchBetweenUsers(viewerId, targetId);

  if (!match) {
    return res.status(403).json({
      locked: true,
      message: "Profile locked. Accept request to unlock.",
    });
  }

  const user = await User.findById(targetId).select("-password");
  res.json({ user, matched: true });
};

module.exports = {
  register,
  login,
  verifyOtp,
  forgetPassword,
  resetPassword,
  resendOtp,
  updateLocation,
  getProfile,
  updateProfile,
  updateProfilePic,
  updateIntentions,
  filterUsersByIntention,
  allUsers,
  getUserById,
  getUserProfile,
  getNearbyUsers,
};
