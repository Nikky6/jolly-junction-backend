const mongoose = require("mongoose");

const userSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    age: { type: Number },
    gender: { type: String, required: true },
    interests: { type: [String] },
    bio: { type: String },
    profilePic: { type: String },
    isVerified: { type: Boolean, default: false },
    location: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], default: [0, 0] },
    },
    vibe: { type: String, default: null },
    question: { type: String, default: null },
    secretCrushes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    nightOutStatus: { type: Boolean, default: false },
    nightOutExpiresAt: { type: Date, default: null },
    intentions: {
      type: [String],
      enum: [
        "One Night Stand",
        "Friends with Benefits",
        "Casual Dating",
        "Party Partner",
        "Travel Partner",
        "Hangout",
        "Long Drive",
        "Coffee Date",
      ],
      default: [],
    },
  },
  { timestamps: true }
);

userSchema.index({ location: "2dsphere" });

const User = mongoose.model("User", userSchema);

module.exports = { User };
