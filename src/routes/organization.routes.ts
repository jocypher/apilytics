import express from 'express'
import verifyJwtMiddlewares from '../middlewares/verifyJwt.middlewares'
import organizationController from '../controllers/OrganizationController'
import validate from '../middlewares/validation.middleware'
import { acceptOrganizationTokenSchema, createOrgSchema, deleteOrganizationSchema, sendInvitationSchema, updateOrgSchema } from '../validation/schemas/organization.schema'


const routes = express.Router()

routes.post(
  '/',
  verifyJwtMiddlewares.verifyJwt,
  validate(createOrgSchema),
  organizationController.createOrganization
)

routes.post(
  '/acceptInvite',
  validate(acceptOrganizationTokenSchema),
  organizationController.acceptOrganizationInvite
)

routes.put(
  '/updateRole/:orgId/:targetUserId',
  verifyJwtMiddlewares.verifyJwt,
  validate(updateOrgSchema),
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
  validate(sendInvitationSchema),
  organizationController.sendInvitation
)

routes.put(
  '/:id',
  verifyJwtMiddlewares.verifyJwt,
  validate(updateOrgSchema),
  organizationController.updateOrganization
)

routes.delete(
  '/:id',
  verifyJwtMiddlewares.verifyJwt,
  validate(deleteOrganizationSchema),
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
