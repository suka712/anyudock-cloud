const required = (key: string) => {
  const value = process.env[key]
  if (!value) {
    throw new Error(`Missing env variable: ${key}`)
  }
  return value
}

export const env = {
  PORT: Number(required('PORT')),
  ADMIN_PASSWORD: required('ADMIN_PASSWORD'),
  ADMIN_USERNAME: required('ADMIN_USERNAME'),
  JWT_SECRET: required('JWT_SECRET'),
  S3_ENDPOINT: required('S3_ENDPOINT'),
  S3_BUCKET_NAME: required('S3_BUCKET_NAME'),
  S3_ACCESS_KEY_ID: required('S3_ACCESS_KEY_ID'),
  S3_SECRET_ACCESS_KEY: required('S3_SECRET_ACCESS_KEY'),
}