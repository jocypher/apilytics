import express from 'express'
const routes = express.Router()
import authController from '../../controllers/AuthController'

// working on the auth routes

// creating the user account
routes.post('/register', authController.handleSignup)

// login the user
routes.post('/login', authController.handleSignin)

// forgot password
routes.post('/forgot-password', authController.forgotPassword)

//routes.post("/getRedis", authController.validateToken)
routes.post('/verify-otp', authController.verifyOtp)

// resetting the user password
routes.post('/reset-password', authController.resetPassword)

// updating the user info
routes.post('/update-info', authController.updateUser)

// loggin out as a user
routes.post("/logout", authController.handleLogout)

export default routes
