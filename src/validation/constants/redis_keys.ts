export const redisKey = {
    auth: (id: string) => `auth:${id}`,
    otp: (email:string) => `otp:${email}`,
    reset: (email:string)=> `reset:password:${email}`
}