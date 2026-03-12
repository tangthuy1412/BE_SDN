const express = require('express');
const router = express.Router();
const quizController = require('../controllers/quizController');
const authenticate = require('../authenticate');

// ===============================
// GET - Public (ai cũng được)
// ===============================
router.get('/', quizController.getAllQuizzes);

router.get('/:quizId', quizController.getQuizById);


// ===============================
// POST - Admin only
// ===============================
router.post('/',
  authenticate.verifyUser,
  quizController.createQuiz
);


// UPDATE QUIZ
router.put('/:quizId',
  authenticate.verifyUser,
  authenticate.verifyQuizPermission,
  quizController.updateQuiz
);

// DELETE QUIZ
router.delete('/:quizId',
  authenticate.verifyUser,
  authenticate.verifyQuizPermission,
  quizController.deleteQuiz
);


// ===============================
// Nếu có thao tác thêm question vào quiz
// cũng nên giới hạn Admin
// ===============================
router.post('/:quizId/question',
  authenticate.verifyUser,
  authenticate.verifyQuizPermission,
  quizController.addOneQuestion
);

router.post('/:quizId/questions',
  authenticate.verifyUser,
  authenticate.verifyQuizPermission,
  quizController.addManyQuestions
);


// Nếu đây chỉ là render view (không thay đổi dữ liệu)
router.get('/:quizId/populate',
  quizController.getQuizWithCapitalAndAnimal
);

router.get('/:quizId/edit',
  authenticate.verifyUser,
  authenticate.verifyQuizPermission,
  quizController.renderEditQuiz
);
router.post('/:quizId/submit', quizController.submitQuiz);
module.exports = router;