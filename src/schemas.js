const { z } = require('zod');

const objectId = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid MongoDB id');
const credentials = z.object({
  username: z.string().trim().min(3).max(40).regex(/^[\w.-]+$/),
  password: z.string().min(8).max(72)
}).strict();

const quizInput = z.object({
  title: z.string().trim().min(3).max(120),
  description: z.string().trim().max(1000).default(''),
  category: z.string().trim().min(2).max(60).default('General'),
  difficulty: z.enum(['easy', 'medium', 'hard']).default('medium'),
  isPublished: z.boolean().default(false),
  timeLimitSeconds: z.number().int().min(30).max(7200).default(600)
}).strict();

const questionShape = {
  text: z.string().trim().min(3).max(500),
  options: z.array(z.string().trim().min(1).max(250)).min(2).max(6),
  correctAnswerIndex: z.number().int().min(0),
  keywords: z.union([
    z.array(z.string().trim().min(1).max(40)),
    z.string().transform(value => value.split(',').map(item => item.trim()).filter(Boolean))
  ]).default([]),
  explanation: z.string().trim().max(1000).default(''),
  points: z.number().int().min(1).max(100).default(1)
};

function refineQuestion(value, context) {
  if (value.correctAnswerIndex === undefined || value.options === undefined) return;
  if (value.correctAnswerIndex >= value.options.length) {
    context.addIssue({
      code: 'custom',
      path: ['correctAnswerIndex'],
      message: 'Correct answer index must point to an existing option'
    });
  }
  if (new Set(value.options.map(option => option.toLowerCase())).size !== value.options.length) {
    context.addIssue({ code: 'custom', path: ['options'], message: 'Options must be unique' });
  }
}

const questionInput = z.object(questionShape).strict().superRefine(refineQuestion);
const questionUpdate = z.object(questionShape).partial().strict().superRefine(refineQuestion);

const answerInput = z.object({
  answers: z.record(objectId, z.number().int().min(0))
}).strict();

module.exports = {
  objectId,
  registerSchema: credentials,
  loginSchema: credentials,
  quizInput,
  quizUpdate: quizInput.partial(),
  questionInput,
  questionUpdate,
  answerInput
};
