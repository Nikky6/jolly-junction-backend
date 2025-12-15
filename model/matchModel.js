const mongoose = require("mongoose");

const matchSchema = mongoose.Schema({
  users: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  ],
  createdAt: { type: Date, default: Date.now },
  meta: { type: mongoose.Schema.Types.Mixed, default: {} },
});

matchSchema.index({ users: 1 });

const Match = mongoose.model("match", matchSchema);
module.exports = Match;
