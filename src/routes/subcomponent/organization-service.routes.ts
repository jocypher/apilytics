// this routes works with the subcomponents where we create the subcomponents
// in this we assign users to this and also remove the users that have been assigned
// we also need to ensure users

import express from 'express'
import serviceController from '../../controllers/OrganizationServiceController'
import verifyJwtMiddlewares from '../../middlewares/verifyJwt.middlewares'
const routes = express.Router()

// POST /:orgId
routes.post(
  '/:orgId',
  verifyJwtMiddlewares.verifyJwt,
  serviceController.createService
)

// POST /assign/:orgId/:serviceId/:roleToChangeId
routes.post(
  '/assign/:orgId/:serviceId/:roleToChangeId',
  verifyJwtMiddlewares.verifyJwt,
  serviceController.assignUserToService
)

// DELETE /:orgId/:svcId
routes.delete(
  '/:orgId/:svcId',
  verifyJwtMiddlewares.verifyJwt,
  serviceController.deleteService
)

// GET /:orgId/:serviceId
routes.get(
  '/:orgId/:serviceId',
  verifyJwtMiddlewares.verifyJwt,
  serviceController.getServiceById
)

// GET /users/:orgId/:svcId
routes.get(
  '/users/:orgId/:svcId',
  verifyJwtMiddlewares.verifyJwt,
  serviceController.getAssignedUserForService
)

//  TODO: REMOVE ASSIGNED USERS FOR SERVICE 


export default routes
