require('dotenv').config()
const { execSync } = require('child_process')
const app = require('./app')

const PORT = process.env.PORT || 4000

// Run DB migration on startup
if (process.env.NODE_ENV === 'production') {
  try {
    console.log('Running database migration...')
    execSync('npx prisma db push --accept-data-loss', { stdio: 'inherit' })
    console.log('Migration complete.')
  } catch (err) {
    console.error('Migration failed:', err.message)
  }
}

app.listen(PORT, () => {
  console.log(`PipelineWatch API running on port ${PORT}`)
})
