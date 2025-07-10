import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export function generateReferralToken(payload: any): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '2d' })
}

export function verifyReferralToken(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch (error) {
    return null
  }
}
