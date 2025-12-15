const { User } = require("../model/userModel");

const setNightOutStatus = async (req, res) => {
  try {
    const userId = req.user.id;
    const { status, durationMinutes } = req.body;
    if (typeof status !== "boolean") {
      console.log("status is Required");
      return res.status(400).json({ message: "status (boolean) is required" });
    }
    const update = { nightOutStatus: status };
    if (status && durationMinutes && Number(durationMinutes) > 0) {
      update.nightOutExpiresAt = new Date(
        Date.now() + Number(durationMinutes) * 60 * 1000
      );
    } else if (!status) {
      update.nightOutExpiresAt = null;
    }
    const user = await User.findByIdAndUpdate(userId, update, {
      new: true,
    }).select("-password");
    console.log("night-out status updated");
    return res.status(200).json({ message: "Night-Out status updated", user });
  } catch (error) {
    console.log("setNightOutStatus error", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const findNightOutUsers = async (req, res) => {
  try {
    const userId = req.user.id;
    const { latitude, longitude, distance } = req.query;
    if (!latitude || !longitude || !distance) {
      return res
        .status(400)
        .json({
          message: "latitude, longitude and distance (meters) are required",
        });
    }
    const users = await User.find({
      _id: { $ne: userId },
      nightOutStatus: true,
      $or: [
        { nightOutExpiresAt: null },
        { nightOutExpiresAt: { $gt: new Date() } },
      ],
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [parseFloat(longitude), parseFloat(latitude)],
          },
          $maxDistance: parseFloat(distance),
        },
      },
    }).select("name profilePic age gender bio location");
    return res.status(200).json({ count: users.length, users });
  } catch (error) {
    console.log("findNightOutUsers error", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = { setNightOutStatus, findNightOutUsers };
