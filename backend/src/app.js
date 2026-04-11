const express = require('express')
const cors = require('cors')
const rateLimit = require('express-rate-limit')

const authRoutes = require('./routes/auth')
const taskRoutes = require('./routes/tasks')

const app = express()

app.set('trust proxy', 1)

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}))

app.use(express.json())

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 })
app.use(limiter)

app.get('/api/health', (req, res) => res.json({ status: 'ok', version: '1.0.0' }))

app.use('/api/auth', authRoutes)
app.use('/api/tasks', taskRoutes)

app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ error: 'Internal server error' })
})

module.exports = app
