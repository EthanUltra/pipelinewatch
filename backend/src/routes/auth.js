const express = require('express')
const argon2 = require('argon2')
const jwt = require('jsonwebtoken')
const { z } = require('zod')
const { PrismaClient } = require('@prisma/client')

const router = express.Router()
const prisma = new PrismaClient()

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8)
})

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
})

router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = registerSchema.parse(req.body)
    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) return res.status(409).json({ error: 'Email already registered' })
    const hashed = await argon2.hash(password)
    const user = await prisma.user.create({ data: { name, email, password: hashed } })
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' })
    res.status(201).json({ token, user: { id: user.id, name: user.name, email: user.email } })
  } catch (err) {
    if (err.name === 'ZodError') return res.status(400).json({ error: err.errors[0].message })
    console.error(err)
    res.status(500).json({ error: 'Registration failed' })
  }
})

router.post('/login', async (req, res) => {
  try {
    const { email, password } = loginSchema.parse(req.body)
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) return res.status(401).json({ error: 'Invalid credentials' })
    const valid = await argon2.verify(user.password, password)
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' })
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' })
    res.json({ token, user: { id: user.id, name: user.name, email: user.email } })
  } catch (err) {
    if (err.name === 'ZodError') return res.status(400).json({ error: err.errors[0].message })
    console.error(err)
    res.status(500).json({ error: 'Login failed' })
  }
})

router.get('/me', async (req, res) => {
  const header = req.headers.authorization
  if (!header) return res.status(401).json({ error: 'Unauthorised' })
  try {
    const token = header.split(' ')[1]
    const { userId } = jwt.verify(token, process.env.JWT_SECRET)
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true, name: true, email: true, createdAt: true } })
    if (!user) return res.status(404).json({ error: 'User not found' })
    res.json({ user })
  } catch {
    res.status(401).json({ error: 'Invalid token' })
  }
})

module.exports = router
