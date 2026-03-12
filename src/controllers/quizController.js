const Quiz = require('../models/Quiz');
const Question = require('../models/Question');
const mongoose = require('mongoose');

function normalizeOptions(options) {

  if (!options) return [];

  if (Array.isArray(options)) {
    return options.map(o => o.trim());
  }

  return [options.trim()];

}
// GET /quizzes
exports.getAllQuizzes = async (req, res) => {
  const quizzes = await Quiz.find().populate('questions');
  res.json(quizzes);
};

// GET /quizzes/:quizId/populate (capital + animal)
exports.getQuizWithCapitalAndAnimal = async (req, res) => {
  const { quizId } = req.params;

  const quiz = await Quiz.findById(quizId).populate({
    path: 'questions',
    match: {
      keywords: { $in: ['capital', 'animal'] }
    }
  });

  res.json(quiz);
};

// POST /quizzes
exports.createQuiz = async (req, res, next) => {
  try {
    const quiz = new Quiz({
      title: req.body.title,
      description: req.body.description,
      author: req.user._id   // 👈 QUAN TRỌNG
    });

    await quiz.save();

    res.status(201).json(quiz);
  } catch (err) {
    next(err);
  }
};

// DELETE /quizzes/:id
exports.deleteQuiz = async (req, res) => {
  await req.quiz.deleteOne();
  res.json({ message: 'Quiz deleted successfully' });
};


// GET only capital
exports.getQuizQuestionsWithCapital = async (req, res) => {
  const quiz = await Quiz.findById(req.params.quizId).populate({
    path: 'questions',
    match: { text: /capital/i }
  });

  res.json(quiz);
};

// POST one question
exports.addOneQuestion = async (req, res) => {
  try {

    console.log("PARAMS:", req.params);

    const options = normalizeOptions(req.body.options);

    const newQuestion = await Question.create({
      text: req.body.text,
      options: options,
      quizId: new mongoose.Types.ObjectId(req.params.quizId), // 🔥 ép kiểu ObjectId
      correctAnswerIndex: Number(req.body.correctAnswerIndex),
      keywords: req.body.keywords
        ? req.body.keywords.split(',').map(k => k.trim())
        : [],
      author: req.user._id
    });

    res.status(201).json(newQuestion);

  } catch (err) {

    console.log(err);

    res.status(500).json({ error: err.message });

  }
};
// POST many questions
exports.addManyQuestions = async (req, res) => {
  try {
    if (!Array.isArray(req.body)) {
      return res.status(400).json({ error: "Body must be an array" });
    }

    const questionsWithAuthor = req.body.map(q => ({
      ...q,
      author: req.user._id
    }));

    const questions = await Question.insertMany(questionsWithAuthor);

    const ids = questions.map(q => q._id);

    await Quiz.findByIdAndUpdate(req.params.quizId, {
      $push: { questions: { $each: ids } }
    });

    res.json(questions);

  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
// UPDATE /quizzes/:quizId
exports.updateQuiz = async (req, res) => {
  const quiz = await Quiz.findById(req.params.quizId);

  if (!quiz) {
    return res.status(404).json({ message: 'Quiz not found' });
  }

  if (
    !req.user.admin &&
    quiz.author.toString() !== req.user._id.toString()
  ) {
    return res.status(403).json({
      message: 'You do not have permission to edit this quiz'
    });
  }

  Object.assign(quiz, req.body);
  await quiz.save();

  res.json(quiz);
};

// GET /quizzes/:quizId
exports.getQuizById = async (req, res) => {
  const { quizId } = req.params;

  const quiz = await Quiz.findById(quizId).populate('questions');

  if (!quiz) {
    return res.status(404).json({ message: 'Quiz not found' });
  }

  res.json(quiz);
};
exports.renderEditQuiz = async (req, res) => {
  const { quizId } = req.params;

  const quiz = await Quiz.findById(quizId).populate('questions');

  if (!quiz) {
    return res.status(404).send('Quiz not found');
  }

  res.render('quiz/edit', {
    quiz,
    success: req.query.success === '1'
  });
};
exports.submitQuiz = async (req, res) => {
  try {
    const quizId = req.params.quizId;
    const questions = await Question.find({ quizId });
    let score = 0;
    const userAnswers = {};

  questions.forEach(q => {
  const userAnswer = answers["q_" + q._id]; // string index
  userAnswers[q._id] = userAnswer;

  if (parseInt(userAnswer) === q.correctAnswerIndex) {
    score++;
  }
});

    res.render('quiz/result', {
      quizId,
      total: questions.length,
      score,
      userAnswers,
      questions
    });

  } catch (err) {
    res.status(500).send('Error submitting quiz');
  }
};




