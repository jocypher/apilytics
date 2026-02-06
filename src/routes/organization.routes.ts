import express from 'express'
import verifyJwtMiddlewares from '../middlewares/verifyJwt.middlewares'
import organizationController from '../controllers/OrganizationController'

const routes = express.Router()

routes.post(
  '/create-org',
  verifyJwtMiddlewares.verifyJwt,
  organizationController.createOrganization
)

routes.post('/accept-invite', organizationController.acceptOrganizationInvite)

routes.put(
  '/update-role/:targetUserId/:orgId',
  verifyJwtMiddlewares.verifyJwt,
  organizationController.updateUserRole
)

routes.get(
  '/all',
  verifyJwtMiddlewares.verifyJwt,
  organizationController.getAllOrganization
)

routes.post(
  '/:orgId/sendInvite',
  verifyJwtMiddlewares.verifyJwt,
  organizationController.sendInvitation
)

routes.put(
  '/:id',
  verifyJwtMiddlewares.verifyJwt,
  organizationController.updateOrganization
)

routes.delete(
  '/:id',
  verifyJwtMiddlewares.verifyJwt,
  organizationController.deleteOrganization
)

routes.get(
  '/:id',
  verifyJwtMiddlewares.verifyJwt,
  organizationController.getOrganizationById
)

routes.get(
  '/members/:orgId',
  verifyJwtMiddlewares.verifyJwt,
  organizationController.getMembersInOrganization
)

export default routes
