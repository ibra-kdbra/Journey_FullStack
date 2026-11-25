// Run with: npm test (NODE_ENV=test, no database needed: models are stubbed).
import assert from 'node:assert/strict'
import { after, before, describe, it } from 'node:test'
import type { AddressInfo } from 'node:net'
import type { Server } from 'node:http'
import './setup'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

import app from '../src/app'
import { User } from '../src/models/User'
import { signToken } from '../src/services/TokenService'
import transporter from '../src/helpers/MailConfig'

const stub = <T extends object, K extends keyof T>(obj: T, key: K, fn: unknown) => {
    ;(obj as any)[key] = fn
}

let server: Server
let base: string

const call = (path: string, init: RequestInit = {}, token?: string) =>
    fetch(base + path, {
        ...init,
        headers: {
            'content-type': 'application/json',
            ...(token ? { authorization: `Bearer ${token}` } : {}),
        },
    })

before(() => {
    server = app.listen(0)
    base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`
    stub(User, 'findAll', async () => [{ id: 1, name: 'A', email: 'a@x.io' }])
    stub(User, 'findByPk', async (id: number) => ({ id, name: 'N', email: 'n@x.io' }))
    stub(User, 'update', async () => [1])
})
after(() => server.close())

const userToken = () => signToken(2)
const adminToken = () => signToken(1)

describe('anonymous callers get 401', () => {
    for (const [method, path] of [
        ['GET', '/users'],
        ['GET', '/users/2'],
        ['PUT', '/users/2'],
        ['GET', '/users/export/excel'],
        ['GET', '/users/export/pdf'],
        ['GET', '/users/orders/2'],
    ] as const) {
        it(`${method} ${path}`, async () => {
            const res = await call(path, { method, body: method === 'PUT' ? '{}' : undefined })
            assert.equal(res.status, 401)
        })
    }

    it('rejects garbage, wrongly signed and expired tokens', async () => {
        assert.equal((await call('/users/2', {}, 'not-a-jwt')).status, 401)
        const forged = jwt.sign({ sub: '1' }, 'another-secret')
        assert.equal((await call('/users', {}, forged)).status, 401)
        const expired = jwt.sign({ sub: '1' }, 'test-only-secret', { expiresIn: -10 })
        assert.equal((await call('/users', {}, expired)).status, 401)
        const none = jwt.sign({ sub: '1' }, '', { algorithm: 'none' })
        assert.equal((await call('/users', {}, none)).status, 401)
    })
})

describe('authorisation', () => {
    it('non-admin cannot list or export users (403)', async () => {
        assert.equal((await call('/users', {}, userToken())).status, 403)
        assert.equal((await call('/users/export/excel', {}, userToken())).status, 403)
    })

    it("a user cannot read, update or list orders of another user (403)", async () => {
        assert.equal((await call('/users/1', {}, userToken())).status, 403)
        assert.equal((await call('/users/orders/1', {}, userToken())).status, 403)
        const res = await call('/users/1', { method: 'PUT', body: JSON.stringify({ name: 'x' }) }, userToken())
        assert.equal(res.status, 403)
    })

    it('a user can read their own record', async () => {
        const res = await call('/users/2', {}, userToken())
        assert.equal(res.status, 200)
    })

    it('an admin can list users and read others', async () => {
        assert.equal((await call('/users', {}, adminToken())).status, 200)
        assert.equal((await call('/users/2', {}, adminToken())).status, 200)
    })

    it('admin status is not taken from the token', async () => {
        const t = jwt.sign({ sub: '2', isAdmin: true, role: 'admin' }, 'test-only-secret')
        assert.equal((await call('/users', {}, t)).status, 403)
    })
})

describe('exports', () => {
    it('admin gets the file as a download and it is not served statically', async () => {
        const res = await call('/users/export/excel', {}, adminToken())
        assert.equal(res.status, 200)
        assert.match(res.headers.get('content-disposition') ?? '', /users\.xlsx/)
        assert.equal((await call('/excel/export.xlsx')).status, 404)
        assert.equal((await call('/pdf/export.pdf')).status, 404)
    })
})

describe('password hash is never exposed', () => {
    it('User has a default scope excluding password', () => {
        assert.deepEqual((User as any).options.defaultScope, { attributes: { exclude: ['password'] } })
    })
})

describe('POST /auth/login', () => {
    it('returns a token for valid credentials and 401 otherwise', async () => {
        const hash = bcrypt.hashSync('password123pepper', 4)
        stub(User, 'unscoped', () => ({
            findOne: async ({ where }: any) =>
                where.email === 'u@x.io' ? { id: 2, email: 'u@x.io', password: hash } : null,
        }))
        const ok = await call('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email: 'u@x.io', password: 'password123' }),
        })
        assert.equal(ok.status, 200)
        const { token } = (await ok.json()) as { token: string }
        assert.equal((await call('/users/2', {}, token)).status, 200)

        const bad = await call('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email: 'u@x.io', password: 'wrong' }),
        })
        assert.equal(bad.status, 401)
        const unknown = await call('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email: 'nobody@x.io', password: 'password123' }),
        })
        assert.equal(unknown.status, 401)
    })
})

describe('profile update notification', () => {
    it('is sent to the updated user, not a fixed address', async () => {
        const sent: any[] = []
        const original = transporter.sendMail
        stub(transporter, 'sendMail', async (m: unknown) => void sent.push(m))
        try {
            const res = await call('/users/2', { method: 'PUT', body: JSON.stringify({ name: 'x' }) }, userToken())
            assert.equal(res.status, 200)
            assert.equal(sent.length, 1)
            assert.equal(sent[0].to, 'n@x.io')
        } finally {
            stub(transporter, 'sendMail', original)
        }
    })
})
