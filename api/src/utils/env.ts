const required = (key: string) => {
  const value = process.env[key]
  if (!value) {
    throw new Error(`Missing env variable: ${key}`)
  }
  return value
}

export const env = {
  PORT: Number(required('PORT')),
  JWT_SECRET: required('JWT_SECRET'),
  DATABASE_URL: required('DATABASE_URL'),
  RESEND_API_KEY: required('RESEND_API_KEY'),
  ALLOWED_ORIGINS: required('ALLOWED_ORIGINS'),
  S3_ENDPOINT: required('S3_ENDPOINT'),
  S3_BUCKET_NAME: required('S3_BUCKET_NAME'),
  S3_ACCESS_KEY_ID: required('S3_ACCESS_KEY_ID'),
  S3_SECRET_ACCESS_KEY: required('S3_SECRET_ACCESS_KEY'),
}
