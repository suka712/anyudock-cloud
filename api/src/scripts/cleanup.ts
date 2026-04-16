import { cleanupExpiredFiles } from '../utils/cleanup.ts'

try {
  const count = await cleanupExpiredFiles()
  console.log(`Cleanup finished. Removed ${count} expired file(s).`)
  process.exit(0)
} catch (e) {
  console.error('Cleanup failed:', e)
  process.exit(1)
}
