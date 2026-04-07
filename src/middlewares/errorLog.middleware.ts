import { NextFunction, Request, Response } from 'express'
import logger from './logger.middlewares'

const errorLogger = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  if (err instanceof Error) {
    logger(`${err.name}\t${err.message}`, 'errorLog.txt')
    return res.json({ message: err.message })
  }

  logger(`Unknown Error`, 'errorLog.txt')
  return res.status(500).json({
    message: 'Internal Server Error',
  })
}

export default errorLogger
