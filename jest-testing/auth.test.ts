
import dotenv from 'dotenv'

dotenv.config({ path: '.env.test' }) 

import authService from '../src/services/auth.service'
import bcrypt from 'bcryptjs'


jest.mock('bcryptjs')



test('addition of two numbers', ()=>{
    expect(authService.sum(1, 3)).toBe(4)
})


test('generated code returns a 4 digit string', ()=>{
    const otp = authService.generateOTPCode()
    expect(otp).toMatch(/^\d{4}$/)
})

test('storedHashed Otp Code', async()=>{
    (bcrypt.hash as jest.Mock).mockResolvedValue('Hashed Otp')
    const result = await authService.storeHashedOtpCode('1234')
    expect(result).toBe('Hashed Otp')
    expect(bcrypt.hash).toHaveBeenCalledWith('1234', 10)
})