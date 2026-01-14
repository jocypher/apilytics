import express from "express"
import verifyJwtMiddlewares from "../../middlewares/verifyJwt.middlewares"
import organizationController from "../../controllers/organization.controller"

const routes = express.Router()



// creating organizationn
routes.post("/create-org",verifyJwtMiddlewares.verifyJwt,organizationController.createOrganization)


// getting all organization
routes.get("/all", verifyJwtMiddlewares.verifyJwt,organizationController.getAllOrganization)


// updating the organization information
routes.put("/org/:id", verifyJwtMiddlewares.verifyJwt, organizationController.updateOrganization)

// delete organization
routes.delete("/delete/:id", verifyJwtMiddlewares.verifyJwt, organizationController.deleteOrganization)

// get members in an organization 
routes.get("/members/:id", verifyJwtMiddlewares.verifyJwt, organizationController.getMembersInOrganization)

// get organization by id
routes.get("/org/:id",verifyJwtMiddlewares.verifyJwt, organizationController.getOrganizationById)

// sending user invite
routes.post("/send-invite", verifyJwtMiddlewares.verifyJwt, organizationController.sendInvitation)


// accepting user invite
routes.post("/accept-invite", organizationController.acceptOrganizationInvite)


// updating user role
routes.post("/update-role/:targetUserId/:orgId", verifyJwtMiddlewares.verifyJwt, organizationController .updateUserRole)





export default routes