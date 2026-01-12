import express from "express"
import verifyJwtMiddlewares from "../../middlewares/verifyJwt.middlewares"
import organizationController from "../../controllers/organization.controller"

const routes = express.Router()



// creating organizationn
routes.post("/create-org",verifyJwtMiddlewares.verifyJwt,organizationController.createOrganization)

// getting all organization
routes.get("/all", verifyJwtMiddlewares.verifyJwt,organizationController.getAllOrganization)

// delete organization
routes.delete("/delete/:id", verifyJwtMiddlewares.verifyJwt, organizationController.deleteOrganization)

// get members in an organization 
routes.get("/members/:id", verifyJwtMiddlewares.verifyJwt, organizationController.getMembersInOrganization)

// sending user invite
routes.post("/send-invite", verifyJwtMiddlewares.verifyJwt, organizationController.sendInvitation)

// 






export default routes