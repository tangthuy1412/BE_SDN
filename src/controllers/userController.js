const User = require('../models/user');
const jwt = require('jsonwebtoken');

const secretKey = process.env.SECRET_KEY;

// =======================
// REGISTER
// =======================
exports.register = async (req, res) => {
  try {
    const { username, password, admin } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        message: "username and password are required"
      });
    }

    const existingUser = await User.findOne({ username });

    if (existingUser) {
      return res.status(400).json({
        message: "Username already exists"
      });
    }

    const newUser = new User({
      username,
      password,
      admin: admin || false
    });

    await newUser.save();

    res.status(201).json({
      message: "User registered successfully",
      user: {
        _id: newUser._id,
        username: newUser.username,
        admin: newUser.admin
      }
    });

  } catch (err) {
    res.status(500).json({
      message: "Register failed"
    });
  }
};
// =======================
// LOGIN
// =======================
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });

    if (!user || user.password !== password) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      {
        _id: user._id,
        username: user.username,
        admin: user.admin
      },
      process.env.SECRET_KEY,
      { expiresIn: '1h' }
    );

    res.json({
      token,
      user: {
        _id: user._id,
        username: user.username,
        admin: user.admin
      }
    });

  } catch (err) {
    res.status(500).json({ message: "Login failed" });
  }
};

// =======================
// GET ALL USERS (Admin only)
// =======================
exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find({}).select('-password');
    res.status(200).json(users);
  } catch (err) {
    next(err);
  }
};
exports.getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.userId).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(user);

  } catch (err) {
    next(err);
  }
};
