const express = require('express');
const controller = require('../controllers/userController');
const authenticate = require('../authenticate');
const validate = require('../middleware/validate');
const asyncHandler = require('../utils/asyncHandler');
const { registerSchema, loginSchema } = require('../schemas');

const router = express.Router();

router.post('/register', validate(registerSchema), asyncHandler(controller.register));
router.post('/login', validate(loginSchema), asyncHandler(controller.login));
router.get('/me', authenticate.verifyUser, asyncHandler(controller.getMe));
router.get('/', authenticate.verifyUser, authenticate.verifyAdmin, asyncHandler(controller.getAllUsers));
router.get('/:userId', authenticate.verifyUser, asyncHandler(controller.getUserById));

module.exports = router;
