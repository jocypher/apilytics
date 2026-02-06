import express from 'express'
import serviceController from '../controllers/OrganizationServiceController'
import verifyJwtMiddlewares from '../middlewares/verifyJwt.middlewares'
const routes = express.Router()

routes.post(
  '/:orgId',
  verifyJwtMiddlewares.verifyJwt,
  serviceController.createService
)

routes.post(
  '/assign/:orgId/:serviceId/:roleToChangeId',
  verifyJwtMiddlewares.verifyJwt,
  serviceController.assignUserToService
)

routes.delete(
  '/:orgId/:svcId',
  verifyJwtMiddlewares.verifyJwt,
  serviceController.deleteService
)

routes.get(
  '/:orgId/:serviceId',
  verifyJwtMiddlewares.verifyJwt,
  serviceController.getServiceById
)

routes.get(
  '/users/:orgId/:svcId',
  verifyJwtMiddlewares.verifyJwt,
  serviceController.getAssignedUserForService
)

//  TODO: REMOVE ASSIGNED USERS FOR SERVICE

export default routes
