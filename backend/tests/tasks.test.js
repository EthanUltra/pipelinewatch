const request = require('supertest')
const jwt = require('jsonwebtoken')
const app = require('../src/app')

process.env.JWT_SECRET = 'test-secret-key'

jest.mock('@prisma/client', () => {
  const mockPrisma = {
    user: { findUnique: jest.fn(), create: jest.fn() },
    task: {
      findMany: jest.fn(),
      create: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      delete: jest.fn()
    }
  }
  return { PrismaClient: jest.fn(() => mockPrisma) }
})

jest.mock('argon2', () => ({ hash: jest.fn(), verify: jest.fn() }))

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const token = jwt.sign({ userId: 'user-1' }, 'test-secret-key')
const auth = { Authorization: `Bearer ${token}` }

const mockTask = { id: 'task-1', title: 'Fix bug', description: null, priority: 'HIGH', status: 'TODO', userId: 'user-1' }

describe('GET /api/tasks', () => {
  beforeEach(() => jest.clearAllMocks())

  it('returns tasks for authenticated user', async () => {
    prisma.task.findMany.mockResolvedValue([mockTask])
    const res = await request(app).get('/api/tasks').set(auth)
    expect(res.status).toBe(200)
    expect(res.body.tasks).toHaveLength(1)
    expect(res.body.tasks[0].title).toBe('Fix bug')
  })

  it('rejects unauthenticated request with 401', async () => {
    const res = await request(app).get('/api/tasks')
    expect(res.status).toBe(401)
  })
})

describe('POST /api/tasks', () => {
  beforeEach(() => jest.clearAllMocks())

  it('creates a new task', async () => {
    prisma.task.create.mockResolvedValue(mockTask)
    const res = await request(app).post('/api/tasks').set(auth).send({ title: 'Fix bug', priority: 'HIGH' })
    expect(res.status).toBe(201)
    expect(res.body.task.title).toBe('Fix bug')
  })

  it('rejects task with empty title', async () => {
    const res = await request(app).post('/api/tasks').set(auth).send({ title: '' })
    expect(res.status).toBe(400)
  })

  it('rejects invalid priority', async () => {
    const res = await request(app).post('/api/tasks').set(auth).send({ title: 'Task', priority: 'CRITICAL' })
    expect(res.status).toBe(400)
  })
})

describe('PATCH /api/tasks/:id', () => {
  beforeEach(() => jest.clearAllMocks())

  it('updates task status', async () => {
    prisma.task.findFirst.mockResolvedValue(mockTask)
    prisma.task.update.mockResolvedValue({ ...mockTask, status: 'IN_PROGRESS' })
    const res = await request(app).patch('/api/tasks/task-1').set(auth).send({ status: 'IN_PROGRESS' })
    expect(res.status).toBe(200)
    expect(res.body.task.status).toBe('IN_PROGRESS')
  })

  it('returns 404 for task not owned by user', async () => {
    prisma.task.findFirst.mockResolvedValue(null)
    const res = await request(app).patch('/api/tasks/other-task').set(auth).send({ status: 'DONE' })
    expect(res.status).toBe(404)
  })
})

describe('DELETE /api/tasks/:id', () => {
  beforeEach(() => jest.clearAllMocks())

  it('deletes a task', async () => {
    prisma.task.findFirst.mockResolvedValue(mockTask)
    prisma.task.delete.mockResolvedValue(mockTask)
    const res = await request(app).delete('/api/tasks/task-1').set(auth)
    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
  })

  it('returns 404 for task not owned by user', async () => {
    prisma.task.findFirst.mockResolvedValue(null)
    const res = await request(app).delete('/api/tasks/other-task').set(auth)
    expect(res.status).toBe(404)
  })
})
