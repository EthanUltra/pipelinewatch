const request = require('supertest')
const app = require('../src/app')

process.env.JWT_SECRET = 'test-secret-key'
process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://test:test@localhost:5432/test'

jest.mock('@prisma/client', () => {
  const mockPrisma = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn()
    },
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

jest.mock('argon2', () => ({
  hash: jest.fn().mockResolvedValue('hashed_password'),
  verify: jest.fn().mockResolvedValue(true)
}))

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

describe('GET /api/health', () => {
  it('returns status ok', async () => {
    const res = await request(app).get('/api/health')
    expect(res.status).toBe(200)
    expect(res.body.status).toBe('ok')
  })
})

describe('POST /api/auth/register', () => {
  beforeEach(() => jest.clearAllMocks())

  it('registers a new user and returns a token', async () => {
    prisma.user.findUnique.mockResolvedValue(null)
    prisma.user.create.mockResolvedValue({ id: 'user-1', name: 'Test User', email: 'test@example.com' })

    const res = await request(app).post('/api/auth/register').send({
      name: 'Test User',
      email: 'test@example.com',
      password: 'Password1!'
    })

    expect(res.status).toBe(201)
    expect(res.body).toHaveProperty('token')
    expect(res.body.user.email).toBe('test@example.com')
  })

  it('rejects duplicate email with 409', async () => {
    prisma.user.findUnique.mockResolvedValue({ id: 'user-1', email: 'test@example.com' })

    const res = await request(app).post('/api/auth/register').send({
      name: 'Test User',
      email: 'test@example.com',
      password: 'Password1!'
    })

    expect(res.status).toBe(409)
    expect(res.body.error).toMatch(/already registered/i)
  })

  it('rejects invalid email with 400', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Test',
      email: 'not-an-email',
      password: 'Password1!'
    })
    expect(res.status).toBe(400)
  })

  it('rejects short password with 400', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Test',
      email: 'test@example.com',
      password: 'short'
    })
    expect(res.status).toBe(400)
  })
})

describe('POST /api/auth/login', () => {
  beforeEach(() => jest.clearAllMocks())

  it('logs in and returns token', async () => {
    prisma.user.findUnique.mockResolvedValue({ id: 'user-1', name: 'Test', email: 'test@example.com', password: 'hashed' })

    const res = await request(app).post('/api/auth/login').send({
      email: 'test@example.com',
      password: 'Password1!'
    })

    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('token')
  })

  it('rejects unknown user with 401', async () => {
    prisma.user.findUnique.mockResolvedValue(null)

    const res = await request(app).post('/api/auth/login').send({
      email: 'nobody@example.com',
      password: 'Password1!'
    })

    expect(res.status).toBe(401)
  })

  it('rejects wrong password with 401', async () => {
    const argon2 = require('argon2')
    argon2.verify.mockResolvedValueOnce(false)
    prisma.user.findUnique.mockResolvedValue({ id: 'user-1', email: 'test@example.com', password: 'hashed' })

    const res = await request(app).post('/api/auth/login').send({
      email: 'test@example.com',
      password: 'WrongPass1!'
    })

    expect(res.status).toBe(401)
  })
})
