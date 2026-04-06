import passport from 'passport'
import {Strategy as GoogleStrategy} from 'passport-google-oauth20'
import authService from '../services/auth.service'

passport.use(
  new GoogleStrategy(
    {
      passReqToCallback:true,
      clientID: process.env.CLIENT_ID || '',
      clientSecret: process.env.CLIENT_SECRET || '',
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (
      profile: any,
      done: any
    ) => {
      try {
        const user = await authService.handleGoogleService(profile)
        done(null, user)
      } catch (e: any) {
        done(e, null)
      }
    }
  )
)


export default passport 