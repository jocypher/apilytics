import { Request } from "express"
export const rateLimitKeys = {
  signin: (req: Request) => `rate:signin:${req.body.email || req.ip}`,
  forgotPassword: (req: Request) =>
    `rate:forgot-password:${req.body.email || req.ip}`,
  verifyOtp: (req: Request) => `rate:verify:${req.body.email || req.ip}`,
  resetPassword: (req: Request) => `rate:reset:${req.body.email || req.ip}`,
  updateUsername: (req: Request) => `rate:update-username:${(req as any).id}`,
  updateUserPassword: (req: Request) => `rate:update-password:${(req as any).id}`,
}