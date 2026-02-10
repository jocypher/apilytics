import express from 'express'
const routes = express.Router()
import authController from '../controllers/AuthController'
import verifyJwtMiddlewares from '../middlewares/verifyJwt.middlewares'
import validate from '../middlewares/validation.middleware'
import { deleteProfileSchema, forgotPasswordSchema, getProfileSchema, loginSchema, logoutSchema, registerSchema, resetPasswordSchema, updateUserSchema, verifyOtpSchema } from '../validation/schemas/user.schema'


routes.post(
  '/register',
  validate(registerSchema),
  authController.handleSignup
)

routes.post(
  '/login',
  validate(loginSchema),
  authController.handleSignin
)

routes.post(
  '/forgot-password',
  validate(forgotPasswordSchema),
  authController.forgotPassword
)

routes.post(
  '/verify-otp',
  validate(verifyOtpSchema),
  authController.verifyOtp
)

routes.post(
  '/reset-password',
  validate(resetPasswordSchema),
  authController.resetPassword
)

routes.put(
  '/update/:id',
  validate(updateUserSchema),
  authController.updateUser
)

routes.post('/logout/:id',validate(logoutSchema), authController.handleLogout)

routes.get(
  '/:id',
  verifyJwtMiddlewares.verifyJwt,
  validate(getProfileSchema),
  authController.getCurrentUser
)

routes.delete(
  '/:id',
  verifyJwtMiddlewares.verifyJwt,
  validate(deleteProfileSchema),
  authController.deleteAccount
)

export default routes
