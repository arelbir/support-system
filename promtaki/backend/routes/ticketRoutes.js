const express = require('express');
const router = express.Router();
const ticketController = require('../controllers/ticketController');
const { authenticateToken, isOperator, isCustomerOrOperator } = require('../middleware/authMiddleware');

/**
 * @swagger
 * components:
 *   schemas:
 *     Ticket:
 *       type: object
 *       required:
 *         - subject
 *         - description
 *       properties:
 *         id:
 *           type: integer
 *           description: The auto-generated ID of the ticket
 *         subject:
 *           type: string
 *           description: Ticket subject/title
 *         description:
 *           type: string
 *           description: Detailed description of the issue
 *         status:
 *           type: object
 *           properties:
 *             id:
 *               type: integer
 *             name:
 *               type: string
 *             color:
 *               type: string
 *           description: Current status of the ticket
 *         priority:
 *           type: string
 *           enum: [low, medium, high, urgent]
 *           description: Priority level of the ticket
 *         userId:
 *           type: integer
 *           description: ID of the user who created the ticket
 *         assignedOperatorId:
 *           type: integer
 *           description: ID of the operator assigned to the ticket
 *         category:
 *           type: string
 *           description: Category of the ticket
 *         productId:
 *           type: integer
 *           description: ID of the product the ticket relates to
 *         moduleId:
 *           type: integer
 *           description: ID of the module within the product
 *         type:
 *           type: string
 *           enum: [bug, suggestion, question, feature_request, other]
 *           description: Type of the ticket
 *         company:
 *           type: string
 *           description: Company name associated with the ticket
 *         notifyEmails:
 *           type: array
 *           items:
 *             type: string
 *           description: Email addresses to notify about ticket updates
 *         timeSpent:
 *           type: number
 *           description: Total time spent on the ticket in minutes
 *         dueDate:
 *           type: string
 *           format: date-time
 *           description: Due date for ticket resolution
 *         isResolved:
 *           type: boolean
 *           description: Whether the ticket is resolved
 *         resolvedAt:
 *           type: string
 *           format: date-time
 *           description: When the ticket was resolved
 *         slaPaused:
 *           type: boolean
 *           description: Whether SLA timing is paused
 *         slaPausedAt:
 *           type: string
 *           format: date-time
 *           description: When SLA was paused
 *         slaPausedReason:
 *           type: string
 *           description: Reason for SLA pause
 *         history:
 *           type: array
 *           description: History of ticket changes
 *         timeMetrics:
 *           type: object
 *           description: SLA and time tracking metrics
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The date the ticket was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: The date the ticket was last updated
 *       example:
 *         id: 1
 *         subject: "Login problem"
 *         description: "I cannot login to my account after password reset"
 *         status: 
 *           id: 1
 *           name: "Açık"
 *           color: "#3B82F6"
 *         priority: "medium"
 *         userId: 1
 *         assignedOperatorId: null
 *         category: "Authentication"
 *         productId: null
 *         moduleId: null
 *         type: "other"
 *         company: null
 *         notifyEmails: []
 *         timeSpent: 0
 *         isResolved: false
 *         resolvedAt: null
 *         slaPaused: false
 *         slaPausedAt: null
 *         slaPausedReason: null
 *         history: []
 *         createdAt: "2025-04-12T00:58:36.946Z"
 *         updatedAt: "2025-04-12T00:58:36.946Z"
 * 
 *     TicketRequest:
 *       type: object
 *       required:
 *         - subject
 *         - description
 *       properties:
 *         subject:
 *           type: string
 *           description: Ticket subject/title
 *         description:
 *           type: string
 *           description: Detailed description of the issue
 *         priority:
 *           type: string
 *           enum: [low, medium, high, urgent]
 *           description: Priority level of the ticket
 *         category:
 *           type: string
 *           description: Category of the ticket
 *         type:
 *           type: string
 *           enum: [bug, suggestion, question, feature_request, other]
 *           description: Type of the ticket
 *         productId:
 *           type: integer
 *           description: ID of the product the ticket relates to
 *         moduleId:
 *           type: integer
 *           description: ID of the module within the product
 *         company:
 *           type: string
 *           description: Company name associated with the ticket
 *         notifyEmails:
 *           type: array
 *           items:
 *             type: string
 *           description: Email addresses to notify about ticket updates
 *         tagIds:
 *           type: array
 *           items:
 *             type: integer
 *           description: IDs of tags to associate with the ticket
 *       example:
 *         subject: "Login problem"
 *         description: "I cannot login to my account after password reset"
 *         priority: "medium"
 *         category: "Authentication"
 *         type: "problem"
 *         productId: 1
 *         moduleId: 2
 *         notifyEmails: ["support@example.com"]
 *         tagIds: [1, 3]
 */

/**
 * @swagger
 * tags:
 *   name: Tickets
 *   description: Support ticket management
 */

/**
 * @swagger
 * /api/tickets:
 *   post:
 *     summary: Create a new support ticket
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TicketRequest'
 *     responses:
 *       201:
 *         description: Ticket created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 ticket:
 *                   $ref: '#/components/schemas/Ticket'
 *       401:
 *         description: Not authenticated
 *       500:
 *         description: Server error
 */
router.post('/', authenticateToken, ticketController.createTicket);

/**
 * @swagger
 * /api/tickets/my:
 *   get:
 *     summary: Get current user's tickets
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of tickets per page
 *     responses:
 *       200:
 *         description: List of user's tickets
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 tickets:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Ticket'
 *                 currentPage:
 *                   type: integer
 *                 totalPages:
 *                   type: integer
 *                 totalItems:
 *                   type: integer
 *       401:
 *         description: Not authenticated
 *       500:
 *         description: Server error
 */
router.get('/my', authenticateToken, ticketController.getMyTickets);

/**
 * @swagger
 * /api/tickets/queue:
 *   get:
 *     summary: Get ticket queue for operators
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of tickets per page
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter by status
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *         description: Filter by priority
 *     responses:
 *       200:
 *         description: List of tickets in the queue
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 tickets:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Ticket'
 *                 currentPage:
 *                   type: integer
 *                 totalPages:
 *                   type: integer
 *                 totalItems:
 *                   type: integer
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized
 *       500:
 *         description: Server error
 */
router.get('/queue', authenticateToken, isOperator, ticketController.getTicketQueue);

/**
 * @swagger
 * /api/tickets/{id}:
 *   get:
 *     summary: Get ticket details by ID
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Ticket ID
 *     responses:
 *       200:
 *         description: Ticket details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ticket:
 *                   $ref: '#/components/schemas/Ticket'
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized
 *       404:
 *         description: Ticket not found
 *       500:
 *         description: Server error
 */
router.get('/:id', authenticateToken, isCustomerOrOperator, ticketController.getTicketById);

/**
 * @swagger
 * /api/tickets/{id}/assign:
 *   put:
 *     summary: Assign an operator to a ticket
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Ticket ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - operatorId
 *             properties:
 *               operatorId:
 *                 type: integer
 *                 description: ID of the operator to assign
 *     responses:
 *       200:
 *         description: Operator assigned successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 ticket:
 *                   $ref: '#/components/schemas/Ticket'
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized
 *       404:
 *         description: Ticket or operator not found
 *       500:
 *         description: Server error
 */
router.put('/:id/assign', authenticateToken, isOperator, ticketController.assignOperator);

/**
 * @swagger
 * /api/tickets/{id}/assign-multiple:
 *   put:
 *     summary: Assign multiple operators to a ticket
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Ticket ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - operators
 *             properties:
 *               operators:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     operatorId:
 *                       type: integer
 *                       description: ID of the operator to assign
 *                     isPrimary:
 *                       type: boolean
 *                       description: Whether this operator is primary
 *                     notes:
 *                       type: string
 *                       description: Assignment notes
 *     responses:
 *       200:
 *         description: Operators assigned successfully
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized
 *       404:
 *         description: Ticket not found
 *       500:
 *         description: Server error
 */
router.put('/:id/assign-multiple', authenticateToken, isOperator, ticketController.assignMultipleOperators);

/**
 * @swagger
 * /api/tickets/{id}/tags:
 *   put:
 *     summary: Assign tags to a ticket
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Ticket ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - tagIds
 *             properties:
 *               tagIds:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 description: IDs of tags to assign
 *     responses:
 *       200:
 *         description: Tags assigned successfully
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized
 *       404:
 *         description: Ticket not found
 *       500:
 *         description: Server error
 */
router.put('/:id/tags', authenticateToken, isOperator, ticketController.addTagsToTicket);

/**
 * @swagger
 * /api/tickets/{id}/time-log:
 *   post:
 *     summary: Add time log to a ticket
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Ticket ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - timeSpent
 *             properties:
 *               timeSpent:
 *                 type: integer
 *                 description: Time spent in minutes
 *               description:
 *                 type: string
 *                 description: Description of work done
 *               activityType:
 *                 type: string
 *                 description: Type of activity (e.g., investigation, development)
 *               startTime:
 *                 type: string
 *                 format: date-time
 *                 description: When the work started
 *               endTime:
 *                 type: string
 *                 format: date-time
 *                 description: When the work ended
 *               isBillable:
 *                 type: boolean
 *                 description: Whether this time is billable
 *     responses:
 *       201:
 *         description: Time log added successfully
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized
 *       404:
 *         description: Ticket not found
 *       500:
 *         description: Server error
 */
router.post('/:id/time-log', authenticateToken, isOperator, ticketController.addTimeLog);

/**
 * @swagger
 * /api/tickets/{id}/pause-sla:
 *   post:
 *     summary: Pause SLA for a ticket
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Ticket ID
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *                 description: Reason for pausing SLA
 *     responses:
 *       200:
 *         description: SLA paused successfully
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized
 *       404:
 *         description: Ticket not found
 *       500:
 *         description: Server error
 */
router.post('/:id/pause-sla', authenticateToken, isOperator, ticketController.pauseSLA);

/**
 * @swagger
 * /api/tickets/{id}/resume-sla:
 *   post:
 *     summary: Resume SLA for a ticket
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Ticket ID
 *     responses:
 *       200:
 *         description: SLA resumed successfully
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized
 *       404:
 *         description: Ticket not found
 *       500:
 *         description: Server error
 */
router.post('/:id/resume-sla', authenticateToken, isOperator, ticketController.resumeSLA);

/**
 * @swagger
 * /api/tickets/{id}/status:
 *   put:
 *     summary: Update ticket status
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Ticket ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - statusId
 *             properties:
 *               statusId:
 *                 type: integer
 *                 description: ID of the status to set
 *     responses:
 *       200:
 *         description: Status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 ticket:
 *                   $ref: '#/components/schemas/Ticket'
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized
 *       404:
 *         description: Ticket not found
 *       500:
 *         description: Server error
 */
router.put('/:id/status', authenticateToken, isOperator, ticketController.updateTicketStatus);

module.exports = router;
