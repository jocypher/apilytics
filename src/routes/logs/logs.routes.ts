import express from 'express'
import logsController from '../../controllers/LogController'
import verifyJwtMiddlewares from '../../middlewares/verifyJwt.middlewares'
import { verifyApiKey } from '../../middlewares/verifyApi.middlewares'
const routes = express.Router()

// routes for both the manual logs and the automatic logs
// manual logs are created by the assigned users with role admin

// POST /org/:orgId/service/:serviceId/logs/manual
routes.post(
  '/:orgId/service/:serviceId/logs/manual',
  verifyJwtMiddlewares.verifyJwt,
  logsController.createManualLogs
)

// GET /org/:orgId/service/:serviceId/logs/manual
routes.get(
  '/:orgId/service/:serviceId/logs/manual',
  verifyJwtMiddlewares.verifyJwt,
  logsController.getAllManualLogs
)

// GET /org/:orgId/service/:serviceId/logs/automated
routes.post(
  '/logs/ingest',
  verifyApiKey,
  logsController.ingestLogs
)

export default routes
