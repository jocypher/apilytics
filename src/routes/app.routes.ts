import express from 'express'
import appController from '../controllers/AppController'
import verifyJwtMiddlewares from '../middlewares/verifyJwt.middlewares'
import validate from '../middlewares/validation.middleware'
import { createServiceSchema, serviceIdSchema } from '../validation/schemas/service.schema'
import { organizationIdSchema } from '../validation/schemas/organization.schema'
const routes = express.Router()

routes.post(
  '/:orgId',
  verifyJwtMiddlewares.verifyJwt,
  validate(createServiceSchema),
  validate(organizationIdSchema),
  appController.createApp
)

routes.post(
  '/assign/:orgId/:serviceId/:roleToChangeId',
  verifyJwtMiddlewares.verifyJwt,
  validate(serviceIdSchema),
  validate(organizationIdSchema),
  appController.assignUserToApp
)

routes.delete(
  '/:orgId/:svcId',
  verifyJwtMiddlewares.verifyJwt,
  validate(organizationIdSchema),
  validate(serviceIdSchema),
  appController.deleteApp
)

routes.get(
  '/:orgId/:svcId',
  verifyJwtMiddlewares.verifyJwt,
  validate(organizationIdSchema),
  validate(serviceIdSchema),
  appController.getAppById
)

routes.get(
  '/users/:orgId/:svcId',
  verifyJwtMiddlewares.verifyJwt,
  validate(organizationIdSchema),
  validate(serviceIdSchema),
  appController.getAssignedUsersForApp
)

//  TODO: REMOVE ASSIGNED USERS FOR SERVICE

export default routes
