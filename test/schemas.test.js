const test = require('node:test');
const assert = require('node:assert/strict');
const {
  registerSchema,
  quizInput,
  questionInput,
  answerInput
} = require('../src/schemas');

test('registration rejects weak passwords and privilege injection', () => {
  assert.equal(registerSchema.safeParse({ username: 'alice', password: 'short' }).success, false);
  assert.equal(registerSchema.safeParse({
    username: 'alice',
    password: 'strong-pass',
    admin: true
  }).success, false);
});

test('quiz defaults create a useful draft', () => {
  const quiz = quizInput.parse({ title: 'Node.js Essentials' });
  assert.equal(quiz.isPublished, false);
  assert.equal(quiz.difficulty, 'medium');
  assert.equal(quiz.timeLimitSeconds, 600);
});

test('question requires unique options and a valid answer index', () => {
  const base = {
    text: 'What does HTTP stand for?',
    options: ['Hypertext Transfer Protocol', 'Home Tool Transfer Protocol'],
    correctAnswerIndex: 0
  };
  assert.equal(questionInput.safeParse(base).success, true);
  assert.equal(questionInput.safeParse({
    ...base,
    options: ['Same', 'same']
  }).success, false);
  assert.equal(questionInput.safeParse({ ...base, correctAnswerIndex: 2 }).success, false);
});

test('submission only accepts Mongo id keys and numeric answers', () => {
  const validId = '507f1f77bcf86cd799439011';
  assert.equal(answerInput.safeParse({ answers: { [validId]: 1 } }).success, true);
  assert.equal(answerInput.safeParse({ answers: { invalid: 1 } }).success, false);
});
