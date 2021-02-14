import { sign } from 'jsonwebtoken'
import dotenv from 'dotenv'

dotenv.config()

const tokenGenerator = (id, email, expiresIn = '15m') => {
  return sign(
    { id, email },
    process.env.JWT_SECRET,
    { expiresIn }
  )
}

export default tokenGenerator