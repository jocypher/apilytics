import express from 'express'
const routes = express.Router()
import authController from '../../controllers/AuthController'
import verifyJwtMiddlewares from '../../middlewares/verifyJwt.middlewares'
import { body } from 'express-validator'
import { validate } from 'uuid'

routes.post(
  '/register',
  [
    body('username').notEmpty().withMessage('Username is required').trim(),
    body('email')
      .notEmpty()
      .withMessage('Email is required')
      .isEmail()
      .withMessage('Invalid email address')
      .normalizeEmail()
      .trim()
      .withMessage('Invalid email address'),
    body('password')
      .isLength({ min: 10 })
      .withMessage('Password must be at least 10 characters long'),
  ],
  validate,
  authController.handleSignup
)

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
  validate,
  authController.handleSignin
)

routes.post(
  '/forgot-password',
  [
    body('email')
      .notEmpty()
      .withMessage('Email is required')
      .isEmail()
      .withMessage('Invalid email address')
      .normalizeEmail()
      .trim(),
  ],
  validate,
  authController.forgotPassword
)

routes.post(
  '/verify-otp',
  [
    body('email')
      .notEmpty()
      .withMessage('Email is required')
      .isEmail()
      .withMessage('Invalid email address')
      .normalizeEmail()
      .trim(),
    body('otp')
      .notEmpty()
      .withMessage('Otp code is required')
      .isLength({ min: 6 }),
  ],
  validate,
  authController.verifyOtp
)

routes.post(
  '/reset-password',
  [
    body('email')
      .notEmpty()
      .withMessage('Email is required')
      .isEmail()
      .withMessage('Invalid email')
      .normalizeEmail()
      .trim(),

    body('password')
      .notEmpty()
      .withMessage('Password is required')
      .isLength({ min: 10 })
      .withMessage('Password must be atleast 10 characters long'),
  ],
  validate,
  authController.resetPassword
)

routes.post(
  '/update-info',
  [
    body('email')
      .notEmpty()
      .withMessage('Email is required')
      .isEmail()
      .withMessage('Invalid email')
      .normalizeEmail()
      .trim(),
    body('password')
      .notEmpty()
      .withMessage('Password is required')
      .isLength({ min: 10 })
      .withMessage('Password must be atleast 10 characters long'),
    body('username').notEmpty().withMessage('username is require'),
  ],
  validate,
  authController.updateUser
)

routes.post('/logout', authController.handleLogout)

routes.get('/me', verifyJwtMiddlewares.verifyJwt, authController.getCurrentUser)

routes.delete(
  '/:id',
  verifyJwtMiddlewares.verifyJwt,
  authController.deleteAccount
)

export default routes
