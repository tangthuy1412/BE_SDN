const jwt = require('jsonwebtoken');
const User = require('./models/user');
const Question = require('./models/Question');
const Quiz = require('./models/Quiz');
const secretKey = process.env.SECRET_KEY;
// ===============================
// VERIFY USER (check token)
// ===============================
exports.verifyUser = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        message: 'Authentication required'
      });
    }

    const decoded = jwt.verify(token, secretKey);
    const user = await User.findById(decoded._id);

    if (!user) {
      return res.status(401).json({
        message: 'User not found'
      });
    }

    req.user = user;
    next();

  } catch (err) {
    return res.status(401).json({
      message: 'Invalid or expired token'
    });
  }
};

// ===============================
// VERIFY ADMIN
// ===============================
exports.verifyAdmin = (req, res, next) => {
  if (req.user && req.user.admin) {
    return next();
  } else {
    const err = new Error('You are not authorized to perform this operation!');
    err.status = 403;
    return next(err);
  }
};


// ===============================
// VERIFY AUTHOR
// ===============================
exports.verifyAuthor = async (req, res, next) => {
  try {
    const question = await Question.findById(req.params.questionId);

    if (!question) {
      req.flash('error', 'Question not found');
      return res.redirect('back');
    }

    const isAuthor =
      question.author.toString() === req.user._id.toString();

    const isAdmin = req.user.role === 'admin';

    if (!isAuthor && !isAdmin) {
      req.flash('error', 'You are not the author of this question');
      return res.redirect('back');
    }

    next();

  } catch (err) {
    next(err);
  }
};
exports.verifyQuizPermission = async (req, res, next) => {
  try {

    const quiz = await Quiz.findById(req.params.quizId);

    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    console.log("REQ USER ID:", req.user._id.toString());
    console.log("QUIZ AUTHOR:", quiz.author?.toString());
    console.log("IS ADMIN:", req.user.admin);

    const isAdmin = req.user.admin === true;

    const isAuthor =
      quiz.author &&
      quiz.author.toString() === req.user._id.toString();

    if (!isAdmin && !isAuthor) {
      return res.status(403).json({
        message: 'You are not authorized to modify this quiz'
      });
    }

    req.quiz = quiz;

    return next();

  } catch (err) {
    return next(err);
  }
};