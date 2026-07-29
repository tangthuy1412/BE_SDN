const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 120 },
  description: { type: String, default: '', trim: true, maxlength: 1000 },
  category: { type: String, default: 'General', trim: true, index: true },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium',
    index: true
  },
  isPublished: { type: Boolean, default: false, index: true },
  timeLimitSeconds: { type: Number, default: 600, min: 30, max: 7200 },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  questions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }]
}, { timestamps: true });

quizSchema.index({ title: 'text', description: 'text', category: 'text' });

module.exports = mongoose.models.Quiz || mongoose.model('Quiz', quizSchema);
