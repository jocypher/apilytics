import express from 'express'
const routes = express.Router()
import authController from '../controllers/AuthController'
import verifyJwtMiddlewares from '../middlewares/verifyJwt.middlewares'
import validate from '../middlewares/validation.middleware'
import {
  deleteProfileSchema,
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
  updateUsernameSchema,
  updatePasswordSchema,
  verifyOtpSchema,
  refreshTokenValidation,
} from '../validation/schemas/user.schema'
import rateLimiter from '../middlewares/ratelimiter.middleware'
import { rateLimitKeys } from '../validation/constants/rate_limit_keys'
import passport from '../configs/passport'

routes.post('/register', validate(registerSchema), authController.handleSignup)

routes.post(
  '/signin',
  validate(loginSchema),
  rateLimiter(10, 600, rateLimitKeys.signin),
  authController.handleSignin
)

routes.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
)
routes.get(
  '/google/callback',
  passport.authenticate('google', { session: false }),
  authController.googleCallback
)

routes.post(
  '/refresh',
  validate(refreshTokenValidation),
  authController.handleRefreshToken
)
routes.post(
  '/forgot-password',
  rateLimiter(5, 120, rateLimitKeys.forgotPassword),
  validate(forgotPasswordSchema),
  authController.forgotPassword
)

routes.post(
  '/verify-otp',
  rateLimiter(10, 60, rateLimitKeys.verifyOtp),
  validate(verifyOtpSchema),
  authController.verifyOtp
)

routes.post(
  '/reset-password',
  rateLimiter(5, 300, rateLimitKeys.resetPassword),
  validate(resetPasswordSchema),
  authController.resetPassword
)

routes.put(
  '/username',
  validate(updateUsernameSchema),
  rateLimiter(10, 60, rateLimitKeys.updateUsername),
  authController.updateUsername
)

routes.put(
  '/password',
  validate(updatePasswordSchema),
  rateLimiter(5, 60, rateLimitKeys.updateUserPassword),
  authController.updateUserPassword
)

routes.post('/logout', authController.handleLogout)

routes.get('/me', verifyJwtMiddlewares.verifyJwt, authController.getCurrentUser)

routes.delete(
  '/delete-account',
  verifyJwtMiddlewares.verifyJwt,
  validate(deleteProfileSchema),
  authController.deleteAccount
)

export default routes
