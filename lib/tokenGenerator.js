import { sign } from 'jsonwebtoken'
import dotenv from 'dotenv'

dotenv.config()

const tokenGenerator = (uuid, email, expiresIn = '15m') => {
  return sign(
    { uuid, email },
    process.env.JWT_SECRET,
    { expiresIn }
  )
}

export default tokenGenerator