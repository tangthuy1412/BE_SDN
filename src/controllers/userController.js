const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { AppError } = require('../middleware/errorHandler');

function createToken(user) {
  return jwt.sign(
    { sub: user._id.toString(), admin: user.admin },
    process.env.SECRET_KEY,
    { expiresIn: process.env.JWT_EXPIRES_IN || '1h', issuer: 'quiz-api' }
  );
}

exports.register = async (req, res) => {
  const user = await User.create({
    username: req.body.username,
    password: req.body.password
  });
  res.status(201).json({ token: createToken(user), user });
};

exports.login = async (req, res) => {
  const user = await User.findOne({ username: req.body.username.toLowerCase() })
    .select('+password');
  if (!user || !(await user.verifyPassword(req.body.password))) {
    throw new AppError(401, 'Invalid username or password');
  }
  res.json({ token: createToken(user), user });
};

exports.getMe = async (req, res) => res.json(req.user);

exports.getAllUsers = async (req, res) => {
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100);
  const [data, total] = await Promise.all([
    User.find().sort('-createdAt').skip((page - 1) * limit).limit(limit),
    User.countDocuments()
  ]);
  res.json({ data, meta: { page, limit, total, pages: Math.ceil(total / limit) } });
};

exports.getUserById = async (req, res) => {
  if (!req.user.admin && req.user._id.toString() !== req.params.userId) {
    throw new AppError(403, 'You can only view your own profile');
  }
  const user = await User.findById(req.params.userId);
  if (!user) throw new AppError(404, 'User not found');
  res.json(user);
};
