const express = require("express");
const userRouter = express.Router();
const userRoutes = require("../controller/userController");
const authenticate = require("../auth/middleware");
const upload = require("../auth/upload");
const nightOutRoutes = require("../controller/nightOutController");

userRouter.post("/register", upload.single("profilePic"), userRoutes.register);
userRouter.post("/login", userRoutes.login);
userRouter.post("/verify-otp", userRoutes.verifyOtp);
userRouter.post("/forgot-password", userRoutes.forgetPassword);
userRouter.post("/reset-password", userRoutes.resetPassword);
userRouter.post("/resend-otp", userRoutes.resendOtp);
userRouter.get("/nearby-users", authenticate, userRoutes.getNearbyUsers);
userRouter.post("/update-location", authenticate, userRoutes.updateLocation);
userRouter.get("/profile", authenticate, userRoutes.getProfile);
userRouter.get("/all", authenticate, userRoutes.allUsers);
userRouter.get("/:id/profile", authenticate, userRoutes.getUserById);
userRouter.put("/update-profile", authenticate, userRoutes.updateProfile);
userRouter.put(
  "/update-profilepic",
  authenticate,
  upload.single("profilePic"),
  userRoutes.updateProfilePic
);

userRouter.put("/update-intentions", authenticate, userRoutes.updateIntentions);
userRouter.get("/filter-by-intention", userRoutes.filterUsersByIntention);

userRouter.post("/nightout", authenticate, nightOutRoutes.setNightOutStatus);
userRouter.get(
  "/nightout-users",
  authenticate,
  nightOutRoutes.findNightOutUsers
);

module.exports = userRouter;
