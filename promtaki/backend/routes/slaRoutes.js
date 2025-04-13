const express = require('express');
const router = express.Router();
const slaController = require('../controllers/slaController');
const { authenticateToken, isOperator } = require('../middleware/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: SLA
 *   description: Service Level Agreement management
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     SLA:
 *       type: object
 *       required:
 *         - productId
 *         - priority
 *         - responseTime
 *         - resolutionTime
 *       properties:
 *         id:
 *           type: integer
 *           description: The auto-generated ID of the SLA
 *         productId:
 *           type: integer
 *           description: ID of the product this SLA applies to
 *         priority:
 *           type: string
 *           enum: [low, medium, high, urgent]
 *           description: Priority level this SLA applies to
 *         responseTime:
 *           type: integer
 *           description: Required response time in minutes
 *         resolutionTime:
 *           type: integer
 *           description: Required resolution time in minutes
 *         description:
 *           type: string
 *           description: Additional information about the SLA
 *         isActive:
 *           type: boolean
 *           description: Whether the SLA is active
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: When the SLA was created
 *     BusinessHours:
 *       type: object
 *       required:
 *         - dayOfWeek
 *         - isWorkingDay
 *       properties:
 *         id:
 *           type: integer
 *           description: The auto-generated ID
 *         dayOfWeek:
 *           type: integer
 *           description: Day of week (0=Sunday, 6=Saturday)
 *         isWorkingDay:
 *           type: boolean
 *           description: Whether this is a working day
 *         startTime:
 *           type: string
 *           description: Start time (e.g., "09:00")
 *         endTime:
 *           type: string
 *           description: End time (e.g., "17:00")
 *     Holiday:
 *       type: object
 *       required:
 *         - name
 *         - date
 *       properties:
 *         id:
 *           type: integer
 *           description: The auto-generated ID
 *         name:
 *           type: string
 *           description: Holiday name
 *         date:
 *           type: string
 *           format: date
 *           description: Holiday date
 *         isRecurringYearly:
 *           type: boolean
 *           description: Whether this holiday recurs every year
 */

/**
 * @swagger
 * /api/sla:
 *   get:
 *     summary: Get all SLAs
 *     tags: [SLA]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: productId
 *         schema:
 *           type: integer
 *         description: Filter by product ID
 *       - in: query
 *         name: active
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *     responses:
 *       200:
 *         description: List of SLAs
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 slas:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/SLA'
 *       401:
 *         description: Not authenticated
 *       500:
 *         description: Server error
 */
router.get('/', authenticateToken, slaController.getAllSLAs);

/**
 * @swagger
 * /api/sla:
 *   post:
 *     summary: Create a new SLA
 *     tags: [SLA]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productId
 *               - priority
 *               - responseTime
 *               - resolutionTime
 *             properties:
 *               productId:
 *                 type: integer
 *                 description: Product ID this SLA applies to
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high, urgent]
 *                 description: Priority level this SLA applies to
 *               responseTime:
 *                 type: integer
 *                 description: Required response time in minutes
 *               resolutionTime:
 *                 type: integer
 *                 description: Required resolution time in minutes
 *               description:
 *                 type: string
 *                 description: Additional information about the SLA
 *     responses:
 *       201:
 *         description: SLA created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 sla:
 *                   $ref: '#/components/schemas/SLA'
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized
 *       404:
 *         description: Product not found
 *       409:
 *         description: SLA for this product and priority already exists
 *       500:
 *         description: Server error
 */
router.post('/', authenticateToken, isOperator, slaController.createSLA);

/**
 * @swagger
 * /api/sla/business-hours:
 *   get:
 *     summary: Get business hours
 *     tags: [SLA]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Business hours configuration
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 businessHours:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/BusinessHours'
 *       401:
 *         description: Not authenticated
 *       500:
 *         description: Server error
 */
router.get('/business-hours', authenticateToken, slaController.getBusinessHours);

/**
 * @swagger
 * /api/sla/business-hours:
 *   put:
 *     summary: Update business hours
 *     tags: [SLA]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - businessHours
 *             properties:
 *               businessHours:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - dayOfWeek
 *                     - isWorkingDay
 *                   properties:
 *                     dayOfWeek:
 *                       type: integer
 *                       description: Day of week (0=Sunday, 6=Saturday)
 *                     isWorkingDay:
 *                       type: boolean
 *                       description: Whether this is a working day
 *                     startTime:
 *                       type: string
 *                       description: Start time (e.g., "09:00")
 *                     endTime:
 *                       type: string
 *                       description: End time (e.g., "17:00")
 *     responses:
 *       200:
 *         description: Business hours updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 businessHours:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/BusinessHours'
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized
 *       500:
 *         description: Server error
 */
router.put('/business-hours', authenticateToken, isOperator, slaController.updateBusinessHours);

/**
 * @swagger
 * /api/sla/holidays:
 *   get:
 *     summary: Get holidays
 *     tags: [SLA]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *         description: Filter by year
 *     responses:
 *       200:
 *         description: List of holidays
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 holidays:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Holiday'
 *       401:
 *         description: Not authenticated
 *       500:
 *         description: Server error
 */
router.get('/holidays', authenticateToken, slaController.getHolidays);

/**
 * @swagger
 * /api/sla/holidays:
 *   post:
 *     summary: Create a new holiday
 *     tags: [SLA]
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
 *               - date
 *             properties:
 *               name:
 *                 type: string
 *                 description: Holiday name
 *               date:
 *                 type: string
 *                 format: date
 *                 description: Holiday date (YYYY-MM-DD)
 *               isRecurringYearly:
 *                 type: boolean
 *                 description: Whether this holiday recurs every year
 *     responses:
 *       201:
 *         description: Holiday created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 holiday:
 *                   $ref: '#/components/schemas/Holiday'
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized
 *       409:
 *         description: Holiday already exists for this date
 *       500:
 *         description: Server error
 */
router.post('/holidays', authenticateToken, isOperator, slaController.createHoliday);

/**
 * @swagger
 * /api/sla/holidays/{id}:
 *   put:
 *     summary: Update a holiday
 *     tags: [SLA]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Holiday ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Holiday name
 *               date:
 *                 type: string
 *                 format: date
 *                 description: Holiday date (YYYY-MM-DD)
 *               isRecurringYearly:
 *                 type: boolean
 *                 description: Whether this holiday recurs every year
 *     responses:
 *       200:
 *         description: Holiday updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 holiday:
 *                   $ref: '#/components/schemas/Holiday'
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized
 *       404:
 *         description: Holiday not found
 *       409:
 *         description: Holiday already exists for this date
 *       500:
 *         description: Server error
 */
router.put('/holidays/:id', authenticateToken, isOperator, slaController.updateHoliday);

/**
 * @swagger
 * /api/sla/holidays/{id}:
 *   delete:
 *     summary: Delete a holiday
 *     tags: [SLA]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Holiday ID
 *     responses:
 *       200:
 *         description: Holiday deleted successfully
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
 *         description: Holiday not found
 *       500:
 *         description: Server error
 */
router.delete('/holidays/:id', authenticateToken, isOperator, slaController.deleteHoliday);

/**
 * @swagger
 * /api/sla/calculate:
 *   post:
 *     summary: Calculate SLA due dates for a given product and priority
 *     tags: [SLA]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productId
 *               - priority
 *             properties:
 *               productId:
 *                 type: integer
 *                 description: Product ID
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high, urgent]
 *                 description: Priority level
 *               startDate:
 *                 type: string
 *                 format: date-time
 *                 description: Starting date for calculation (defaults to now)
 *     responses:
 *       200:
 *         description: SLA due dates calculated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 sla:
 *                   type: object
 *                   properties:
 *                     product:
 *                       type: object
 *                     priority:
 *                       type: string
 *                     responseTime:
 *                       type: integer
 *                     resolutionTime:
 *                       type: integer
 *                 dueDates:
 *                   type: object
 *                   properties:
 *                     startDate:
 *                       type: string
 *                       format: date-time
 *                     responseDueDate:
 *                       type: string
 *                       format: date-time
 *                     resolutionDueDate:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Not authenticated
 *       404:
 *         description: SLA not found for this product and priority
 *       500:
 *         description: Server error
 */
router.post('/calculate', authenticateToken, slaController.calculateSLADueDate);

/**
 * @swagger
 * /api/sla/{id}:
 *   get:
 *     summary: Get SLA by ID
 *     tags: [SLA]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: SLA ID
 *     responses:
 *       200:
 *         description: SLA details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 sla:
 *                   $ref: '#/components/schemas/SLA'
 *       401:
 *         description: Not authenticated
 *       404:
 *         description: SLA not found
 *       500:
 *         description: Server error
 */
router.get('/:id', authenticateToken, slaController.getSLAById);

/**
 * @swagger
 * /api/sla/{id}:
 *   put:
 *     summary: Update an SLA
 *     tags: [SLA]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: SLA ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               productId:
 *                 type: integer
 *                 description: Product ID this SLA applies to
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high, urgent]
 *                 description: Priority level this SLA applies to
 *               responseTime:
 *                 type: integer
 *                 description: Required response time in minutes
 *               resolutionTime:
 *                 type: integer
 *                 description: Required resolution time in minutes
 *               description:
 *                 type: string
 *                 description: Additional information about the SLA
 *               isActive:
 *                 type: boolean
 *                 description: Whether the SLA is active
 *     responses:
 *       200:
 *         description: SLA updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 sla:
 *                   $ref: '#/components/schemas/SLA'
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized
 *       404:
 *         description: SLA not found
 *       409:
 *         description: SLA for this product and priority already exists
 *       500:
 *         description: Server error
 */
router.put('/:id', authenticateToken, isOperator, slaController.updateSLA);

/**
 * @swagger
 * /api/sla/{id}:
 *   delete:
 *     summary: Delete an SLA
 *     tags: [SLA]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: SLA ID
 *     responses:
 *       200:
 *         description: SLA deleted successfully
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
 *         description: SLA not found
 *       409:
 *         description: SLA is in use and cannot be deleted
 *       500:
 *         description: Server error
 */
router.delete('/:id', authenticateToken, isOperator, slaController.deleteSLA);

module.exports = router;
