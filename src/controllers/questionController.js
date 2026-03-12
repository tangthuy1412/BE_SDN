const Question = require('../models/Question');

function normalizeOptions(options) {
  if (!Array.isArray(options)) {
    return [];
  }

  return options.map(opt => {
    if (typeof opt !== 'string') {
      throw new Error('Option must be a string');
    }
    return opt.trim();
  });
}


/**
 * GET /questions
 */
exports.getAllQuestions = async (req, res) => {
  const questions = await Question.find();
  res.json(questions);
};

/**
 * GET /questions/:questionId
 */
exports.getQuestionById = async (req, res) => {
  const question = await Question.findById(req.params.questionId);
  res.json(question);
};
exports.getQuestionsByQuiz = async (req, res) => {
  try {

    const questions = await Question.find({
      quizId: req.params.quizId
    });

    res.json(questions);

  } catch (err) {
    res.status(500).json({ message: "Cannot get questions" });
  }
};

/**
 * POST /questions
 */
exports.addOneQuestion = async (req, res) => {
  try {
    const { text, correctAnswerIndex, keywords } = req.body;
    const options = normalizeOptions(req.body.options);

    const answerIndex = Number(correctAnswerIndex);

    const newQuestion = await Question.create({
      text,
      options,
      correctAnswerIndex: answerIndex,
            quizId, // 🔥 THÊM DÒNG NÀY

      keywords: keywords
        ? keywords.split(',').map(k => k.trim())
        : [],
      author: req.user._id   // 🔥 BẮT BUỘC
    });

    res.status(201).json(newQuestion);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};





/**
 * PUT /questions/:questionId
 */
exports.updateQuestion = async (req, res) => {
  try {
    const updateData = {};

    if (req.body.text) {
      updateData.text = req.body.text;
    }

 if (Array.isArray(req.body.options)) {
  const options = normalizeOptions(req.body.options);

  if (options.length !== 4) {
    return res.status(400).json({
      message: 'Question must have exactly 4 options'
    });
  }

  updateData.options = options;
} 


    if (req.body.correctAnswerIndex !== undefined) {
      const idx = Number(req.body.correctAnswerIndex);
      if (isNaN(idx) || idx < 0 || idx > 3) {
        return res.status(400).json({
          message: 'Correct answer index is invalid'
        });
      }
      updateData.correctAnswerIndex = idx;
    }

    await Question.findByIdAndUpdate(
      req.params.questionId,
      updateData,
      { new: true }
    );

res.json({ message: 'OK' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};




/**
 * DELETE /questions/:questionId
 */
exports.deleteQuestion = async (req, res) => {
  try {
    const question = await Question.findById(req.params.questionId);

    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    // kiểm tra quyền
    if (question.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await question.deleteOne();

    res.json({ message: 'Question deleted' });

  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
