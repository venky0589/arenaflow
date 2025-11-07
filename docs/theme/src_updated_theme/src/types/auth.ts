export interface LoginResponse {
  token: string
  email: string
  roles: string[]
}

export interface LoginRequest {
  email: string
  password: string
}
