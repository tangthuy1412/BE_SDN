const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  text: { type: String, required: true }, 
   quizId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz',
    required: true
  },
   author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  options: [{ type: String, required: true }],
  keywords: [{ type: String }],
  correctAnswerIndex: { type: Number, required: true }
  
});


module.exports = mongoose.model('Question', questionSchema);
