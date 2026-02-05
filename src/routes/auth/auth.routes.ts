import express from 'express'
const routes = express.Router()
import authController from '../../controllers/AuthController'
import verifyJwtMiddlewares from '../../middlewares/verifyJwt.middlewares'
import { body } from 'express-validator'

// working on the auth routes

// POST /register
routes.post(
  '/register',
  [
    body('username').notEmpty().withMessage('username is required').trim(),
    body('email').notEmpty().withMessage('Email is required')
      .isEmail().withMessage('Invalid email address')
      .normalizeEmail()
      .trim()
      .withMessage('Invalid email address'),
    body('password')
      .isLength({ min: 10 })
      .withMessage('Password must be at least 10 characters long'),
  ],
  authController.handleSignup
)

// POST /login
routes.post(
  '/login',
  [
    body('email')
      .notEmpty()
      .withMessage('Email is required')
      .isEmail()
      .withMessage('Invalid email address')
      .normalizeEmail()
      .trim(),
    body('password')
      .notEmpty()
      .withMessage('Password is required')
      .isLength({ min: 10 })
      .withMessage('Password must be atleast 10 characters long'),
  ],
  authController.handleSignin
)

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

// DELETE /user
routes.delete("/:id", verifyJwtMiddlewares.verifyJwt, authController.deleteAccount)

export default routes
