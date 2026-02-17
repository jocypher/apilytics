import express from 'express'
import logsController from '../controllers/LogController'
import verifyJwtMiddlewares from '../middlewares/verifyJwt.middlewares'
import { verifyApiKey } from '../middlewares/verifyApi.middlewares'
import { createManualLogsSchema, ingestLogsSchema } from '../validation/schemas/log.schema'
import validate from '../middlewares/validation.middleware'
import { userIdSchema } from '../validation/schemas/user.schema'
import { organizationIdSchema } from '../validation/schemas/organization.schema'
import { serviceIdSchema } from '../validation/schemas/service.schema'
const routes = express.Router()

routes.post(
  '/:orgId/service/:serviceId/logs/manual',
  verifyJwtMiddlewares.verifyJwt,
  validate(createManualLogsSchema),
  logsController.createManualLogs
)

routes.get(
  '/:orgId/service/:serviceId/logs/manual',
  verifyJwtMiddlewares.verifyJwt,
  validate(userIdSchema),
  validate(organizationIdSchema),
  validate(serviceIdSchema),
  logsController.getAllManualLogs
)

routes.post(
  '/logs/ingest',
  validate(ingestLogsSchema),
  verifyApiKey,
  logsController.ingestLogs
)

export default routes
