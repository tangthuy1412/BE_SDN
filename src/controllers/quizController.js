const mongoose = require('mongoose');
const Quiz = require('../models/Quiz');
const Question = require('../models/Question');
const { AppError } = require('../middleware/errorHandler');

function publicQuestion(question, revealAnswers = false) {
  const value = question.toObject ? question.toObject() : question;
  if (revealAnswers) return value;
  const { correctAnswerIndex, explanation, ...safe } = value;
  return safe;
}

exports.getAllQuizzes = async (req, res) => {
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(req.query.limit) || 12, 1), 50);
  const filter = {};
  if (req.query.category) filter.category = req.query.category;
  if (req.query.difficulty) filter.difficulty = req.query.difficulty;
  if (req.query.published !== 'all') filter.isPublished = true;
  if (req.query.search) filter.$text = { $search: req.query.search };

  const [data, total] = await Promise.all([
    Quiz.find(filter)
      .select('-questions')
      .populate('author', 'username')
      .sort(req.query.sort === 'oldest' ? 'createdAt' : '-createdAt')
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Quiz.countDocuments(filter)
  ]);

  res.json({ data, meta: { page, limit, total, pages: Math.ceil(total / limit) } });
};

exports.getQuizById = async (req, res) => {
  const quiz = await Quiz.findById(req.params.quizId)
    .populate('author', 'username')
    .populate('questions');
  if (!quiz || !quiz.isPublished) throw new AppError(404, 'Quiz not found');

  const result = quiz.toObject();
  result.questions = result.questions.map(question => publicQuestion(question));
  res.json(result);
};

exports.createQuiz = async (req, res) => {
  const quiz = await Quiz.create({ ...req.body, author: req.user._id });
  res.status(201).json(quiz);
};

exports.updateQuiz = async (req, res) => {
  Object.assign(req.quiz, req.body);
  await req.quiz.save();
  res.json(req.quiz);
};

exports.deleteQuiz = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      await Question.deleteMany({ quizId: req.quiz._id }).session(session);
      await Quiz.deleteOne({ _id: req.quiz._id }).session(session);
    });
  } finally {
    await session.endSession();
  }
  res.status(204).send();
};

exports.addOneQuestion = async (req, res) => {
  const question = await Question.create({
    ...req.body,
    quizId: req.quiz._id,
    author: req.user._id
  });
  req.quiz.questions.push(question._id);
  await req.quiz.save();
  res.status(201).json(question);
};

exports.addManyQuestions = async (req, res) => {
  const session = await mongoose.startSession();
  let questions;
  try {
    await session.withTransaction(async () => {
      questions = await Question.insertMany(
        req.body.map(question => ({
          ...question,
          quizId: req.quiz._id,
          author: req.user._id
        })),
        { session }
      );
      req.quiz.questions.push(...questions.map(question => question._id));
      await req.quiz.save({ session });
    });
  } finally {
    await session.endSession();
  }
  res.status(201).json(questions);
};

exports.submitQuiz = async (req, res) => {
  const quiz = await Quiz.findOne({ _id: req.params.quizId, isPublished: true });
  if (!quiz) throw new AppError(404, 'Quiz not found');

  const questions = await Question.find({ quizId: quiz._id });
  const details = questions.map(question => {
    const selected = req.body.answers[question._id.toString()];
    const isCorrect = selected === question.correctAnswerIndex;
    return {
      questionId: question._id,
      selectedAnswerIndex: selected ?? null,
      isCorrect,
      earnedPoints: isCorrect ? question.points : 0,
      points: question.points,
      correctAnswerIndex: question.correctAnswerIndex,
      explanation: question.explanation
    };
  });
  const score = details.reduce((total, answer) => total + answer.earnedPoints, 0);
  const maxScore = details.reduce((total, answer) => total + answer.points, 0);

  res.json({
    quizId: quiz._id,
    score,
    maxScore,
    percentage: maxScore ? Math.round((score / maxScore) * 100) : 0,
    correctAnswers: details.filter(answer => answer.isCorrect).length,
    totalQuestions: questions.length,
    details
  });
};

exports.publicQuestion = publicQuestion;
