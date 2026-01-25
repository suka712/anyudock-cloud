const required = (key: string) => {
  const value = process.env[key]
  if (!value) {
    throw new Error(`Missing env variable: ${key}`)
  }
  return value
}

export const env = {
  PORT: Number(required('PORT'))
}