const jwt = require('jsonwebtoken');
const User = require('./models/User');
const Question = require('./models/Question');
const Quiz = require('./models/Quiz');
const { AppError } = require('./middleware/errorHandler');
const asyncHandler = require('./utils/asyncHandler');

exports.verifyUser = asyncHandler(async (req, res, next) => {
  const [scheme, token] = (req.headers.authorization || '').split(' ');
  if (scheme !== 'Bearer' || !token) throw new AppError(401, 'Bearer token required');

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.SECRET_KEY);
  } catch {
    throw new AppError(401, 'Invalid or expired token');
  }

  const user = await User.findById(decoded.sub);
  if (!user) throw new AppError(401, 'User no longer exists');
  req.user = user;
  next();
});

exports.verifyAdmin = (req, res, next) => {
  if (!req.user?.admin) return next(new AppError(403, 'Admin access required'));
  next();
};

exports.verifyAuthor = asyncHandler(async (req, res, next) => {
  const question = await Question.findById(req.params.questionId);
  if (!question) throw new AppError(404, 'Question not found');
  if (!req.user.admin && !question.author.equals(req.user._id)) {
    throw new AppError(403, 'Only the author can modify this question');
  }
  req.question = question;
  next();
});

exports.verifyQuizPermission = asyncHandler(async (req, res, next) => {
  const quiz = await Quiz.findById(req.params.quizId);
  if (!quiz) throw new AppError(404, 'Quiz not found');
  if (!req.user.admin && !quiz.author.equals(req.user._id)) {
    throw new AppError(403, 'Only the author can modify this quiz');
  }
  req.quiz = quiz;
  next();
});
