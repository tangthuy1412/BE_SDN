require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');

const quizRoutes = require('./routes/quizRoutes');
const questionRoutes = require('./routes/questionRoutes');
const userRoutes = require('./routes/userRoutes');
const app = express();
const session = require('express-session');
const flash = require('connect-flash');

app.use(session({
  secret: 'yourSecretKey',
  resave: false,
  saveUninitialized: false
}));

app.use(flash());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// routes
app.use('/quizzes', quizRoutes);
app.use('/questions', questionRoutes);
app.use('/users', userRoutes);
// connect DB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error(err));

app.listen(process.env.PORT, () =>
  console.log(`Server running on port ${process.env.PORT}`)
);
