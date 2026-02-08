import express from 'express'
import logsController from '../controllers/LogController'
import verifyJwtMiddlewares from '../middlewares/verifyJwt.middlewares'
import { verifyApiKey } from '../middlewares/verifyApi.middlewares'
import { validate } from 'uuid'
import { body } from 'express-validator'
const routes = express.Router()

routes.post(
  '/:orgId/service/:serviceId/logs/manual',
  [
    body('logMessage').notEmpty().withMessage('Log message required').trim(),
    body('logStatus').notEmpty().withMessage('Log status is required').trim(),
    body('tag name').notEmpty().withMessage('Tag name is required').trim(),
  ],
  validate,
  verifyJwtMiddlewares.verifyJwt,
  logsController.createManualLogs
)

routes.get(
  '/:orgId/service/:serviceId/logs/manual',
  verifyJwtMiddlewares.verifyJwt,
  logsController.getAllManualLogs
)

routes.post(
  '/logs/ingest',
  [body('message').notEmpty().withMessage('log message is required').trim()],
  validate,
  verifyApiKey,
  logsController.ingestLogs
)

export default routes
