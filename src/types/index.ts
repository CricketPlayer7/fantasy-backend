export interface AuthTokens {
  access_token: string
  refresh_token: string
}

export interface User {
  id: string
  email: string
  [key: string]: any
}

export interface AuthConfirmQuery {
  token_hash?: string
  type?: string
}

export interface SentimentQuery {
  league_id?: string
  match_id?: string
  question_id?: string
}

export interface SentimentResponse {
  success: boolean
  data?: any
  error?: string
  message?: string
}

export interface MulterFile {
  fieldname: string
  originalname: string
  encoding: string
  mimetype: string
  buffer: Buffer
  size: number
}

// No need to extend Express Request interface for multer 2.x
// as the types are already properly defined in @types/multer
