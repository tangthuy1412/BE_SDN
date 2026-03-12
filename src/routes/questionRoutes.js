const express = require('express');
const router = express.Router();
const questionController = require('../controllers/questionController');
const authenticate = require('../authenticate');

// ===============================
// GET - Public
// ===============================
router.get('/', questionController.getAllQuestions);

router.get('/:questionId', questionController.getQuestionById);
router.get('/quiz/:quizId', questionController.getQuestionsByQuiz);

// ===============================
// POST - User login
// ===============================
router.post('/',
  authenticate.verifyUser,
  questionController.addOneQuestion
);


// ===============================
// PUT - Only Author
// ===============================
router.put('/:questionId',
  authenticate.verifyUser,
  authenticate.verifyAuthor,
  questionController.updateQuestion
);


// ===============================
// DELETE - Only Author
// ===============================
router.delete('/:questionId',
  authenticate.verifyUser,
  authenticate.verifyAuthor,
  questionController.deleteQuestion
);

module.exports = router;