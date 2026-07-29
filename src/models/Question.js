const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  text: { type: String, required: true, trim: true, maxlength: 500 },
  quizId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz',
    required: true,
    index: true
  },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  options: {
    type: [{ type: String, required: true, trim: true }],
    validate: {
      validator: options => (
        options.length >= 2 &&
        options.length <= 6 &&
        new Set(options.map(option => option.toLowerCase())).size === options.length
      ),
      message: 'A question must have between 2 and 6 unique options'
    }
  },
  keywords: [{ type: String, trim: true, lowercase: true }],
  correctAnswerIndex: { type: Number, required: true, min: 0 },
  explanation: { type: String, default: '', maxlength: 1000 },
  points: { type: Number, default: 1, min: 1, max: 100 }
}, { timestamps: true });

questionSchema.pre('validate', function validateAnswerIndex() {
  if (this.correctAnswerIndex >= this.options.length) {
    this.invalidate('correctAnswerIndex', 'Correct answer index is out of range');
  }
});

questionSchema.index({ quizId: 1, createdAt: 1 });

module.exports = mongoose.models.Question || mongoose.model('Question', questionSchema);
