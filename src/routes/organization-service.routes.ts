import express from 'express'
import serviceController from '../controllers/OrganizationServiceController'
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
  serviceController.createService
)

routes.post(
  '/assign/:orgId/:serviceId/:roleToChangeId',
  verifyJwtMiddlewares.verifyJwt,
  validate(serviceIdSchema),
  validate(organizationIdSchema),
  serviceController.assignUserToService
)

routes.delete(
  '/:orgId/:svcId',
  verifyJwtMiddlewares.verifyJwt,
  validate(organizationIdSchema),
  validate(serviceIdSchema),
  serviceController.deleteService
)

routes.get(
  '/:orgId/:svcId',
  verifyJwtMiddlewares.verifyJwt,
  validate(organizationIdSchema),
  validate(serviceIdSchema),
  serviceController.getServiceById
)

routes.get(
  '/users/:orgId/:svcId',
  verifyJwtMiddlewares.verifyJwt,
  validate(organizationIdSchema),
  validate(serviceIdSchema),
  serviceController.getAssignedUserForService
)

//  TODO: REMOVE ASSIGNED USERS FOR SERVICE

export default routes
