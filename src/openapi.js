module.exports = {
  openapi: '3.0.3',
  info: {
    title: 'Quiz Platform API',
    version: '2.0.0',
    description: 'Secure REST API for creating, publishing and taking quizzes.'
  },
  servers: [{ url: '/api/v1' }],
  components: {
    securitySchemes: {
      bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }
    },
    schemas: {
      Error: {
        type: 'object',
        properties: { message: { type: 'string' }, details: { type: 'array' } }
      },
      Quiz: {
        type: 'object',
        required: ['title'],
        properties: {
          title: { type: 'string', example: 'JavaScript Fundamentals' },
          description: { type: 'string' },
          category: { type: 'string', example: 'Programming' },
          difficulty: { type: 'string', enum: ['easy', 'medium', 'hard'] },
          isPublished: { type: 'boolean' },
          timeLimitSeconds: { type: 'integer', minimum: 30, maximum: 7200 }
        }
      },
      Question: {
        type: 'object',
        required: ['text', 'options', 'correctAnswerIndex'],
        properties: {
          text: { type: 'string' },
          options: { type: 'array', minItems: 2, maxItems: 6, items: { type: 'string' } },
          correctAnswerIndex: { type: 'integer', minimum: 0 },
          keywords: { type: 'array', items: { type: 'string' } },
          explanation: { type: 'string' },
          points: { type: 'integer', default: 1 }
        }
      }
    }
  },
  paths: {
    '/users/register': {
      post: {
        summary: 'Create an account',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { type: 'object', required: ['username', 'password'], properties: { username: { type: 'string' }, password: { type: 'string', format: 'password' } } } } }
        },
        responses: { 201: { description: 'Account created' }, 422: { description: 'Invalid input' } }
      }
    },
    '/users/login': {
      post: {
        summary: 'Sign in and receive a JWT',
        responses: { 200: { description: 'Authenticated' }, 401: { description: 'Invalid credentials' } }
      }
    },
    '/quizzes': {
      get: {
        summary: 'Browse published quizzes',
        parameters: [
          { in: 'query', name: 'search', schema: { type: 'string' } },
          { in: 'query', name: 'difficulty', schema: { type: 'string' } },
          { in: 'query', name: 'page', schema: { type: 'integer' } }
        ],
        responses: { 200: { description: 'Paginated quiz list' } }
      },
      post: {
        summary: 'Create a quiz',
        security: [{ bearerAuth: [] }],
        requestBody: { content: { 'application/json': { schema: { $ref: '#/components/schemas/Quiz' } } } },
        responses: { 201: { description: 'Quiz created' } }
      }
    },
    '/quizzes/{quizId}/question': {
      post: {
        summary: 'Add a question',
        security: [{ bearerAuth: [] }],
        parameters: [{ in: 'path', name: 'quizId', required: true, schema: { type: 'string' } }],
        requestBody: { content: { 'application/json': { schema: { $ref: '#/components/schemas/Question' } } } },
        responses: { 201: { description: 'Question created' } }
      }
    },
    '/quizzes/{quizId}/submit': {
      post: {
        summary: 'Submit answers and receive detailed results',
        parameters: [{ in: 'path', name: 'quizId', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Scored result' } }
      }
    }
  }
};
