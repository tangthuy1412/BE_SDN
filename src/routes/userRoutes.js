const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authenticate = require('../authenticate');
// Register (public)
router.post("/register", userController.register);

// Login (public)
router.post('/login', userController.login);
    
// GET all users (Admin only)
router.get('/',
  authenticate.verifyUser,
  authenticate.verifyAdmin,
  userController.getAllUsers
);
// GET USER BY ID (cần đăng nhập)
router.get('/:userId',
  authenticate.verifyUser,
  userController.getUserById
);

module.exports = router;