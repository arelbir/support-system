const express = require('express');
const router = express.Router();
const tagController = require('../controllers/tagController');
const { authenticateToken, isOperator } = require('../middleware/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: Tags
 *   description: Ticket tag management
 */

/**
 * @swagger
 * /api/tags:
 *   get:
 *     summary: Get all tags
 *     tags: [Tags]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter tags by category
 *       - in: query
 *         name: active
 *         schema:
 *           type: boolean
 *         description: Filter tags by active status
 *     responses:
 *       200:
 *         description: List of tags
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 tags:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Tag'
 *       401:
 *         description: Not authenticated
 *       500:
 *         description: Server error
 */
router.get('/', authenticateToken, tagController.getAllTags);

/**
 * @swagger
 * /api/tags/{id}:
 *   get:
 *     summary: Get tag by ID
 *     tags: [Tags]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Tag ID
 *     responses:
 *       200:
 *         description: Tag details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 tag:
 *                   $ref: '#/components/schemas/Tag'
 *       401:
 *         description: Not authenticated
 *       404:
 *         description: Tag not found
 *       500:
 *         description: Server error
 */
router.get('/:id', authenticateToken, tagController.getTagById);

/**
 * @swagger
 * /api/tags:
 *   post:
 *     summary: Create a new tag
 *     tags: [Tags]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 description: Tag name
 *               color:
 *                 type: string
 *                 description: Color code in hex format (e.g., #FF5733)
 *               category:
 *                 type: string
 *                 description: Tag category
 *               description:
 *                 type: string
 *                 description: Tag description
 *     responses:
 *       201:
 *         description: Tag created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 tag:
 *                   $ref: '#/components/schemas/Tag'
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized
 *       409:
 *         description: Tag with this name already exists
 *       500:
 *         description: Server error
 */
router.post('/', authenticateToken, isOperator, tagController.createTag);

/**
 * @swagger
 * /api/tags/{id}:
 *   put:
 *     summary: Update a tag
 *     tags: [Tags]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Tag ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Tag name
 *               color:
 *                 type: string
 *                 description: Color code in hex format (e.g., #FF5733)
 *               category:
 *                 type: string
 *                 description: Tag category
 *               description:
 *                 type: string
 *                 description: Tag description
 *               isActive:
 *                 type: boolean
 *                 description: Active status
 *     responses:
 *       200:
 *         description: Tag updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 tag:
 *                   $ref: '#/components/schemas/Tag'
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized
 *       404:
 *         description: Tag not found
 *       409:
 *         description: Tag with this name already exists
 *       500:
 *         description: Server error
 */
router.put('/:id', authenticateToken, isOperator, tagController.updateTag);

/**
 * @swagger
 * /api/tags/{id}:
 *   delete:
 *     summary: Delete a tag
 *     tags: [Tags]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Tag ID
 *     responses:
 *       200:
 *         description: Tag deleted successfully
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
 *         description: Tag not found
 *       409:
 *         description: Tag is in use and cannot be deleted
 *       500:
 *         description: Server error
 */
router.delete('/:id', authenticateToken, isOperator, tagController.deleteTag);

module.exports = router;
