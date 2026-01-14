
// this routes works with the subcomponents where we create the subcomponents 
// in this we assign users to this and also remove the users that have been assigned
// we also need to ensure users 

import express from "express"
import serviceController from "../../controllers/sub_component.controller"
import verifyJwtMiddlewares from "../../middlewares/verifyJwt.middlewares"
const routes = express.Router()



// creating a service 
routes.post("/:orgId",verifyJwtMiddlewares.verifyJwt, serviceController.createService)


// assign role to service 
routes.post("/assign/:orgId/:serviceId/:roleToChangeId", verifyJwtMiddlewares.verifyJwt, serviceController.assignUserToService)


// delete the service 
routes.delete("/:orgId/:svcId", verifyJwtMiddlewares.verifyJwt,serviceController.deleteService)

// get service by id
routes.get("/service/:orgId/:serviceId", verifyJwtMiddlewares.verifyJwt, serviceController.getServiceById)


// get assigned users for the service
routes.get("service/users/:orgId/:svcId", verifyJwtMiddlewares.verifyJwt, serviceController.getAssignedUserForService)

export default routes