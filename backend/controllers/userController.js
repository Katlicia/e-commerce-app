const User = require("../models/User");

exports.getUsers = async (req, res) => {
  const users = await User.find().select("-password");
  res.status(200).json(users);
};

exports.getUserById = async (req, res) => {
  const user = await User.findById(req.params.id).select("-password");
  if (!user) {
    res.status(404).json({ message: "User not found." });
  }
  res.status(200).json(user);
};

// exports.getUserDetail = async (req, res) => {
//   const user = await User.findById(req.params.id);
//   res.status.json(200).json({
//     user,
//   });
// };

exports.updateUser = async (req, res) => {
  const user = await User.findById(req.params.id);

  if (user) {
    user.name = req.body.name || user.name;
    user.surname = req.body.surname || user.surname;
    user.email = req.body.email || user.email;

    const updatedUser = await user.save();
    res.status(200).json(updatedUser);
  } else {
    res.status(404).json({ message: "User not found." });
  }
};

exports.deleteUser = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (user) {
    await user.deleteOne();
    res.status(200).json({ message: "User deleted." });
  } else {
    res.status(404).json({ message: "User not found." });
  }
};
