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

// POST /accept-invite
routes.post('/accept-invite', organizationController.acceptOrganizationInvite)

// PUT /update-role/:targetUserId/:orgId
routes.put(
  '/update-role/:targetUserId/:orgId',
  verifyJwtMiddlewares.verifyJwt,
  organizationController.updateUserRole
)


// /GET /all organizations
routes.get(
  '/all',
  verifyJwtMiddlewares.verifyJwt,
  organizationController.getAllOrganization
)
// POST /send-invite
routes.post(
  '/:orgId/sendInvite',
  verifyJwtMiddlewares.verifyJwt,
  organizationController.sendInvitation
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

// GET /:id
routes.get(
  '/:id',
  verifyJwtMiddlewares.verifyJwt,
  organizationController.getOrganizationById
)



// GET /members/:id
routes.get(
  '/members/:orgId',
  verifyJwtMiddlewares.verifyJwt,
  organizationController.getMembersInOrganization
)



export default routes
