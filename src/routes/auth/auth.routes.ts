import express from 'express'
const routes = express.Router()
import authController from '../../controllers/AuthController'
import verifyJwtMiddlewares from '../../middlewares/verifyJwt.middlewares'

// working on the auth routes

// POST /register
routes.post('/register', authController.handleSignup)

// POST /login
routes.post('/login', authController.handleSignin)

// POST /forgot-password
routes.post('/forgot-password', authController.forgotPassword)

// POST /verify-otp
routes.post('/verify-otp', authController.verifyOtp)

// POST /reset-password
routes.post('/reset-password', authController.resetPassword)

// PUT /update
routes.post('/update-info', authController.updateUser)

// POST /logout
routes.post("/logout", authController.handleLogout)



// GET /me
routes.get("/me", verifyJwtMiddlewares.verifyJwt, authController.getCurrentUser)

export default routes
