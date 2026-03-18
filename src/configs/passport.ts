import passport from 'passport'
import {Strategy as GoogleStrategy} from 'passport-google-oauth20'
import authService from '../services/auth.service'

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.CLIENT_ID || '',
      clientSecret: process.env.CLIENT_SECRET || '',
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (
      accessToken: string,
      refreshToken: string,
      profile: any,
      done: any
    ) => {
      try {
        const user = await authService.handleGoogleService(profile)
        done(null, user)
      } catch (e) {
        done(e, null)
      }
    }
  )
)

// passport.serializeUser((user, done) => done(null, user))
// passport.deserializeUser((user, done) => done(null, user!))


export default passport 