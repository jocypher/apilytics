import express from 'express'
import verifyJwtMiddlewares from '../../middlewares/verifyJwt.middlewares'
import organizationController from '../../controllers/OrganizationController'

const routes = express.Router()

// POST /create-org
routes.post(
  '/create-org',
  verifyJwtMiddlewares.verifyJwt,
  organizationController.createOrganization
)

// /GET /all organizations
routes.get(
  '/all',
  verifyJwtMiddlewares.verifyJwt,
  organizationController.getAllOrganization
)

// PUT /:id 
routes.put(
  '/:id',
  verifyJwtMiddlewares.verifyJwt,
  organizationController.updateOrganization
)

// DELET /:id
routes.delete(
  '/:id',
  verifyJwtMiddlewares.verifyJwt,
  organizationController.deleteOrganization
)

// GET /members/:id
routes.get(
  '/members/:id',
  verifyJwtMiddlewares.verifyJwt,
  organizationController.getMembersInOrganization
)

// GET /:id
routes.get(
  '/:id',
  verifyJwtMiddlewares.verifyJwt,
  organizationController.getOrganizationById
)

// POST /send-invite
routes.post(
  '/send-invite',
  verifyJwtMiddlewares.verifyJwt,
  organizationController.sendInvitation
)

// POST /accept-invite
routes.post('/accept-invite', organizationController.acceptOrganizationInvite)

// PUT /update-role/:targetUserId/:orgId
routes.post(
  '/update-role/:targetUserId/:orgId',
  verifyJwtMiddlewares.verifyJwt,
  organizationController.updateUserRole
)

export default routes
