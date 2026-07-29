const Question = require('../models/Question');
const Quiz = require('../models/Quiz');
const { AppError } = require('../middleware/errorHandler');
const { publicQuestion } = require('./quizController');

exports.getAllQuestions = async (req, res) => {
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100);
  const filter = req.query.quizId ? { quizId: req.query.quizId } : {};
  const [questions, total] = await Promise.all([
    Question.find(filter).sort('createdAt').skip((page - 1) * limit).limit(limit),
    Question.countDocuments(filter)
  ]);
  res.json({
    data: questions.map(question => publicQuestion(question)),
    meta: { page, limit, total, pages: Math.ceil(total / limit) }
  });
};

exports.getQuestionById = async (req, res) => {
  const question = await Question.findById(req.params.questionId);
  if (!question) throw new AppError(404, 'Question not found');
  res.json(publicQuestion(question));
};

exports.getQuestionsByQuiz = async (req, res) => {
  const questions = await Question.find({ quizId: req.params.quizId }).sort('createdAt');
  res.json(questions.map(question => publicQuestion(question)));
};

exports.addOneQuestion = async (req, res) => {
  if (!req.body.quizId) throw new AppError(422, 'quizId is required');
  const quiz = await Quiz.findById(req.body.quizId);
  if (!quiz) throw new AppError(404, 'Quiz not found');
  if (!req.user.admin && !quiz.author.equals(req.user._id)) {
    throw new AppError(403, 'Only the quiz author can add questions');
  }

  const { quizId, ...input } = req.body;
  const question = await Question.create({ ...input, quizId, author: req.user._id });
  quiz.questions.push(question._id);
  await quiz.save();
  res.status(201).json(question);
};

exports.updateQuestion = async (req, res) => {
  Object.assign(req.question, req.body);
  await req.question.save();
  res.json(req.question);
};

exports.deleteQuestion = async (req, res) => {
  await Promise.all([
    req.question.deleteOne(),
    Quiz.updateOne({ _id: req.question.quizId }, { $pull: { questions: req.question._id } })
  ]);
  res.status(204).send();
};
