import 'joi'

 declare module 'joi' {
  interface StringSchema {
    passwordComplexity(): this
  }
}

