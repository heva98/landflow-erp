export interface Role {
  id: string
  name: string
  description: string
  full_access: boolean
  read_only_all: boolean
}

export interface User {
  id: string
  email: string
  first_name: string
  last_name: string
  role: Role | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Me extends User {
  permissions: string[]
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface TokenPair {
  access: string
  refresh: string
}
