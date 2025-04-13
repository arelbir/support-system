const express = require('express');
const router = express.Router();
const savedResponseController = require('../controllers/savedResponseController');
const { authenticateToken, isOperator } = require('../middleware/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: SavedResponses
 *   description: Predefined ticket responses management
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     SavedResponse:
 *       type: object
 *       required:
 *         - title
 *         - content
 *       properties:
 *         id:
 *           type: integer
 *           description: The auto-generated ID of the saved response
 *         title:
 *           type: string
 *           description: Title of the response
 *         content:
 *           type: string
 *           description: Content of the response, may include variables
 *         category:
 *           type: string
 *           description: Category for organization
 *         isGlobal:
 *           type: boolean
 *           description: Whether this response is available to all operators
 *         variables:
 *           type: array
 *           items:
 *             type: string
 *           description: Variables that can be used in this response
 *         createdBy:
 *           type: integer
 *           description: ID of the user who created the response
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: When the response was created
 */

/**
 * @swagger
 * /api/saved-responses:
 *   get:
 *     summary: Get all saved responses
 *     tags: [SavedResponses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search in title and content
 *     responses:
 *       200:
 *         description: List of saved responses
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 responses:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/SavedResponse'
 *       401:
 *         description: Not authenticated
 *       500:
 *         description: Server error
 */
router.get('/', authenticateToken, savedResponseController.getAllResponses);

/**
 * @swagger
 * /api/saved-responses/categories:
 *   get:
 *     summary: Get all saved response categories
 *     tags: [SavedResponses]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of categories
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 categories:
 *                   type: array
 *                   items:
 *                     type: string
 *       401:
 *         description: Not authenticated
 *       500:
 *         description: Server error
 */
router.get('/categories', authenticateToken, savedResponseController.getCategories);

/**
 * @swagger
 * /api/saved-responses/{id}:
 *   get:
 *     summary: Get saved response by ID
 *     tags: [SavedResponses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Saved response ID
 *     responses:
 *       200:
 *         description: Saved response details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 response:
 *                   $ref: '#/components/schemas/SavedResponse'
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized
 *       404:
 *         description: Saved response not found
 *       500:
 *         description: Server error
 */
router.get('/:id', authenticateToken, savedResponseController.getResponseById);

/**
 * @swagger
 * /api/saved-responses:
 *   post:
 *     summary: Create a new saved response
 *     tags: [SavedResponses]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - content
 *             properties:
 *               title:
 *                 type: string
 *                 description: Title of the response
 *               content:
 *                 type: string
 *                 description: Content of the response
 *               category:
 *                 type: string
 *                 description: Category for organization
 *               isGlobal:
 *                 type: boolean
 *                 description: Whether this response is available to all operators
 *               variables:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Variables that can be used in this response
 *     responses:
 *       201:
 *         description: Saved response created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 response:
 *                   $ref: '#/components/schemas/SavedResponse'
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized
 *       409:
 *         description: Response with this title already exists
 *       500:
 *         description: Server error
 */
router.post('/', authenticateToken, isOperator, savedResponseController.createResponse);

/**
 * @swagger
 * /api/saved-responses/{id}:
 *   put:
 *     summary: Update a saved response
 *     tags: [SavedResponses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Saved response ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: Title of the response
 *               content:
 *                 type: string
 *                 description: Content of the response
 *               category:
 *                 type: string
 *                 description: Category for organization
 *               isGlobal:
 *                 type: boolean
 *                 description: Whether this response is available to all operators
 *               variables:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Variables that can be used in this response
 *     responses:
 *       200:
 *         description: Saved response updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 response:
 *                   $ref: '#/components/schemas/SavedResponse'
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized
 *       404:
 *         description: Saved response not found
 *       409:
 *         description: Response with this title already exists
 *       500:
 *         description: Server error
 */
router.put('/:id', authenticateToken, isOperator, savedResponseController.updateResponse);

/**
 * @swagger
 * /api/saved-responses/{id}:
 *   delete:
 *     summary: Delete a saved response
 *     tags: [SavedResponses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Saved response ID
 *     responses:
 *       200:
 *         description: Saved response deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized
 *       404:
 *         description: Saved response not found
 *       500:
 *         description: Server error
 */
router.delete('/:id', authenticateToken, isOperator, savedResponseController.deleteResponse);

module.exports = router;
