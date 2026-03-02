import express from 'express'
const routes = express.Router()
import authController from '../controllers/AuthController'
import verifyJwtMiddlewares from '../middlewares/verifyJwt.middlewares'
import validate from '../middlewares/validation.middleware'
import { deleteProfileSchema, forgotPasswordSchema, getProfileSchema, loginSchema, logoutSchema, registerSchema, resetPasswordSchema, updateEmailSchema, updateUsernameSchema, updatePasswordSchema, verifyOtpSchema } from '../validation/schemas/user.schema'
import rateLimiter from '../middlewares/ratelimiter.middleware'


routes.post(
  '/register',
  validate(registerSchema),
  authController.handleSignup
)

routes.post(
  '/signin',
  validate(loginSchema),
  rateLimiter(9,2, ()=> 'signin'),
  authController.handleSignin
)

routes.post(
  '/forgot-password',
  rateLimiter(5, 2, () => 'forgot-password'),
  validate(forgotPasswordSchema),
  authController.forgotPassword
)

routes.post(
  '/verify-otp',
  rateLimiter(9, 2, () => 'verify-otp'),
  validate(verifyOtpSchema),
  authController.verifyOtp
)

routes.post(
  '/reset-password',
  rateLimiter(6, 2, () => 'reset-password'),
  validate(resetPasswordSchema),
  authController.resetPassword
)

routes.put(
  '/username',
  validate(updateUsernameSchema),
  rateLimiter(12, 2, () => 'username'),
  authController.updateUsername
)

routes.put(
  '/password',
  validate(updatePasswordSchema),
  rateLimiter(6, 2, () => 'password'),
  authController.updateUserPassword
)

routes.post('/logout',authController.handleLogout)

routes.get(
  '/me',
  verifyJwtMiddlewares.verifyJwt,
  authController.getCurrentUser
)

routes.delete(
  '/delete-account',
  verifyJwtMiddlewares.verifyJwt,
  validate(deleteProfileSchema),
  authController.deleteAccount
)





export default routes
