const required = (key: string) => {
  const value = process.env[key]
  if (!value) {
    throw new Error(`Missing env variable: ${key}`)
  }
  return value
}

export const env = {
  PORT: Number(required('PORT')),
  DEV_ENVIRONMENT: required('DEV_ENVIRONMENT'),
  ADMIN_PASSWORD: required('ADMIN_PASSWORD'),
  ADMIN_USERNAME: required('ADMIN_USERNAME'),
  JWT_SECRET: required('JWT_SECRET')
}