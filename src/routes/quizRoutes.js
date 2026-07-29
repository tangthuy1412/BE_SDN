const express = require('express');
const { z } = require('zod');
const controller = require('../controllers/quizController');
const authenticate = require('../authenticate');
const validate = require('../middleware/validate');
const asyncHandler = require('../utils/asyncHandler');
const { quizInput, quizUpdate, questionInput, answerInput } = require('../schemas');

const router = express.Router();

router.get('/', asyncHandler(controller.getAllQuizzes));
router.post('/', authenticate.verifyUser, validate(quizInput), asyncHandler(controller.createQuiz));

router.post(
  '/:quizId/submit',
  validate(answerInput),
  asyncHandler(controller.submitQuiz)
);
router.post(
  '/:quizId/questions',
  authenticate.verifyUser,
  authenticate.verifyQuizPermission,
  validate(z.array(questionInput).min(1).max(100)),
  asyncHandler(controller.addManyQuestions)
);
router.post(
  '/:quizId/question',
  authenticate.verifyUser,
  authenticate.verifyQuizPermission,
  validate(questionInput),
  asyncHandler(controller.addOneQuestion)
);
router.put(
  '/:quizId',
  authenticate.verifyUser,
  authenticate.verifyQuizPermission,
  validate(quizUpdate),
  asyncHandler(controller.updateQuiz)
);
router.delete(
  '/:quizId',
  authenticate.verifyUser,
  authenticate.verifyQuizPermission,
  asyncHandler(controller.deleteQuiz)
);
router.get('/:quizId', asyncHandler(controller.getQuizById));

module.exports = router;
