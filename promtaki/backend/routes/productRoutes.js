const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { authenticateToken, isOperator } = require('../middleware/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: Products
 *   description: Product and module management
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         id:
 *           type: integer
 *           description: The auto-generated ID of the product
 *         name:
 *           type: string
 *           description: Product name
 *         description:
 *           type: string
 *           description: Product description
 *         version:
 *           type: string
 *           description: Product version
 *         releaseDate:
 *           type: string
 *           format: date
 *           description: Date of product release
 *         supportEndDate:
 *           type: string
 *           format: date
 *           description: End date of product support
 *         isActive:
 *           type: boolean
 *           description: Whether the product is active
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: When the product was created
 *         modules:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Module'
 *           description: Modules associated with this product
 *     Module:
 *       type: object
 *       required:
 *         - name
 *         - productId
 *       properties:
 *         id:
 *           type: integer
 *           description: The auto-generated ID of the module
 *         name:
 *           type: string
 *           description: Module name
 *         description:
 *           type: string
 *           description: Module description
 *         productId:
 *           type: integer
 *           description: ID of the product this module belongs to
 *         isActive:
 *           type: boolean
 *           description: Whether the module is active
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: When the module was created
 */

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Get all products
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: active
 *         schema:
 *           type: boolean
 *         description: Filter products by active status
 *     responses:
 *       200:
 *         description: List of products
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 products:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Product'
 *       401:
 *         description: Not authenticated
 *       500:
 *         description: Server error
 */
router.get('/', authenticateToken, productController.getAllProducts);

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: Get product by ID
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Product details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 product:
 *                   $ref: '#/components/schemas/Product'
 *       401:
 *         description: Not authenticated
 *       404:
 *         description: Product not found
 *       500:
 *         description: Server error
 */
router.get('/:id', authenticateToken, productController.getProductById);

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Create a new product
 *     tags: [Products]
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
 *                 description: Product name
 *               description:
 *                 type: string
 *                 description: Product description
 *               version:
 *                 type: string
 *                 description: Product version
 *               releaseDate:
 *                 type: string
 *                 format: date
 *                 description: Date of product release
 *               supportEndDate:
 *                 type: string
 *                 format: date
 *                 description: End date of product support
 *     responses:
 *       201:
 *         description: Product created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 product:
 *                   $ref: '#/components/schemas/Product'
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized
 *       409:
 *         description: Product with this name already exists
 *       500:
 *         description: Server error
 */
router.post('/', authenticateToken, isOperator, productController.createProduct);

/**
 * @swagger
 * /api/products/{id}:
 *   put:
 *     summary: Update a product
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Product ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Product name
 *               description:
 *                 type: string
 *                 description: Product description
 *               version:
 *                 type: string
 *                 description: Product version
 *               releaseDate:
 *                 type: string
 *                 format: date
 *                 description: Date of product release
 *               supportEndDate:
 *                 type: string
 *                 format: date
 *                 description: End date of product support
 *               isActive:
 *                 type: boolean
 *                 description: Active status
 *     responses:
 *       200:
 *         description: Product updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 product:
 *                   $ref: '#/components/schemas/Product'
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized
 *       404:
 *         description: Product not found
 *       409:
 *         description: Product with this name already exists
 *       500:
 *         description: Server error
 */
router.put('/:id', authenticateToken, isOperator, productController.updateProduct);

/**
 * @swagger
 * /api/products/{id}:
 *   delete:
 *     summary: Delete a product
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Product deleted successfully
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
 *         description: Product not found
 *       409:
 *         description: Product is in use and cannot be deleted
 *       500:
 *         description: Server error
 */
router.delete('/:id', authenticateToken, isOperator, productController.deleteProduct);

/**
 * @swagger
 * /api/products/{id}/modules:
 *   get:
 *     summary: Get all modules for a product
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Product ID
 *       - in: query
 *         name: active
 *         schema:
 *           type: boolean
 *         description: Filter modules by active status
 *     responses:
 *       200:
 *         description: List of modules for the product
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 product:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     name:
 *                       type: string
 *                 modules:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Module'
 *       401:
 *         description: Not authenticated
 *       404:
 *         description: Product not found
 *       500:
 *         description: Server error
 */
router.get('/:id/modules', authenticateToken, productController.getProductModules);

/**
 * @swagger
 * /api/products/{id}/modules:
 *   post:
 *     summary: Create a new module for a product
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Product ID
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
 *                 description: Module name
 *               description:
 *                 type: string
 *                 description: Module description
 *     responses:
 *       201:
 *         description: Module created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 module:
 *                   $ref: '#/components/schemas/Module'
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized
 *       404:
 *         description: Product not found
 *       409:
 *         description: Module with this name already exists for this product
 *       500:
 *         description: Server error
 */
router.post('/:id/modules', authenticateToken, isOperator, productController.createModule);

/**
 * @swagger
 * /api/products/{id}/modules/{moduleId}:
 *   get:
 *     summary: Get module details by ID
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Product ID
 *       - in: path
 *         name: moduleId
 *         schema:
 *           type: integer
 *         required: true
 *         description: Module ID
 *     responses:
 *       200:
 *         description: Module details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 module:
 *                   $ref: '#/components/schemas/Module'
 *       401:
 *         description: Not authenticated
 *       404:
 *         description: Module not found
 *       500:
 *         description: Server error
 */
router.get('/:id/modules/:moduleId', authenticateToken, productController.getModuleById);

/**
 * @swagger
 * /api/products/{id}/modules/{moduleId}:
 *   put:
 *     summary: Update a module
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Product ID
 *       - in: path
 *         name: moduleId
 *         schema:
 *           type: integer
 *         required: true
 *         description: Module ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Module name
 *               description:
 *                 type: string
 *                 description: Module description
 *               isActive:
 *                 type: boolean
 *                 description: Active status
 *     responses:
 *       200:
 *         description: Module updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 module:
 *                   $ref: '#/components/schemas/Module'
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized
 *       404:
 *         description: Module not found
 *       409:
 *         description: Module with this name already exists for this product
 *       500:
 *         description: Server error
 */
router.put('/:id/modules/:moduleId', authenticateToken, isOperator, productController.updateModule);

/**
 * @swagger
 * /api/products/{id}/modules/{moduleId}:
 *   delete:
 *     summary: Delete a module
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Product ID
 *       - in: path
 *         name: moduleId
 *         schema:
 *           type: integer
 *         required: true
 *         description: Module ID
 *     responses:
 *       200:
 *         description: Module deleted successfully
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
 *         description: Module not found
 *       409:
 *         description: Module is in use and cannot be deleted
 *       500:
 *         description: Server error
 */
router.delete('/:id/modules/:moduleId', authenticateToken, isOperator, productController.deleteModule);

module.exports = router;
