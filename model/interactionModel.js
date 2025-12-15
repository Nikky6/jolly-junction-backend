const mongoose = require("mongoose");

const interactionSchema = mongoose.Schema(
  {
    from: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    to: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["PING", "FLIRT", "MIDNIGHT"],
      required: true,
    },
    meta: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    status: {
      type: String,
      enum: ["SENT", "REJECTED", "ACCEPTED"],
      default: "SENT",
    },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

interactionSchema.index(
  { to: 1, from: 1, status: 1 },
  { unique: true, partialFilterExpression: { status: "SENT" } }
);

const Interaction = mongoose.model("Interaction", interactionSchema);

module.exports = Interaction;
