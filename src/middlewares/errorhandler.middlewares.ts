import { Request, Response, NextFunction } from 'express'
import { AppError } from '../validation/utils/errors/app-error'

const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      message: err.message,
    })
  }

  return res.status(500).json({ message: 'Internal Server Error' })
}

export default errorHandler
