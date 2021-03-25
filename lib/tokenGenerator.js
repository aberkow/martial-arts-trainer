import { sign } from 'jsonwebtoken'
import dotenv from 'dotenv'

dotenv.config()

const tokenGenerator = (uuid, expiresIn = '15m') => {
  return sign(
    { uuid },
    process.env.JWT_SECRET,
    { expiresIn }
  )
}

export default tokenGenerator