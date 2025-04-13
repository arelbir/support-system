const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

// Swagger definition
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Promtaki API Documentation',
      version: '1.0.0',
      description: 'Promtaki Support System API documentation for testing and development',
      contact: {
        name: 'Promtaki Support',
      },
      servers: [
        {
          url: 'http://localhost:5000',
          description: 'Development server',
        },
      ],
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: [
    './routes/*.js',
    './controllers/*.js',
    './models/*.js',
    './server.js'
  ],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);

// Swagger UI options
const swaggerUiOptions = {
  explorer: true,
  persistAuthorization: true,
  swaggerOptions: {
    persistAuthorization: true,
    docExpansion: 'none',
    filter: true,
    withCredentials: true
  }
};

module.exports = {
  swaggerUi,
  swaggerDocs,
  swaggerUiOptions
};
