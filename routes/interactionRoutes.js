const express = require("express");
const interactionRoutes = express.Router();
const interactions = require("../controller/interactionsController");
const authenticate = require("../auth/middleware");

interactionRoutes.post("/send", authenticate, interactions.sendSignal);
interactionRoutes.put("/respond", authenticate, interactions.respondSignal);
interactionRoutes.get(
  "/received",
  authenticate,
  interactions.listReceivedSignals
);
interactionRoutes.get("/sent", authenticate, interactions.listSentSignals);
interactionRoutes.get(
  "/status/:userId",
  authenticate,
  interactions.getMatchStatus
);

module.exports = interactionRoutes;
