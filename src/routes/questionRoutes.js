const express = require('express');
const controller = require('../controllers/questionController');
const authenticate = require('../authenticate');
const validate = require('../middleware/validate');
const asyncHandler = require('../utils/asyncHandler');
const { questionUpdate } = require('../schemas');

const router = express.Router();

router.get('/', asyncHandler(controller.getAllQuestions));
router.get('/quiz/:quizId', asyncHandler(controller.getQuestionsByQuiz));
router.get('/:questionId', asyncHandler(controller.getQuestionById));
router.put(
  '/:questionId',
  authenticate.verifyUser,
  authenticate.verifyAuthor,
  validate(questionUpdate),
  asyncHandler(controller.updateQuestion)
);
router.delete(
  '/:questionId',
  authenticate.verifyUser,
  authenticate.verifyAuthor,
  asyncHandler(controller.deleteQuestion)
);

module.exports = router;
