const express = require('express')
const { z } = require('zod')
const { PrismaClient } = require('@prisma/client')
const auth = require('../middleware/auth')

const router = express.Router()
const prisma = new PrismaClient()

const taskSchema = z.object({
  title: z.string().min(1).max(120),
  description: z.string().max(500).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).default('MEDIUM'),
  status: z.enum(['TODO', 'IN_PROGRESS', 'DONE']).default('TODO')
})

const updateSchema = taskSchema.partial()

router.use(auth)

// GET all tasks for current user
router.get('/', async (req, res) => {
  try {
    const tasks = await prisma.task.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: 'desc' }
    })
    res.json({ tasks })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch tasks' })
  }
})

// POST create task
router.post('/', async (req, res) => {
  try {
    const data = taskSchema.parse(req.body)
    const task = await prisma.task.create({ data: { ...data, userId: req.userId } })
    res.status(201).json({ task })
  } catch (err) {
    if (err.name === 'ZodError') return res.status(400).json({ error: err.errors[0].message })
    console.error(err)
    res.status(500).json({ error: 'Failed to create task' })
  }
})

// PATCH update task (status/priority/title)
router.patch('/:id', async (req, res) => {
  try {
    const existing = await prisma.task.findFirst({ where: { id: req.params.id, userId: req.userId } })
    if (!existing) return res.status(404).json({ error: 'Task not found' })
    const data = updateSchema.parse(req.body)
    const task = await prisma.task.update({ where: { id: req.params.id }, data })
    res.json({ task })
  } catch (err) {
    if (err.name === 'ZodError') return res.status(400).json({ error: err.errors[0].message })
    console.error(err)
    res.status(500).json({ error: 'Failed to update task' })
  }
})

// DELETE task
router.delete('/:id', async (req, res) => {
  try {
    const existing = await prisma.task.findFirst({ where: { id: req.params.id, userId: req.userId } })
    if (!existing) return res.status(404).json({ error: 'Task not found' })
    await prisma.task.delete({ where: { id: req.params.id } })
    res.json({ success: true })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to delete task' })
  }
})

module.exports = router
