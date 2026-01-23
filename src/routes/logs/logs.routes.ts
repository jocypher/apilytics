import express from "express"
import logsController from "../../controllers/LogController"
import { verify } from "jsonwebtoken"
import verifyJwtMiddlewares from "../../middlewares/verifyJwt.middlewares"
const routes = express.Router()



// routes for both the manual logs and the automatic logs
// manual logs are created by the assigned users with role admin 

// POST /org/:orgId/service/:serviceId/logs/manual
routes.post("/:orgId/service/:serviceId/logs/manual",verifyJwtMiddlewares.verifyJwt, logsController.createManualLogs)

// GET /org/:orgId/service/:serviceId/logs/manual
routes.get("/:orgId/service/:serviceId/logs/manual",verifyJwtMiddlewares.verifyJwt, logsController.getAllManualLogs)

// GET /org/:orgId/service/:serviceId/logs/automated
routes.get("/:orgId/service/:serviceId/logs/automated",verifyJwtMiddlewares.verifyJwt, logsController.getAutomatedLogs)



export default routes