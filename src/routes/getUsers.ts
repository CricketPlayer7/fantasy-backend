import express from 'express'
import { adminAuthMiddleware } from '../middleware/adminAuth'
import { GetUsersController } from '../controllers/getUsersController'

const router = express.Router()
const getUsersController = new GetUsersController()

// Get users with pagination and filtering
router.get(
	'/',
	adminAuthMiddleware,
	getUsersController.getUsers.bind(getUsersController)
)

// Get user statistics (original endpoint functionality)
router.get(
	'/stats',
	adminAuthMiddleware,
	getUsersController.getUserStats.bind(getUsersController)
)

export default router

// # Get all users with pagination
// GET /api/get-users?page=1&limit=25

// # Search users by email
// GET /api/get-users?search=gmail.com

// # Get banned users
// GET /api/get-users?status=banned

// # Get recently registered users
// GET /api/get-users?sortBy=created_at&sortOrder=desc

// # Get user statistics
// GET /api/get-users/stats
