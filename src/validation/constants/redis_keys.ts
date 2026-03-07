export const redisKey = {
  auth: (id: string) => `auth:${id}`,
  otp: (email: string) => `otp:${email}`,
  reset: (email: string) => `reset:password:${email}`,
  invite: (token: string) => `org_invite:${token}`,
}