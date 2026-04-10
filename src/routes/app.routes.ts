import express from 'express'
import appController from '../controllers/AppController'
import verifyJwtMiddlewares from '../middlewares/verifyJwt.middlewares'
import validate from '../middlewares/validation.middleware'

import {
  appIdSchema,
  createServiceSchema,

} from '../validation/schemas/service.schema'
import { organizationIdSchema } from '../validation/schemas/organization.schema'
const routes = express.Router()

routes.post(
  '/:orgId/',
  verifyJwtMiddlewares.verifyJwt,
  validate(organizationIdSchema, 'params'),
  validate(createServiceSchema,),
  appController.createApp
)

routes.post(
  '/assign/:orgId/:appId/:targetUserId',
  verifyJwtMiddlewares.verifyJwt,
  validate(organizationIdSchema, 'params'),
  //validate(appIdSchema, 'params'),
  //validate(userIdSchema, 'params'),
  appController.assignUserToApp
)

routes.delete(
  '/:orgId/:svcId',
  verifyJwtMiddlewares.verifyJwt,
  validate(organizationIdSchema,'params'),
  validate(appIdSchema,'params'),
  appController.deleteApp
)

routes.get(
  '/:orgId/:svcId',
  verifyJwtMiddlewares.verifyJwt,
  validate(organizationIdSchema,'params'),
  validate(appIdSchema,'params'),
  appController.getAppById
)

routes.get(
  '/users/:orgId/:svcId',
  verifyJwtMiddlewares.verifyJwt,
  validate(organizationIdSchema,'params'),
  validate(appIdSchema,'params'),
  appController.getAssignedUsersForApp
)

//  TODO: REMOVE ASSIGNED USERS FOR SERVICE

export default routes
